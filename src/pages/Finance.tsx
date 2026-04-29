import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import '../finance.css'
import Icon from '../components/Icon'
import { Cr978_coe_divisionsService } from '../generated'
import type { Cr978_coe_divisions } from '../generated/models/Cr978_coe_divisionsModel'

// ── Types ─────────────────────────────────────────────────────────────────────

type FinStatus = 'Under Budget' | 'On Track' | 'At Risk' | 'Over Budget'

interface DivisionFinance {
  id: string
  name: string
  code: string
  status: string        // division active/inactive status from Dataverse
  // static finance values
  budgetM: number       // Allocated budget (AED millions)
  spentM: number        // Actual spend to date
  forecastM: number     // Year-end forecast
  projects: number      // Number of AI projects
  yoyPct: number        // Year-over-year change %
}

// ── Static finance seed data (merged with real division names) ────────────────
// Index 0 = first division returned, etc. Extra divisions get auto-generated values.

const FINANCE_SEED: Omit<DivisionFinance, 'id' | 'name' | 'code' | 'status'>[] = [
  { budgetM: 28.0, spentM: 24.5, forecastM: 27.3, projects: 14, yoyPct:  12.5 },
  { budgetM: 32.0, spentM: 30.2, forecastM: 31.5, projects: 16, yoyPct:  18.4 },
  { budgetM: 22.5, spentM: 18.3, forecastM: 22.1, projects: 11, yoyPct:   6.3 },
  { budgetM: 18.5, spentM: 17.5, forecastM: 18.8, projects:  9, yoyPct:  22.8 },
  { budgetM: 12.5, spentM:  9.2, forecastM: 11.8, projects:  8, yoyPct:   8.2 },
  { budgetM: 10.2, spentM:  7.6, forecastM:  9.5, projects:  6, yoyPct:   9.7 },
  { budgetM:  8.0, spentM:  5.8, forecastM:  7.6, projects:  5, yoyPct:  14.1 },
  { budgetM:  6.5, spentM:  4.1, forecastM:  5.9, projects:  4, yoyPct:   5.2 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function utilPct(d: DivisionFinance) {
  return Math.round((d.spentM / d.budgetM) * 100)
}

function finStatus(d: DivisionFinance): FinStatus {
  const p = utilPct(d)
  if (p > 100) return 'Over Budget'
  if (p >= 92) return 'At Risk'
  if (p >= 70) return 'On Track'
  return 'Under Budget'
}

const STATUS_C: Record<FinStatus, { color: string; bg: string; border: string; bar: string }> = {
  'Under Budget': { color: '#007560', bg: 'rgba(0,117,96,0.08)',   border: 'rgba(0,117,96,0.2)',   bar: '#007560' },
  'On Track':     { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)',   border: 'rgba(202,138,4,0.2)',  bar: '#ca8a04' },
  'At Risk':      { color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.22)', bar: '#ea580c' },
  'Over Budget':  { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.22)', bar: '#dc2626' },
}

const DIV_PALETTE = [
  '#007560', '#004937', '#ca8a04', '#ea580c',
  '#0891b2', '#7c3aed', '#b45309', '#15803d',
  '#0e7490', '#6d28d9', '#9a3412', '#166534',
]

function fmtM(v: number) {
  return `AED ${v.toFixed(1)}M`
}

function mapDivision(raw: Cr978_coe_divisions, idx: number): DivisionFinance {
  const seed = FINANCE_SEED[idx] ?? {
    budgetM:   +(8 + idx * 2.5).toFixed(1),
    spentM:    +(6 + idx * 2.0).toFixed(1),
    forecastM: +(7.5 + idx * 2.3).toFixed(1),
    projects:  3 + idx,
    yoyPct:    +(5 + idx * 1.5).toFixed(1),
  }
  return {
    id:       raw.cr978_coe_divisionid,
    name:     raw.cr978_divisionname,
    code:     raw.cr978_divisioncode ?? `DIV-${String(idx + 1).padStart(2, '0')}`,
    status:   raw.cr978_isactive === false ? 'Inactive' : 'Active',
    ...seed,
  }
}

// ── Custom tooltips ───────────────────────────────────────────────────────────

function BarTip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(28,28,30,0.93)', borderRadius: 9, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', minWidth: 160 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>AED {p.value}M</span>
        </div>
      ))}
    </div>
  )
}

