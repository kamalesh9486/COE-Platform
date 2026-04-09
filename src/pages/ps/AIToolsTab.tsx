import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { AI_TOOLS, type AITool } from './data'
import Icon from '../../components/Icon'

// ── Tooltip style ─────────────────────────────────────────────
const TT_STYLE = {
  background: 'rgba(28,28,30,0.93)',
  border: 'none',
  borderRadius: 9,
  padding: '8px 14px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
  fontSize: 12,
}

// ── Stars renderer ────────────────────────────────────────────
function Stars({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Icon
          key={i}
          name="bi-star-fill"
          style={{ fontSize: 13, color: i <= Math.round(score) ? color : '#e5e7eb' }}
        />
      ))}
      <span style={{ fontSize: 12, fontWeight: 700, color, marginLeft: 4 }}>{score.toFixed(1)}</span>
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: React.ReactNode; sub?: string; icon: string; color: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 13, border: `1px solid ${color}22`,
      padding: '14px 18px', boxShadow: `0 2px 10px ${color}0d`,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: `${color}18`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        <Icon name={icon} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Tool Detail View ──────────────────────────────────────────
function ToolDetailView({ tool, onBack }: { tool: AITool; onBack: () => void }) {
  const { kpi, color } = tool

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Back navigation */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1.5px solid var(--border-card)',
          borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
          color: 'var(--text-muted)', cursor: 'pointer', width: 'fit-content',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dewa-green)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,117,96,0.3)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-card)' }}
      >
        <Icon name="bi-chevron-left" />
        Back to all Technology
      </button>

      {/* Header card */}
      <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: `0 4px 24px ${color}22`, border: `1px solid ${color}33` }}>
        <div style={{ background: `linear-gradient(135deg, ${color}ee 0%, ${color}bb 100%)`, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 15, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            <Icon name={tool.icon} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <button
              onClick={onBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', borderRadius: 7, padding: '3px 11px', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}
            >
              <Icon name="bi-chevron-left" /> All Tools
            </button>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{tool.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{tool.description}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{tool.users.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Active users</div>
          </div>
        </div>

        {/* Department tags row */}
        <div style={{ background: 'rgba(255,255,255,0.92)', padding: '10px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Icon name="bi-building" style={{ fontSize: 12, color }} />
          {tool.departments.map(d => (
            <span key={d} style={{ fontSize: 11, fontWeight: 600, background: `${color}12`, color, border: `1px solid ${color}30`, borderRadius: 6, padding: '2px 9px' }}>{d}</span>
          ))}
        </div>
      </div>

      {/* KPI strip — 6 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <KpiCard label="Adoption Rate"    value={`${kpi.adoptionRate}%`}          sub="of eligible staff"        icon="bi-speedometer2"      color={color} />
        <KpiCard label="Monthly Growth"   value={`+${kpi.monthlyGrowth}%`}         sub="month-over-month"         icon="bi-graph-up-arrow"    color={color} />
        <KpiCard label="Queries / Month"  value={kpi.queriesPerMonth.toLocaleString()} sub="total requests"        icon="bi-activity"          color={color} />
        <KpiCard label="Satisfaction"     value={<Stars score={kpi.satisfactionScore} color={color} />} sub="user rating"  icon="bi-star-fill"         color={color} />
        <KpiCard label="Avg Session"      value={`${kpi.avgSessionMins} min`}      sub="per user"                 icon="bi-clock-fill"        color={color} />
        <KpiCard label="Departments"      value={tool.departments.length}          sub="divisions using"          icon="bi-building"          color={color} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* 6-month trend */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px 12px', border: `1px solid ${color}18`, boxShadow: `0 2px 12px ${color}0a` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="bi-graph-up-arrow" style={{ color }} />
            6-Month User Trend
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={kpi.trend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${tool.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} />
              <Area type="monotone" dataKey="users" stroke={color} strokeWidth={2.5} fill={`url(#grad-${tool.name})`} dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department breakdown */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px 12px', border: `1px solid ${color}18`, boxShadow: `0 2px 12px ${color}0a` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="bi-building" style={{ color }} />
            Department Breakdown
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={kpi.deptBreakdown} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={TT_STYLE} />
              <Bar dataKey="count" fill={color} radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Use cases */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: `1px solid ${color}18`, boxShadow: `0 2px 12px ${color}0a` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="bi-trophy-fill" style={{ color }} />
          Top Use Cases
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {kpi.useCases.map((uc, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${color}10`, color, border: `1px solid ${color}28`,
              borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
              {uc}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function AIToolsTab() {
  const [detailTool, setDetailTool] = useState<AITool | null>(null)

  // ── Detail view ──────────────────────────────────────────
  if (detailTool) {
    return <ToolDetailView tool={detailTool} onBack={() => setDetailTool(null)} />
  }

  // ── Grid view ────────────────────────────────────────────
  const totalUsers = AI_TOOLS.reduce((s, t) => s + t.users, 0)
  const topTool    = [...AI_TOOLS].sort((a, b) => b.users - a.users)[0]
  const maxUsers   = topTool.users

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary strip */}
      <div className="ps-stat-row">
        {[
          { label: 'AI Tools Deployed', value: AI_TOOLS.length, icon: 'bi-cpu-fill',    bg: 'rgba(0,51,102,0.08)',   color: '#003366' },
          { label: 'Total Tool Usage',   value: totalUsers,      icon: 'bi-people-fill', bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
          { label: 'Most Used Tool',     value: topTool.name,    icon: 'bi-trophy-fill', bg: 'rgba(245,166,35,0.12)', color: '#b07d10' },
          { label: 'Divisions Covered',  value: 8,               icon: 'bi-building',    bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
        ].map(s => (
          <div className="ps-stat-mini" key={s.label}>
            <div className="ps-stat-mini-icon" style={{ background: s.bg, color: s.color }}>
              <Icon name={s.icon} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className="ps-stat-mini-val" style={{ color: s.color, fontSize: typeof s.value === 'string' ? 13 : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
              <div className="ps-stat-mini-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div className="ps-tools-grid">
        {AI_TOOLS.map(tool => {
          const pct = Math.round((tool.users / maxUsers) * 100)
          return (
            <div
              key={tool.name}
              className="ps-tool-card"
              style={{ border: `1px solid ${tool.color}22`, cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.15s, border-color 0.2s' }}
              onClick={() => setDetailTool(tool)}
              onMouseOver={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.boxShadow = `0 8px 28px ${tool.color}22`
                el.style.borderColor = `${tool.color}55`
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.boxShadow = ''
                el.style.borderColor = `${tool.color}22`
                el.style.transform = ''
              }}
            >
              {/* Top row */}
              <div className="ps-tool-card-top">
                <div className="ps-tool-icon" style={{ background: `${tool.color}15`, color: tool.color }}>
                  <Icon name={tool.icon} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ps-tool-users">{tool.users.toLocaleString()}</div>
                  <div className="ps-tool-users-lbl">users</div>
                </div>
              </div>

              {/* Name */}
              <div className="ps-tool-name">{tool.name}</div>

              {/* Description */}
              <div className="ps-tool-desc">{tool.description}</div>

              {/* Usage bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>
                  <span>Usage share</span>
                  <span style={{ fontWeight: 600, color: tool.color }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: tool.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Department tags */}
              <div className="ps-tool-dept-tags">
                {tool.departments.map(d => (
                  <span key={d} className="ps-tool-dept-tag">{d}</span>
                ))}
              </div>

              {/* View details hint */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, fontSize: 11, color: tool.color, fontWeight: 600 }}>
                View Details <Icon name="bi-arrow-right" style={{ fontSize: 11 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
