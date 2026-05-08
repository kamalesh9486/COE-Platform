---
name: analyze-and-normalize-apidata
description: Use when the user provides an API endpoint or raw API response without knowing
  the data structure or what the fields mean. Automatically fetches a sample, infers the
  full schema, classifies every field as a metric / dimension / temporal / identifier /
  low-value, filters noise, and produces a standardized NormalizedApiSchema ready for
  analytics, KPI cards, charts, or dashboards. Triggers on phrases like "analyze this API",
  "I don't know what this API returns", "figure out the structure of this endpoint",
  "what does this API give me", "normalize this API response", "I only have the API URL",
  "explore this endpoint", or any time a bare URL or raw JSON blob is handed over without
  an accompanying schema description. Always invoke BEFORE building any service or
  visualization from an unknown API.
---

# Analyze & Normalize API Data Skill

When a user hands you an API URL or a raw response with no description of what the data
means, this skill runs a structured five-step workflow to turn an opaque blob into a
clean, classified schema you can immediately wire into dashboards or service files.

Reference files:
- `reference/schema-inference.md` — field traversal algorithm and date-detection rules
- `reference/field-classifier.md` — metric / dimension / temporal / identifier rules
- `reference/normalized-schema.ts` — TypeScript interfaces for the output

---

## Five-Step Workflow

### Step 1 — Fetch a sample

If the user gave a URL, fetch it and capture the raw JSON.
If they pasted a raw response, use that directly.

- Fetch at least 1 response; if it's a list endpoint ask for up to **20 records** (`?limit=20`, `?per_page=20`, `?top=20` — try common pagination params)
- If auth is needed and no key is available, ask the user for a token before proceeding
- Save the raw response to context — never discard it, you'll need field-level samples

### Step 2 — Infer the schema

Read `reference/schema-inference.md` for the full traversal algorithm. Quick summary:

1. Detect the **envelope** — is the root an array, a `{ data: [...] }` wrapper, a `{ results: [...] }` wrapper, or a flat object?
2. Walk every field recursively using dot-notation paths (`user.address.city`)
3. For each field compute across all sampled records:
   - **type**: `number | string | boolean | date | array | object | null`
   - **nullRate**: fraction of records where the field is null/undefined/empty
   - **uniqueRate**: unique values ÷ total records (1.0 = all distinct, 0.0 = constant)
   - **sampleValues**: up to 5 representative non-null values

### Step 3 — Classify every field

Read `reference/field-classifier.md` for the full ruleset. Categories:

| Category | What it is |
|---|---|
| **metric** | Numeric, varies across records, not an ID |
| **dimension** | String/enum with low-to-medium cardinality, useful for grouping/filtering |
| **temporal** | Any date, datetime, timestamp, or unix epoch field |
| **identifier** | Primary/foreign keys — structurally useful but not analytics-meaningful |
| **low-value** | Constant, all-null, base64 blobs, internal system fields |

Fields with `nullRate > 0.8` are downgraded one level (metric → low-value, dimension → low-value).

### Step 4 — Spawn the Data Analyst agent

After classification, spawn a **general-purpose** agent with this exact brief:

```
You are a data analyst. I have fetched an API and inferred the following schema:

[paste the full classified field list from Step 3]

Sample records (up to 5):
[paste raw records]

Your tasks:
1. Confirm or correct the field classifications (metric / dimension / temporal / identifier / low-value)
2. Identify the most meaningful metrics for a business dashboard (top 3-5)
3. Identify the best dimensions for filtering and grouping (top 2-4)
4. Identify the primary time field if any
5. Suggest 2-3 chart types that would best represent this data (bar, line, donut, table, KPI card)
6. Flag any fields that look like computed/derived values the source system already calculates
7. Note any data quality concerns (missing values, inconsistent formats, ambiguous names)

Return a concise analyst report in this structure:
- Confirmed schema (field name → category)
- Top metrics
- Top dimensions
- Time field
- Suggested visualizations
- Data quality notes
```

Wait for the agent result before proceeding to Step 5.

### Step 5 — Emit the NormalizedApiSchema

Combine your inferred schema with the analyst's findings and output a `NormalizedApiSchema`
(see `reference/normalized-schema.ts` for the full interface).

Then produce three ready-to-use artifacts:

**A. Schema summary** (human-readable table)

| Field | Type | Category | Null% | Notes |
|---|---|---|---|---|
| `created_at` | date | temporal | 0% | Primary time axis |
| `revenue` | number | metric | 5% | Key KPI |
| … | | | | |

**B. TypeScript interface** for the record type — only analytics_ready fields + identifiers

```ts
export interface <DataName>Record {
  // generated from analytics_ready fields
}
```

**C. Next steps** — tell the user exactly what to do next:
- If they want to build a service file → "Use the `/api-integration` skill and copy the scaffold from `.claude/skills/api-integration/reference/api-patterns.md`"
- If they want a chart → "These fields map to: X-axis: `dimension`, Y-axis: `metric`, use Recharts `<BarChart>`"
- If they want a KPI card → "Use `metric` fields: `revenue`, `count`, `rate`"

---

## Output Contract

Always produce all three artifacts (schema table + TS interface + next steps).
Never skip Step 4 — the analyst agent catches misclassifications that pure heuristics miss.
Never expose API keys or auth tokens in the schema output.

---

## Connecting to other skills

After this skill completes, the user typically proceeds to one of:

- **`/api-integration`** — to build the production service file using the inferred schema
- **`/dewa-coe-platform`** — to wire the normalized data into a KPI card or chart tab

Tell the user which skill to invoke next based on what they said they want to build.
