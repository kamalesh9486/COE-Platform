---
name: dewa-coe-platform
description: Build and extend the DEWA COE AI Intelligence Platform — a React/TypeScript Power Apps frontend with a dark green sidebar, white content cards, Dataverse integration, and Recharts data visualisations. Use this skill whenever adding a new tab, creating KPI cards, fetching Dataverse data, building charts, or following the app's design system. Trigger for requests mentioning dashboards, new pages, KPI cards, filters, Dataverse tables, Power Apps, or any UI work in this project.
---

# DEWA COE AI Intelligence Platform — Universal Skill

This is a React 18 + TypeScript app embedded in Power Apps (Microsoft Power Platform). It uses Dataverse OData services, Recharts for charts, and Bootstrap Icons via a local SVG map.

Read `reference/component-patterns.md` for full JSX + CSS code. Read `reference/dataverse-patterns.md` for Dataverse fetch, enums, and service templates.

---

## Design Tokens (from `src/layout.css :root`)

```css
/* Brand */
--dewa-green:         #007560   /* primary accent — buttons, active states, highlights */
--dewa-gold:          #ca8a04   /* secondary accent — warnings, gold highlights */
--dewa-gold-light:    #f6c343   /* sidebar active text */
--dewa-teal:          #004937
--dewa-navy:          #1c1c1e

/* Sidebar */
--sidebar-bg-from:    #001f18
--sidebar-bg-mid:     #002d22
--sidebar-bg-to:      #003828
--sb-text:            rgba(255,255,255,0.60)
--sb-text-hover:      rgba(255,255,255,0.92)
--sb-text-active:     #f6c343

/* Page background */
--bg:                 #edf2f0
--bg2:                #e4ebe7

/* Surfaces */
--surface:            #ffffff
--surface-2:          rgba(255,255,255,0.85)
--surface-hover:      rgba(255,255,255,0.97)

/* Borders */
--border:             rgba(0,117,96,0.13)
--border-card:        rgba(0,117,96,0.16)

/* Text */
--text:               #1c1c1e
--text-muted:         #5a6672
--text-dim:           #9ca3af

/* Cards */
--radius-card:        14px
--radius-btn:         9px
--shadow-card:        0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)
--shadow-card-hover:  0 8px 28px rgba(0,0,0,0.11), 0 2px 6px rgba(0,0,0,0.06)

/* Layout */
--sidebar-width:      264px
--sidebar-collapsed:  68px
--topbar-height:      62px
```

**Font:** `'Dubai', system-ui, -apple-system, sans-serif` — Dubai is a system font on Windows/UAE devices; no import needed.

---

## UX Principles

1. **Dark sidebar, light content** — Sidebar is `#001f18 → #003828` gradient. Page background is `#edf2f0`. Cards are `#ffffff`.
2. **Cards over tables** — Use `content-card` + `stat-card` global CSS classes (defined in `layout.css`) for consistency. Never use plain `<div>` boxes without the card pattern.
3. **Filter before table** — When filtering a list, put the filter control (select dropdown or pill row) above the data, not in a sidebar.
4. **Links first** — When sorting items with launch links vs. without, always sort items with links to the top: `.sort((a, b) => (b.link ? 1 : 0) - (a.link ? 1 : 0))`.
5. **Icon safety** — The `Icon` component (`src/components/Icon.tsx`) uses a **local SVG map** — not a CDN. Always `grep "bi-name"` in `Icon.tsx` before using any icon name. Using an unregistered name renders nothing.
6. **CSS variable first** — Never hardcode colors. Always use `var(--dewa-green)`, `var(--surface)`, `var(--border-card)`, etc. Use `--acc-accent` as a per-component accent injection (see KPI card pattern).

---

## Adding a New Tab — 5-Step Checklist

1. **`src/components/Sidebar.tsx`** — Add `'tab-id'` to `TabId` union type, add entry to `NAV_ITEMS` (with `icon` or `svgIcon`), add entry to `PAGE_TITLES`.
2. **`src/components/Layout.tsx`** — Add `import MyPage from '../pages/MyPage'` and a `case 'tab-id': return <MyPage />` to `renderPage()`.
3. **`src/pages/MyPage.tsx`** — Create the page component. Import its CSS file at the top.
4. **`src/my-page.css`** — Create the CSS file using `var(--...)` tokens throughout.
5. Test: sidebar item appears, clicking it renders the page, no TypeScript errors.

### NAV_ITEMS entry with Bootstrap icon:
```typescript
{ id: 'my-tab' as TabId, label: 'My Tab', icon: 'bi-bar-chart-fill' }
```

### NAV_ITEMS entry with custom SVG icon:
```typescript
{
  id: 'my-tab' as TabId,
  label: 'My Tab',
  svgIcon: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="nav-icon">
      {/* your SVG paths */}
    </svg>
  ),
}
```
Render guard in Sidebar: `{'svgIcon' in item ? item.svgIcon : <Icon name={item.icon} className="nav-icon" />}`

---

## KPI Card Pattern

KPI cards use a CSS custom property `--acc-accent` for per-card color. Clickable cards get `acc-kpi-card--clickable` + `acc-kpi-card--active` classes.

