import { useState, useMemo } from 'react'
import { EMPLOYEES } from './data'
import Icon from '../../components/Icon'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="ps-stars">
      {Array.from({ length: max }, (_, i) => (
        <Icon
          key={i}
          name={i < value ? 'bi-star-fill' : 'bi-star'}
          style={{ color: i < value ? '#ca8a04' : '#d4cfc7' }}
        />
      ))}
    </div>
  )
}

function scoreLabel(v: number) {
  if (v === 5) return { label: 'Outstanding', color: '#007560', bg: 'rgba(0,117,96,0.1)' }
  if (v === 4) return { label: 'Exceeds',     color: '#004937', bg: 'rgba(0,73,55,0.08)' }
  if (v === 3) return { label: 'Meets',       color: '#b07d10', bg: 'rgba(202,138,4,0.12)' }
  return               { label: 'Developing', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type SortKey = 'name' | 'performance' | 'aiContribution' | 'combined'

export default function PerformanceTab() {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('combined')
  const [divFilter, setDivFilter] = useState('All')

  const divisions = ['All', ...Array.from(new Set(EMPLOYEES.map(e => e.division))).sort()]

  const avgPerf   = (EMPLOYEES.reduce((s, e) => s + e.performanceScore, 0)       / EMPLOYEES.length).toFixed(1)
  const avgAI     = (EMPLOYEES.reduce((s, e) => s + e.aiContributionRating, 0)   / EMPLOYEES.length).toFixed(1)
  const topPerfCount = EMPLOYEES.filter(e => e.performanceScore === 5).length

  const sorted = useMemo(() => {
    const q = search.toLowerCase()
    const base = EMPLOYEES.filter(e => {
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)
      const matchD = divFilter === 'All' || e.division === divFilter
      return matchQ && matchD
    })
    return [...base].sort((a, b) => {
      if (sortKey === 'performance')    return b.performanceScore - a.performanceScore
      if (sortKey === 'aiContribution') return b.aiContributionRating - a.aiContributionRating
      if (sortKey === 'name')           return a.name.localeCompare(b.name)
      // combined
      return (b.performanceScore + b.aiContributionRating) - (a.performanceScore + a.aiContributionRating)
    })
  }, [search, sortKey, divFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary */}
      <div className="ps-stat-row">
        {[
          { label: 'Avg Performance',       value: `${avgPerf}/5`,    icon: 'bi-star-fill',          bg: 'rgba(202,138,4,0.12)', color: '#b07d10' },
          { label: 'Avg AI Contribution',   value: `${avgAI}/5`,      icon: 'bi-cpu-fill',           bg: 'rgba(0,117,96,0.1)',   color: '#007560' },
          { label: 'Outstanding Performers',value: topPerfCount,       icon: 'bi-trophy-fill',        bg: 'rgba(0,117,96,0.1)',   color: '#007560' },
          { label: 'Reviews Completed',     value: EMPLOYEES.length,   icon: 'bi-clipboard-check-fill', bg: 'rgba(0,73,55,0.08)', color: '#004937' },
        ].map(s => (
          <div className="ps-stat-mini" key={s.label}>
            <div className="ps-stat-mini-icon" style={{ background: s.bg, color: s.color }}>
              <Icon name={s.icon} />
            </div>
            <div>
              <div className="ps-stat-mini-val" style={{ color: s.color }}>{s.value}</div>
              <div className="ps-stat-mini-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Score legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[5,4,3,2].map(v => {
          const { label, color, bg } = scoreLabel(v)
          const cnt = EMPLOYEES.filter(e => e.performanceScore === v).length
          return (
            <div key={v} style={{ background: bg, color, borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stars value={v} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 12, opacity: 0.75 }}>({cnt})</span>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="ps-card">
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-star-half" /> Performance Ratings</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{sorted.length} employees · Q1 2026</span>
        </div>
        <div className="ps-filter-bar">
          <input
            className="ps-search"
            placeholder="Search name or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="ps-select" value={divFilter} onChange={e => setDivFilter(e.target.value)}>
            {divisions.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            className="ps-select"
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
          >
            <option value="combined">Sort: Combined Score</option>
            <option value="performance">Sort: Performance</option>
            <option value="aiContribution">Sort: AI Contribution</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Division</th>
                <th>Performance Score</th>
                <th>AI Contribution</th>
                <th>Rating</th>
                <th>Last Review</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(e => {
                const { label, color, bg } = scoreLabel(e.performanceScore)
                const combined = e.performanceScore + e.aiContributionRating
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="ps-person-cell">
                        <div
                          className="ps-avatar"
                          style={{ background: e.performanceScore === 5 ? 'var(--dewa-gold)' : 'var(--dewa-navy)', color: e.performanceScore === 5 ? 'var(--dewa-navy)' : '#fff' }}
                        >
                          {initials(e.name)}
                        </div>
                        <div>
                          <div className="ps-person-name">{e.name}</div>
                          <div className="ps-person-role">{e.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>{e.division}</td>
                    <td>
                      <div className="ps-perf-score">
                        <Stars value={e.performanceScore} />
                        <div className="ps-perf-avg">{e.performanceScore}.0 / 5.0</div>
                      </div>
                    </td>
                    <td>
                      <div className="ps-perf-score">
                        <Stars value={e.aiContributionRating} />
                        <div className="ps-perf-avg">{e.aiContributionRating}.0 / 5.0</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 12, background: bg, color, display: 'inline-block', width: 'fit-content' }}>
                          {label}
                        </span>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>Combined: {combined}/10</span>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(e.lastReview)}</td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No employees match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
