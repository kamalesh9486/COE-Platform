# DEWA COE — Component Patterns

Concrete JSX + CSS for common components in the DEWA COE AI Intelligence Platform.

---

## KPI Card (acc-kpi-card)

### JSX
```tsx
// Define accent colors per status
const STATUS_CFG: Record<string, { color: string; icon: string; label: string }> = {
  Completed:  { color: '#007560', icon: 'bi-check-circle-fill', label: 'Completed' },
  InProgress: { color: '#0ea5e9', icon: 'bi-play-circle-fill',  label: 'In Progress' },
  OnHold:     { color: '#ca8a04', icon: 'bi-pause-circle',      label: 'On Hold' },
  NotStarted: { color: '#6b7280', icon: 'bi-clock',             label: 'Not Started' },
}

// Total card — clickable to reset filter
<div
  className={`acc-kpi-card acc-kpi-card--clickable${statusFilter === 'All' ? ' acc-kpi-card--active' : ''}`}
  style={{ '--acc-accent': '#007560' } as React.CSSProperties}
  onClick={() => setStatusFilter('All')}
>
  <div className="acc-kpi-icon">
    <Icon name="bi-bar-chart-fill" aria-hidden="true" />
  </div>
  <div className="acc-kpi-value">{items.length}</div>
  <div className="acc-kpi-label">Total Dashboards</div>
</div>

// Status card — clickable to filter
{Object.entries(STATUS_CFG).map(([key, cfg]) => (
  <div
    key={key}
    className={`acc-kpi-card acc-kpi-card--clickable${statusFilter === key ? ' acc-kpi-card--active' : ''}`}
    style={{ '--acc-accent': cfg.color } as React.CSSProperties}
    onClick={() => setStatusFilter(statusFilter === key ? 'All' : key as StatusKey)}
  >
    <div className="acc-kpi-icon">
      <Icon name={cfg.icon} aria-hidden="true" />
    </div>
    <div className="acc-kpi-value">{counts[key] ?? 0}</div>
    <div className="acc-kpi-label">{cfg.label}</div>
  </div>
))}
```

### CSS
```css
.acc-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.acc-kpi-card {
  background: var(--surface);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 20px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.18s, transform 0.18s;
}

.acc-kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--acc-accent, var(--dewa-green));
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.acc-kpi-card--clickable {
  cursor: pointer;
}

.acc-kpi-card--clickable:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.acc-kpi-card--active {
  border-color: var(--acc-accent, var(--dewa-green));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--acc-accent, var(--dewa-green)) 18%, transparent), var(--shadow-card-hover);
}

.acc-kpi-icon {
  font-size: 18px;
  color: var(--acc-accent, var(--dewa-green));
  line-height: 1;
  display: flex;
  align-items: center;
}

.acc-kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
}

.acc-kpi-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
```

---

## Content Card (acc-card)

Used for charts, tables, and lists.

### JSX
```tsx
<div className="acc-card">
  <div className="acc-card-header">
    <div className="acc-card-title">
      <Icon name="bi-pie-chart-fill" aria-hidden="true" />
      Chart Title
    </div>
  </div>
  <div className="acc-card-body">
    {/* content */}
  </div>
</div>
```

### CSS
```css
.acc-card {
  background: var(--surface);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.acc-card-header {
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--border-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.acc-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.acc-card-body {
  padding: 20px;
}
```

---

## Filter Bar

```tsx
<div className="acc-filter-bar">
  <Icon name="bi-funnel-fill" aria-hidden="true" />
  <select
    className="acc-select"
    value={statusFilter}
    onChange={e => setStatusFilter(e.target.value as StatusKey | 'All')}
  >
    <option value="All">All Statuses</option>
    {Object.entries(STATUS_CFG).map(([key, cfg]) => (
      <option key={key} value={key}>{cfg.label}</option>
    ))}
  </select>
  <span className="acc-filter-count">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
</div>
```

```css
.acc-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: var(--text-muted);
  font-size: 13px;
}

.acc-select {
  padding: 6px 12px;
  border: 1px solid var(--border-card);
  border-radius: var(--radius-btn);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.acc-select:focus {
  border-color: var(--dewa-green);
  box-shadow: 0 0 0 2px rgba(0,117,96,0.12);
}

.acc-filter-count {
  color: var(--text-dim);
  font-size: 12px;
  margin-left: auto;
}
```

---

## Dashboard Item Card (with launch link)

```tsx
<div className="acc-dash-card">
  <div className="acc-dash-card-header">
    <div className="acc-dash-card-title">{item.cr978_name}</div>
    <span
      className="acc-status-badge"
      style={{ '--badge-color': STATUS_CFG[getStatus(item)].color } as React.CSSProperties}
    >
      {STATUS_CFG[getStatus(item)].label}
    </span>
  </div>
  {item.cr978_description && (
    <p className="acc-dash-card-desc">{item.cr978_description}</p>
  )}
  <div className="acc-dash-card-footer">
    <span className="acc-dash-phase">{item.cr978_phase != null ? PHASE_ENUM[item.cr978_phase] : '—'}</span>
    {item.cr978_launchlink && (
      <a
        className="acc-launch-btn"
        href={item.cr978_launchlink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="bi-box-arrow-up-right" aria-hidden="true" />
        Launch
      </a>
    )}
  </div>
</div>
```