```tsx
<div
  className={`acc-kpi-card${clickable ? ' acc-kpi-card--clickable' : ''}${isActive ? ' acc-kpi-card--active' : ''}`}
  style={{ '--acc-accent': '#007560' } as React.CSSProperties}
  onClick={clickable ? handleClick : undefined}
>
  <div className="acc-kpi-icon">
    <Icon name="bi-bar-chart-fill" aria-hidden="true" />
  </div>
  <div className="acc-kpi-value">{count}</div>
  <div className="acc-kpi-label">Label Text</div>
</div>
```

See `reference/component-patterns.md` for full CSS.

---

## Chart Patterns

Uses **Recharts**. Always extract tooltip style to a constant to avoid duplication:

```typescript
const TOOLTIP_STYLE = {
  background: 'rgba(28,28,30,0.93)',
  borderRadius: 9,
  padding: '8px 14px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
}
```

**Status Donut:**
```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={200}>
  <PieChart>
    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
      {donutData.map(d => <Cell key={d.name} fill={d.color} />)}
    </Pie>
    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, name: string) => [v, name]} />
  </PieChart>
</ResponsiveContainer>
```

**Phase Horizontal Bar:**
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={180}>
  <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 16 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,117,96,0.1)" horizontal={false} />
    <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
    <Tooltip contentStyle={TOOLTIP_STYLE} />
    <Bar dataKey="value" fill="var(--dewa-green)" radius={[0, 4, 4, 0]} barSize={16} />
  </BarChart>
</ResponsiveContainer>
```

---

## Complex Logic Patterns

### Dataverse Fetch with Cleanup
```typescript
useEffect(() => {
  let active = true
  setLoading(true)
  MyService.getAll().then(res => {
    if (!active) return
    setItems(res.data ?? [])
    setLoading(false)
  })
  return () => { active = false }
}, [])
```

### Enum Lookup (Dataverse numeric option sets)
```typescript
// Enums are reverse-mapped: { 0: 'Completed', 1: 'InProgress', ... }
function getStatus(r: MyModel): StatusKey {
  if (r.cr978_status == null) return 'Default'
  const name = STATUS_ENUM[r.cr978_status]
  return (name in STATUS_CFG) ? name as StatusKey : 'Default'
}
```

### useMemo for Derived State
```typescript
const filtered = useMemo(() =>
  items
    .filter(r => filter === 'All' || getStatus(r) === filter)
    .sort((a, b) => (b.cr978_launchlink ? 1 : 0) - (a.cr978_launchlink ? 1 : 0)),
  [items, filter]
)

const counts = useMemo(() => ({
  total: items.length,
  active: items.filter(r => getStatus(r) === 'Active').length,
}), [items])
```

### useRef Timer Cleanup (prevents memory leaks on unmount)
```typescript
const launchTimer = useRef(0)
useEffect(() => () => clearTimeout(launchTimer.current), [])

function handleClick() {
  launchTimer.current = window.setTimeout(callback, 700)
}
```

### RAF-Based Ease-Out Counter (animated numbers)
```typescript
function useCounter(target: number, duration: number, go: boolean): number {
  const [val, setVal] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    if (!go) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, go])
  return val
}
```

---

## Dataverse Integration

Service files are auto-generated in `src/generated/`. See `reference/dataverse-patterns.md` for:
- Full fetch template with error state
- Enum import pattern and reverse-map lookup
- OData expand/filter syntax
- Loading / empty / error state rendering

---

## Filter Bar Pattern

```tsx
<div className="acc-filter-bar">
  <Icon name="bi-funnel-fill" aria-hidden="true" />
  <select
    className="acc-select"
    value={filter}
    onChange={e => setFilter(e.target.value as FilterKey)}
  >
    <option value="All">All Statuses</option>
    {Object.keys(STATUS_CFG).map(k => (
      <option key={k} value={k}>{k}</option>
    ))}
  </select>
  <span className="acc-filter-count">{filtered.length} items</span>
</div>
```

---

## What NOT to Do

- **No hardcoded colors** — always `var(--dewa-green)`, not `#007560` inline.
- **No unverified icon names** — grep `Icon.tsx` first. `bi-grid-3x3-gap-fill` and `bi-circle` are NOT registered.
- **No naked fetch without cleanup** — always use `let active = true` pattern in `useEffect`.
- **No duplicate tooltip styles** — extract to a shared `const TOOLTIP_STYLE` constant.
- **No empty `icon: ''` on nav items** that use `svgIcon` — the field is dead code, omit it.
- **No `setState` on unmounted components** — always check `if (!active) return` in async callbacks.
- **No inline enum values** — import from `src/generated/models/`, don't hardcode `{ 0: 'Completed' }`.

---

## Quick Start: New Dashboard Tab

```
1. Add 'my-tab' to TabId union          → src/components/Sidebar.tsx
2. Add to NAV_ITEMS + PAGE_TITLES       → src/components/Sidebar.tsx
3. Add case to renderPage()             → src/components/Layout.tsx
4. Create src/pages/MyTab.tsx           → import service, useEffect fetch, useMemo counts
5. Create src/my-tab.css                → use var(--...) tokens, acc-* class prefix
```
