# Field Classification Rules

Use these rules in Step 3 of the analyze_and_normalize_api_data workflow.
Apply them in order — the first matching rule wins.

---

## Classification Decision Tree

```
Is the field all-null (nullRate = 1.0)?
  → LOW-VALUE (discard)

Is the field constant (uniqueRate = 0.0, same value in every record)?
  → LOW-VALUE (constant field)

Does the field name or value match the LOW-VALUE patterns below?
  → LOW-VALUE

Does the field match TEMPORAL patterns?
  → TEMPORAL

Does the field match IDENTIFIER patterns?
  → IDENTIFIER

Is the type 'number' and uniqueRate > 0.05?
  → METRIC

Is the type 'string' and uniqueRate <= 0.4?
  → DIMENSION

Is the type 'boolean'?
  → DIMENSION (binary flag, useful as a filter)

Is the type 'string' and uniqueRate > 0.4?
  → check IDENTIFIER patterns; if not → LOW-VALUE (high-cardinality free text)

Else
  → LOW-VALUE (arrays of primitives, deep nested objects, unknown)
```

---

## TEMPORAL patterns

**Type signals:**
- inferred type is `date` (from schema-inference date detection)
- type is `number` and value is a 10-digit or 13-digit integer in the valid unix range (2000–2100)

**Name signals** (case-insensitive, match anywhere in field name):
```
_at  _on  _date  _time  _ts  _timestamp
created  updated  modified  published  deleted  expires  started  ended
date  time  timestamp  datetime  epoch  period
```

**Examples:** `created_at`, `updatedOn`, `publishDate`, `startTime`, `ts`, `event_timestamp`

---

## IDENTIFIER patterns

**Name signals** (case-insensitive):
```
# Exact match or suffix/prefix match
id  _id  id_  uuid  guid  key  _key  key_  ref  _ref  ref_
# Prefix match
pk_  fk_  cr978_
# Suffix match
_pk  _fk  _uid  _sid  _num  _no  _code (when uniqueRate > 0.8)
```

**Value signals:**
- All values match UUID regex: `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
- All values are numeric strings that increment monotonically
- All values match `ObjRef` / `EntityRef` patterns from OData

**Override:** Even if a numeric field has a name like `product_id`, classify as IDENTIFIER not METRIC — IDs are never summed or averaged.

---

## METRIC patterns

Primary criteria:
- type is `number`
- uniqueRate > 0.05 (more than 5% distinct — varies, not constant)
- Does NOT match IDENTIFIER name patterns

Boosts (raise confidence this is a real metric):
- Name contains: `count  total  sum  avg  mean  rate  ratio  score  amount  value  revenue  cost  price  percentage  pct  %  duration  latency  ms  seconds  hours  qty  quantity  volume  weight`
- Name ends with `s` and value can be a count (non-negative integers)

Downgrades to LOW-VALUE if:
- All values are the same (uniqueRate = 0) — constant
- nullRate > 0.8 — mostly missing

---

## DIMENSION patterns

Primary criteria:
- type is `string` or `boolean`
- uniqueRate <= 0.4 (≤40% unique — repeated values indicate categories)
- Does NOT match IDENTIFIER or TEMPORAL patterns

Strong dimension signals (name contains):
```
type  status  state  stage  category  kind  group  class  tier  level
department  division  region  country  city  zone  team  role  owner
priority  severity  label  tag  flag  mode  platform  channel  source
```

**Cardinality guidance** for UI:
- uniqueRate 0–0.05 and ≤10 distinct values → ideal filter dropdown
- uniqueRate 0.05–0.2 and ≤50 distinct values → searchable select
- uniqueRate 0.2–0.4 → still a dimension but high cardinality; note in schema

---

## LOW-VALUE patterns

**Name signals** (fields to always discard):
```
# Internal system fields
^_  ^__  __v  __typename  _etag  @odata.  @context  @metadata

# Encoding / binary content
thumbnail  avatar  image_data  photo_data  base64  blob  binary  encoded

# Verbose metadata unlikely to be charted
description  body  content  html  markdown  notes  comments  message  detail
summary  raw  payload  debug  trace  stack  log

# Auth / security tokens (never include in schema output)
token  secret  password  hash  salt  signature  auth  bearer  jwt  key (when high entropy)

# Redundant locale/format fields
locale  timezone  tz  currency_symbol  format  display_name (when a code field already exists)
```

**Value signals:**
- All values are empty strings `""`
- All values are the string `"null"` or `"N/A"` or `"undefined"`
- Values are clearly base64 (length > 100, char set matches base64 alphabet)
- Values are HTML blobs (start with `<`, contain `</`)

---

## Null rate downgrade rules

| Original category | nullRate threshold | Downgraded to |
|---|---|---|
| metric | > 0.8 | low-value |
| dimension | > 0.8 | low-value |
| temporal | > 0.5 | low-value (flag as unreliable time axis) |
| identifier | > 0.5 | low-value |

---

## analytics_ready flag

Set `analytics_ready = true` if:
- category is `metric` OR `dimension` OR `temporal`
- AND nullRate < 0.5
- AND the field is NOT nested inside an array (path does not contain `[]`)

All other fields: `analytics_ready = false`