```css
.acc-dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.acc-dash-card {
  background: var(--surface);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-card);
  padding: 18px 20px 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.18s, transform 0.15s;
}

.acc-dash-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.acc-dash-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.acc-dash-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
  flex: 1;
}

.acc-status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--badge-color) 12%, transparent);
  color: var(--badge-color);
  white-space: nowrap;
  flex-shrink: 0;
}

.acc-dash-card-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.acc-dash-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}

.acc-dash-phase {
  font-size: 12px;
  color: var(--text-dim);
}

.acc-launch-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: var(--dewa-green);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-btn);
  text-decoration: none;
  transition: background 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.acc-launch-btn:hover {
  background: var(--dewa-teal);
  transform: translateY(-1px);
}
```

---

## Charts Row Layout

```tsx
const TOOLTIP_STYLE = {
  background: 'rgba(28,28,30,0.93)',
  borderRadius: 9,
  padding: '8px 14px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
}

<div className="acc-charts-row">
  <div className="acc-card">
    <div className="acc-card-header">
      <div className="acc-card-title">
        <Icon name="bi-pie-chart-fill" aria-hidden="true" />
        Status Distribution
      </div>
    </div>
    <div className="acc-card-body">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
            dataKey="value" paddingAngle={3}>
            {donutData.map(d => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v: number, name: string) => [v, name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="acc-legend">
        {donutData.map(d => (
          <div key={d.name} className="acc-legend-item">
            <span className="acc-legend-dot" style={{ background: d.color }} />
            <span>{d.name}</span>
            <span className="acc-legend-val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  <div className="acc-card">
    <div className="acc-card-header">
      <div className="acc-card-title">
        <Icon name="bi-bar-chart-fill" aria-hidden="true" />
        By Phase
      </div>
    </div>
    <div className="acc-card-body">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,117,96,0.1)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={90}
            tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" fill="var(--dewa-green)" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
```

```css
.acc-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.acc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 12px;
  justify-content: center;
}

.acc-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-muted);
}

.acc-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.acc-legend-val {
  font-weight: 600;
  color: var(--text);
}

@media (max-width: 768px) {
  .acc-charts-row { grid-template-columns: 1fr; }
}
```

---

## Page Shell (Loading / Error / Empty states)

```tsx
export default function MyPage() {
  const [items, setItems] = useState<MyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    MyService.getAll().then(res => {
      if (!active) return
      setItems(res.data ?? [])
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setError('Failed to load data.')
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  if (loading) return (
    <div className="acc-state-center">
      <div className="acc-spinner" />
      <span>Loading…</span>
    </div>
  )

  if (error) return (
    <div className="acc-state-center acc-state-error">
      <Icon name="bi-exclamation-triangle-fill" aria-hidden="true" />
      {error}
    </div>
  )

  if (!items.length) return (
    <div className="acc-state-center">
      <Icon name="bi-inbox" aria-hidden="true" />
      <span>No data found.</span>
    </div>
  )

  return <div className="acc-page">{/* page content */}</div>
}
```

```css
.acc-page {
  padding: 24px;
}

.acc-state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 300px;
  color: var(--text-muted);
  font-size: 15px;
}

.acc-state-error {
  color: #dc2626;
}

.acc-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border-card);
  border-top-color: var(--dewa-green);
  border-radius: 50%;
  animation: acc-spin 0.75s linear infinite;
}

@keyframes acc-spin {
  to { transform: rotate(360deg); }
}
```

---

## Launch Screen Button

```tsx
<button
  className={`ls-launch-btn${launching ? ' ls-launch-btn--go' : ''}`}
  onClick={handleLaunch}
  disabled={launching}
>
  <span className="ls-launch-text">
    {launching ? 'Initialising…' : 'Enter Intelligence Platform'}
  </span>
  <span className="ls-launch-icon">
    {launching ? (
      <svg className="ls-launch-spinner" viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray="40 20" strokeLinecap="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd"/>
      </svg>
    )}
  </span>
</button>
```

```css
.ls-launch-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--dewa-green);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
  box-shadow: 0 4px 18px rgba(0,117,96,0.35);
}

.ls-launch-btn:hover:not(:disabled) {
  background: var(--dewa-teal);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,117,96,0.4);
}

.ls-launch-btn--go {
  background: var(--dewa-teal);
  opacity: 0.85;
}

.ls-launch-btn:disabled {
  cursor: not-allowed;
}

.ls-launch-spinner {
  animation: ls-spin 0.75s linear infinite;
}

@keyframes ls-spin {
  to { transform: rotate(360deg); }
}
```
