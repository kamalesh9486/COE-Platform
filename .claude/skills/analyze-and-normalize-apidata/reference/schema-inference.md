# Schema Inference Algorithm

Use this algorithm in Step 2 of the analyze_and_normalize_api_data workflow.

---

## 1. Detect the envelope

Before walking fields, determine the root shape:

| Pattern | Envelope type | Records array path |
|---|---|---|
| Root is `[...]` | raw array | `.` (root) |
| `{ "data": [...] }` | data-wrapper | `.data` |
| `{ "results": [...] }` | results-wrapper | `.results` |
| `{ "items": [...] }` | items-wrapper | `.items` |
| `{ "value": [...] }` | OData / Graph API | `.value` |
| `{ "records": [...] }` | records-wrapper | `.records` |
| Root is `{...}` (no array) | single object | treat as 1-record array |

After detecting the envelope, extract the records array and work with that.
Note the envelope shape in `NormalizedApiSchema.envelopeType`.

---

## 2. Recursive field traversal

```
function inferFields(records: unknown[], parentPath = ''):
  fieldMap = {}

  for each record in records:
    walk(record, parentPath, fieldMap)

  return fieldMap

function walk(node, path, fieldMap):
  if node is null or undefined:
    fieldMap[path].nullCount++
    return

  if node is array:
    if elements are objects:
      # nested array of objects — recurse with array notation
      for each element in node (up to 10):
        walk(element, path + '[]', fieldMap)
    else:
      # array of primitives — treat as a single "array of values" field
      fieldMap[path].type = 'array<primitive>'
    return

  if node is object:
    for each [key, value] of node:
      walk(value, path ? path + '.' + key : key, fieldMap)
    return

  # primitive (string, number, boolean)
  entry = fieldMap[path] ?? { values: [], nullCount: 0, totalCount: 0 }
  entry.totalCount++
  entry.values.push(node)    # keep all for uniqueRate calc
  fieldMap[path] = entry
```

Collect across all sampled records, then compute per-field stats:
- `nullRate = nullCount / totalRecords`
- `uniqueRate = new Set(values).size / values.length`
- `sampleValues = values.slice(0, 5)` (first 5 non-null)

---

## 3. Type detection

For each leaf field, infer `type` from the collected values:

```
function detectType(values: unknown[]): FieldType:
  nonNull = values.filter(v => v !== null && v !== undefined)
  if nonNull.length === 0: return 'null'

  types = new Set(nonNull.map(typeof))

  if types has 'number':      return 'number'
  if types has 'boolean':     return 'boolean'
  if types has 'string':
    if all nonNull pass isDateString(): return 'date'
    return 'string'
  return 'unknown'
```

### Date string heuristics (`isDateString`)

A string is classified as `date` if it matches **any** of these patterns:

| Pattern | Example |
|---|---|
| ISO 8601 full | `2024-03-15T10:30:00Z` |
| ISO 8601 date only | `2024-03-15` |
| ISO 8601 with offset | `2024-03-15T10:30:00+04:00` |
| Unix timestamp (number) | `1710497400` (10-digit number in 2000–2100 range) |
| Unix ms timestamp | `1710497400000` (13-digit) |
| OData date | `/Date(1710497400000)/` |
| RFC 2822 | `Thu, 15 Mar 2024 10:30:00 +0000` |

Also check **field name** as a secondary signal:
- Ends with `_at`, `_on`, `_date`, `_time`, `At`, `On`, `Date`, `Time`
- Named exactly: `created`, `updated`, `modified`, `published`, `timestamp`, `date`, `time`

If the name signal matches but the value doesn't look like a date, flag as `string` with a note.

---

## 4. Handling deeply nested structures

For objects nested more than 3 levels deep:
- Continue traversal but flag paths with `depth >= 3` in `normalizationNotes`
- Suggest flattening in the service layer before consuming in a component

For arrays of objects nested inside records (e.g., `order.items[].price`):
- Traverse but mark as `nestedArray: true`
- These fields are typically not directly chartable — note that aggregation is needed

---

## 5. Sample size guidance

| API returns | Recommended sample |
|---|---|
| Single object | Use as-is (1 record) |
| Small list (< 20) | Use all |
| Large list | Request 20 records, use all 20 |
| Paginated | Fetch page 1 only; note `isPaginated: true` |
| Streaming / websocket | Ask user to paste a captured sample |

Fewer than 5 records means uniqueRate and nullRate stats are unreliable — note this in `normalizationNotes`.
