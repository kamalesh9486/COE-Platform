# DEWA COE — Dataverse Integration Patterns

Patterns for fetching data from Dataverse (Microsoft Power Platform) in this React/TypeScript app.

---

## Generated Files Location

```
src/generated/
  index.ts                                      ← re-exports all models and services
  models/
    Cr978_powerbidashboardsModel.ts             ← type definitions + enum objects
    ...
  services/
    Cr978_powerbidashboardsService.ts           ← getAll(), getById(), etc.
    ...
```

Always import from `src/generated/` — never write manual fetch calls to Dataverse OData endpoints.

---

## Importing a Service and Model

```typescript
import {
  Cr978_powerbidashboardsService as DashboardService
} from '../generated/services/Cr978_powerbidashboardsService'

import type {
  Cr978_powerbidashboards as Dashboard
} from '../generated/models/Cr978_powerbidashboardsModel'

import {
  Cr978_powerbidashboardscr978_status  as STATUS_ENUM,
  Cr978_powerbidashboardscr978_phase   as PHASE_ENUM,
  Cr978_powerbidashboardscr978_priority as PRIORITY_ENUM,
} from '../generated/models/Cr978_powerbidashboardsModel'
```

Naming convention for generated files:
- Table logical name: `coe_powerbidashboards`
- Publisher prefix: `cr978_` (publisher customization prefix)
- Generated class: `Cr978_powerbidashboards` (Pascal-cased)
- Service class: `Cr978_powerbidashboardsService`
- Enum exports: `Cr978_powerbidashboardscr978_<columnname>`

---

## Enum Structure

Dataverse option sets are stored as integers. Generated enums are **reverse-mapped objects**:

```typescript
// Example from Cr978_powerbidashboardsModel.ts:
export const Cr978_powerbidashboardscr978_status = {
  0: 'Completed',
  1: 'InProgress',
  2: 'OnHold',
  3: 'NotStarted',
} as const

export const Cr978_powerbidashboardscr978_phase = {
  0: 'Completed',
  1: 'Deployment',
  2: 'Development',
  3: 'OnHold',
  4: 'UAT',
  5: 'Pending',
} as const

export const Cr978_powerbidashboardscr978_priority = {
  0: 'Medium',
  1: 'High',
  2: 'On_Hold',
  3: 'Low',
} as const
```

The field value on the record is a number (e.g. `r.cr978_status = 1`). Look up with `ENUM[r.cr978_status]`.

**Important:** Do NOT use `r.cr978_statusname` or other `*name` derived fields — use the numeric column directly with the enum.

---

## Enum Lookup Helper Pattern

```typescript
type StatusKey = 'Completed' | 'InProgress' | 'OnHold' | 'NotStarted'

const STATUS_CFG: Record<StatusKey, { color: string; icon: string; label: string }> = {
  Completed:  { color: '#007560', icon: 'bi-check-circle-fill', label: 'Completed'   },
  InProgress: { color: '#0ea5e9', icon: 'bi-play-circle-fill',  label: 'In Progress' },
  OnHold:     { color: '#ca8a04', icon: 'bi-pause-circle',      label: 'On Hold'     },
  NotStarted: { color: '#6b7280', icon: 'bi-clock',             label: 'Not Started' },
}

function getStatus(r: Dashboard): StatusKey {
  if (r.cr978_status == null) return 'NotStarted'
  const name = STATUS_ENUM[r.cr978_status]
  return (name in STATUS_CFG) ? name as StatusKey : 'NotStarted'
}

function getPhase(r: Dashboard): string {
  if (r.cr978_phase == null) return '—'
  return PHASE_ENUM[r.cr978_phase] ?? '—'
}
```

---

## Full Fetch Pattern (with cleanup, loading, error states)

```typescript
import { useState, useEffect } from 'react'

const [items, setItems]   = useState<Dashboard[]>([])
const [loading, setLoading] = useState(true)
const [error, setError]   = useState('')

useEffect(() => {
  let active = true
  setLoading(true)
  setError('')
  DashboardService.getAll()
    .then(res => {
      if (!active) return
      setItems(res.data ?? [])
      setLoading(false)
    })
    .catch((err: unknown) => {
      if (!active) return
      console.error('Failed to fetch dashboards', err)
      setError('Failed to load data. Please try again.')
      setLoading(false)
    })
  return () => { active = false }
}, [])
```

The `let active = true` / `return () => { active = false }` pattern prevents calling `setState` on an unmounted component if the page is navigated away before the fetch completes.

---

## Service API Reference

All services follow the same interface:

```typescript
// Get all records
DashboardService.getAll(): Promise<IOperationResult<Dashboard[]>>

// Get by primary key
DashboardService.getById(id: string): Promise<IOperationResult<Dashboard>>

// Create
DashboardService.create(record: Partial<Dashboard>): Promise<IOperationResult<Dashboard>>

// Update
DashboardService.update(id: string, record: Partial<Dashboard>): Promise<IOperationResult<Dashboard>>

// Delete
DashboardService.delete(id: string): Promise<IOperationResult<void>>
```

Access result data: `res.data` (may be `undefined` on error — always use `res.data ?? []` or `res.data ?? null`).

---

## Model Field Naming Convention

Dataverse fields are prefixed with the publisher prefix (`cr978_`):

```typescript
interface Dashboard {
  cr978_powerbidashboardsid: string   // primary key (GUID)
  cr978_name:                string   // display name
  cr978_description?:        string   // optional text
  cr978_launchlink?:         string   // URL field
  cr978_status?:             number   // option set → use STATUS_ENUM[value]
  cr978_phase?:              number   // option set → use PHASE_ENUM[value]
  cr978_priority?:           number   // option set → use PRIORITY_ENUM[value]
  // ... other columns
}
```

Check the generated model file for the complete list of fields on any table.

---

## Derived State with useMemo

Always derive counts and filtered lists with `useMemo` — never compute inline in JSX.

```typescript
const counts = useMemo(() => {
  const c: Record<string, number> = {}
  for (const item of items) {
    const key = getStatus(item)
    c[key] = (c[key] ?? 0) + 1
  }
  return c
}, [items])

const filtered = useMemo(() =>
  items
    .filter(r => statusFilter === 'All' || getStatus(r) === statusFilter)
    .sort((a, b) => (b.cr978_launchlink ? 1 : 0) - (a.cr978_launchlink ? 1 : 0)),
  [items, statusFilter]
)

const donutData = useMemo(() =>
  Object.entries(STATUS_CFG)
    .map(([key, cfg]) => ({ name: cfg.label, value: counts[key] ?? 0, color: cfg.color }))
    .filter(d => d.value > 0),
  [counts]
)
```

---

## OData Notes

- The `getAll()` method uses the Dataverse Web API. Power Apps SDK handles authentication automatically.
- For complex queries (expand, filter, select), use the service's advanced overloads if available, or look at what the generated service exposes.
- The app runs inside Power Apps — no CORS or auth token management needed; the SDK context handles it.

---

## Adding a New Dataverse Table

1. Define the table in `.power/schemas/appschemas/dataSourcesInfo.ts` (Power Apps schema config).
2. Run the code generator (Power Apps toolchain) to produce the model + service in `src/generated/`.
3. Import and use following the patterns above.
4. The schema JSON file will appear at `.power/schemas/dataverse/<tablename>.Schema.json` automatically.