function PieTip({ active, payload }: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{ background: 'rgba(28,28,30,0.93)', borderRadius: 9, padding: '8px 14px' }}>
      <div style={{ fontSize: 11, color: p.payload.color, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AED {p.value.toFixed(1)}M</div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Finance() {
  const [divisions, setDivisions] = useState<DivisionFinance[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState<FinStatus | 'All'>('All')
  const [year, setYear] = useState('2026')

  useEffect(() => {
    Cr978_coe_divisionsService.getAll()
      .then(result => {
        if (result.data) {
          setDivisions(result.data.map((r, i) => mapDivision(r, i)))
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to load divisions for finance', err)
        setError('Failed to load finance data from Dataverse.')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Aggregates ──────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const totalBudget   = divisions.reduce((s, d) => s + d.budgetM, 0)
    const totalSpent    = divisions.reduce((s, d) => s + d.spentM, 0)
    const totalRemain   = totalBudget - totalSpent
    const avgUtil       = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    const totalProjects = divisions.reduce((s, d) => s + d.projects, 0)
    return { totalBudget, totalSpent, totalRemain, avgUtil, totalProjects }
  }, [divisions])

  // ── Chart data ──────────────────────────────────────────────────────────────
  const barData = useMemo(() =>
    divisions.map((d, i) => ({
      name:    d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name,
      Budget:  d.budgetM,
      Spent:   d.spentM,
      color:   DIV_PALETTE[i % DIV_PALETTE.length],
    })),
  [divisions])

  const pieData = useMemo(() =>
    divisions.map((d, i) => ({
      name:  d.name.length > 22 ? d.name.slice(0, 20) + '…' : d.name,
      value: d.budgetM,
      color: DIV_PALETTE[i % DIV_PALETTE.length],
    })),
  [divisions])

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return divisions.filter(d => {
      const matchQ = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
      const matchS = statusFilter === 'All' || finStatus(d) === statusFilter
      return matchQ && matchS
    })
  }, [divisions, search, statusFilter])

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1>Finance Overview</h1>
        <p>AI budget allocation, spend tracking and financial performance by division</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Year bar */}
      <div className="fin-year-bar">
        <span className="fin-year-title">
          <Icon name="bi-calendar3" style={{ marginRight: 6, color: '#007560' }} />
          Fiscal Year
        </span>
        <select
          className="fin-year-select"
          value={year}
          onChange={e => setYear(e.target.value)}
        >
          {['2024', '2025', '2026'].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* KPI strip */}
      <div className="kpi-4-grid" style={{ gap: 14, marginBottom: 24 }}>
        {[
          {
            label: 'Total Budget',
            value: loading ? '—' : `AED ${totals.totalBudget.toFixed(1)}M`,
            icon: 'bi-currency-dirham',
            bg: 'rgba(0,117,96,0.08)', color: '#007560',
          },
          {
            label: 'Total Spent',
            value: loading ? '—' : `AED ${totals.totalSpent.toFixed(1)}M`,
            icon: 'bi-graph-up-arrow',
            bg: 'rgba(234,88,12,0.08)', color: '#ea580c',
          },
          {
            label: 'Remaining',
            value: loading ? '—' : `AED ${totals.totalRemain.toFixed(1)}M`,
            icon: 'bi-bar-chart-fill',
            bg: 'rgba(202,138,4,0.1)', color: '#ca8a04',
          },
          {
            label: 'Avg Utilisation',
            value: loading ? '—' : `${totals.avgUtil}%`,
            icon: 'bi-speedometer2',
            bg: 'rgba(0,73,55,0.08)', color: '#004937',
          },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,117,96,0.12)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <Icon name={s.icon} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {!loading && divisions.length > 0 && (
        <div className="fin-charts-row">

          {/* Budget vs Spent — grouped horizontal bar */}
          <div className="fin-chart-card">
            <div className="fin-chart-title">
              <Icon name="bi-bar-chart-horizontal-fill" />
              Budget vs Spent by Division  <span style={{ fontWeight: 400, color: '#a8a29e', marginLeft: 4 }}>AED Millions · FY {year}</span>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(200, divisions.length * 42)}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
                barSize={11}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(101, 152, 141, 0.03)' }} />
                <Bar dataKey="Budget" radius={[0, 4, 4, 0]} fill="#007560" opacity={0.25} />
                <Bar dataKey="Spent"  radius={[0, 4, 4, 0]}>
                  {barData.map((_d, i) => (
                    <Cell key={i} fill={DIV_PALETTE[i % DIV_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="fin-legend">
              <div className="fin-legend-item">
                <div className="fin-legend-dot" style={{ background: '#007560', opacity: 0.25 }} />
                <span>Budget Allocated</span>
              </div>
              <div className="fin-legend-item">
                <div className="fin-legend-dot" style={{ background: '#374151' }} />
                <span>Actual Spend</span>
              </div>
            </div>
          </div>

          {/* Budget Allocation — donut */}
          <div className="fin-chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="fin-chart-title">
              <Icon name="bi-pie-chart-fill" />
              Budget Allocation
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Donut centre */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1c1c1e', lineHeight: 1 }}>
                  AED {totals.totalBudget.toFixed(0)}M
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>total budget</div>
              </div>
            </div>
            {/* Mini legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, paddingTop: 10, borderTop: '1px solid rgba(0,117,96,0.07)' }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#374151' }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontWeight: 700, color: '#1c1c1e', flexShrink: 0 }}>AED {d.value.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="fin-filter-bar">
        <input
          className="fin-search"
          placeholder="Search by division name or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="fin-status-pills">
          {(['All', 'Under Budget', 'On Track', 'At Risk', 'Over Budget'] as (FinStatus | 'All')[]).map(s => (
            <button
              key={s}
              className={`fin-pill${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="fin-result-count">
          {loading ? 'Loading…' : `${filtered.length} of ${divisions.length} divisions`}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', color: '#9ca3af', fontSize: 14 }}>
          <Icon name="bi-arrow-repeat" size={28} style={{ marginBottom: 10 }} />
          Loading divisions…
        </div>
      )}

      {/* ── Desktop table ── */}
      {!loading && (
        <div className="fin-table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Division</th>
                <th>Budget Allocated</th>
                <th>Spent to Date</th>
                <th>Remaining</th>
                <th style={{ minWidth: 130 }}>Utilisation</th>
                <th>Year-End Forecast</th>
                <th>AI Projects</th>
                <th>YoY Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => {
                const st   = finStatus(d)
                const sC   = STATUS_C[st]
                const util = utilPct(d)
                const rem  = d.budgetM - d.spentM
                return (
                  <tr key={d.id} className="fin-row">
                    <td>
                      <div className="fin-division-name">{d.name}</div>
                      <div className="fin-division-code">{d.code}</div>
                    </td>
                    <td>
                      <div className="fin-amount">{fmtM(d.budgetM)}</div>
                    </td>
                    <td>
                      <div className="fin-amount" style={{ color: sC.color }}>{fmtM(d.spentM)}</div>
                    </td>
                    <td>
                      <div className="fin-amount" style={{ color: rem < 0 ? '#dc2626' : '#007560' }}>
                        {rem < 0 ? `-AED ${Math.abs(rem).toFixed(1)}M` : fmtM(rem)}
                      </div>
                    </td>
                    <td>
                      <div className="fin-util-wrap">
                        <div className="fin-util-bar-bg">
                          <div
                            className="fin-util-bar-fill"
                            style={{ width: `${Math.min(util, 100)}%`, background: sC.bar }}
                          />
                        </div>
                        <div className="fin-util-label" style={{ color: sC.color }}>{util}%</div>
                      </div>
                    </td>
                    <td>
                      <div className="fin-amount">{fmtM(d.forecastM)}</div>
                      <div className="fin-amount-sub">
                        {d.forecastM > d.budgetM
                          ? <span style={{ color: '#dc2626' }}><Icon name="bi-caret-up-fill" style={{ marginRight: 2 }} />AED {(d.forecastM - d.budgetM).toFixed(1)}M over</span>
                          : <span style={{ color: '#007560' }}><Icon name="bi-caret-down-fill" style={{ marginRight: 2 }} />AED {(d.budgetM - d.forecastM).toFixed(1)}M under</span>
                        }
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 15, fontWeight: 800, color: DIV_PALETTE[i % DIV_PALETTE.length] }}>
                        {d.projects}
                      </div>
                    </td>
                    <td>
                      <span className="fin-yoy" style={{ color: d.yoyPct >= 0 ? '#007560' : '#dc2626' }}>
                        <Icon name={d.yoyPct >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'} size={12} />
                        {d.yoyPct >= 0 ? '+' : ''}{d.yoyPct.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span
                        className="fin-status-badge"
                        style={{ color: sC.color, background: sC.bg, border: `1px solid ${sC.border}` }}
                      >
                        {st}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 24px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Icon name="bi-inbox" size={32} style={{ marginBottom: 10 }} />
                      No divisions match the current filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile cards ── */}
      {!loading && (
        <div className="fin-card-list">
          {filtered.map((d, i) => {
            const st   = finStatus(d)
            const sC   = STATUS_C[st]
            const util = utilPct(d)
            const rem  = d.budgetM - d.spentM
            const accentColor = DIV_PALETTE[i % DIV_PALETTE.length]
            return (
              <div key={d.id} className="fin-card" style={{ borderLeftColor: accentColor }}>
                <div className="fin-card-header">
                  <div className="fin-card-name-wrap">
                    <div className="fin-card-name">{d.name}</div>
                    <div className="fin-card-code">{d.code}</div>
                  </div>
                  <span
                    className="fin-status-badge"
                    style={{ color: sC.color, background: sC.bg, border: `1px solid ${sC.border}` }}
                  >
                    {st}
                  </span>
                </div>

                <div className="fin-card-grid">
                  <div className="fin-card-cell">
                    <div className="fin-card-cell-label">Budget</div>
                    <div className="fin-card-cell-value">{fmtM(d.budgetM)}</div>
                  </div>
                  <div className="fin-card-cell">
                    <div className="fin-card-cell-label">Spent</div>
                    <div className="fin-card-cell-value" style={{ color: sC.color }}>{fmtM(d.spentM)}</div>
                  </div>
                  <div className="fin-card-cell">
                    <div className="fin-card-cell-label">Remaining</div>
                    <div className="fin-card-cell-value" style={{ color: rem < 0 ? '#dc2626' : '#007560' }}>
                      {rem < 0 ? `-AED ${Math.abs(rem).toFixed(1)}M` : fmtM(rem)}
                    </div>
                  </div>
                  <div className="fin-card-cell">
                    <div className="fin-card-cell-label">AI Projects</div>
                    <div className="fin-card-cell-value" style={{ color: accentColor }}>{d.projects}</div>
                  </div>
                </div>

                {/* Utilisation bar */}
                <div className="fin-util-wrap" style={{ marginBottom: 10 }}>
                  <div className="fin-util-bar-bg">
                    <div
                      className="fin-util-bar-fill"
                      style={{ width: `${Math.min(util, 100)}%`, background: sC.bar }}
                    />
                  </div>
                  <div className="fin-util-label" style={{ color: sC.color }}>
                    {util}% utilised
                  </div>
                </div>

                <div className="fin-card-footer">
                  <span style={{ fontSize: 11, color: '#a8a29e' }}>
                    Forecast: <strong style={{ color: '#374151' }}>{fmtM(d.forecastM)}</strong>
                  </span>
                  <span className="fin-yoy" style={{ color: d.yoyPct >= 0 ? '#007560' : '#dc2626' }}>
                    <Icon name={d.yoyPct >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'} size={12} />
                    {d.yoyPct >= 0 ? '+' : ''}{d.yoyPct.toFixed(1)}% YoY
                  </span>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', background: '#fff', borderRadius: 14, border: '1px solid rgba(0,117,96,0.12)', color: '#9ca3af' }}>
              <Icon name="bi-inbox" size={32} style={{ marginBottom: 10 }} />
              No divisions match the current filters
            </div>
          )}
        </div>
      )}
    </div>
  )
}
