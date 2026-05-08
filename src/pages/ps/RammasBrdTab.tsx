import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts'
import { type RammasAtWorkData, type BrdRecord, oaToDate } from '../../services/RammasAtWorkService'
import Icon from '../../components/Icon'

const COLOR = '#00695c'
const GOLD  = '#ca8a04'
const RED   = '#dc2626'

const TT_STYLE = {
  background: 'rgba(28,28,30,0.93)', border: 'none', borderRadius: 9,
  padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', fontSize: 12, color: '#fff',
}
const TT_LABEL = { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }
const TT_ITEM  = { color: '#fff', fontWeight: 600 as const }

function KpiCard({ label, value, sub, icon, color }: {
  label: string; value: React.ReactNode; sub?: string; icon: string; color: string
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${color}22`, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: `0 2px 10px ${color}0d` }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        <Icon name={icon} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

function ChartCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px 12px', border: `1px solid ${COLOR}18`, boxShadow: `0 2px 12px ${COLOR}0a` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} style={{ color: COLOR }} />
        {title}
      </div>
      {children}
    </div>
  )
}

function deriveStats(data: RammasAtWorkData) {
  const logs = data.brd_api_logs
  const total = logs.length
  const passes = logs.filter(l => l.status === 'pass').length
  const successRate = total > 0 ? Math.round((passes / total) * 100) : 0
  const uniqueUsers = new Set(logs.map(l => l.email_id)).size
  const avgRtMs = total > 0
    ? Math.round(logs.reduce((s, l) => s + parseFloat(l.response_time), 0) / total * 1000)
    : 0

  const routeCounts: Record<string, { total: number; pass: number }> = {}
  for (const l of logs) {
    const key = l.route_name.replace('/brd/', '')
    if (!routeCounts[key]) routeCounts[key] = { total: 0, pass: 0 }
    routeCounts[key].total++
    if (l.status === 'pass') routeCounts[key].pass++
  }
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1].total - a[1].total).slice(0, 9)
    .map(([route, s]) => ({ route, count: s.total, fail: s.total - s.pass }))

  const rtByRoute: Record<string, number[]> = {}
  for (const l of logs) {
    const k = l.route_name.replace('/brd/', '')
    if (!rtByRoute[k]) rtByRoute[k] = []
    rtByRoute[k].push(parseFloat(l.response_time) * 1000)
  }
  const topSlowRoutes = Object.entries(rtByRoute)
    .map(([route, times]) => ({ route, avgMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length) }))
    .sort((a, b) => b.avgMs - a.avgMs).slice(0, 7)

  const aiConversations = new Set(data.brd_openai_analytics.map(r => r.conversation_id)).size

  const brds = data.brd_records
  const uniqueBrds = new Set(brds.map(b => b.brd_id)).size
  const brdMap: Record<string, BrdRecord> = {}
  for (const r of brds) {
    const existing = brdMap[r.brd_id]
    const rDate = parseFloat(r.updated_date || r.generated_date)
    if (!existing || parseFloat(existing.updated_date || '0') < rDate) {
      brdMap[r.brd_id] = r
    }
  }
  const latestBrds = Object.values(brdMap)
    .sort((a, b) => parseFloat(b.updated_date || '0') - parseFloat(a.updated_date || '0'))
    .slice(0, 10)

  const sectionsByBrd: Record<string, number> = {}
  for (const r of brds) {
    sectionsByBrd[r.brd_id] = (sectionsByBrd[r.brd_id] ?? 0) + 1
  }

  const weekCounts: Record<string, number> = {}
  const seenBrds = new Set<string>()
  for (const r of brds) {
    if (seenBrds.has(r.brd_id)) continue
    seenBrds.add(r.brd_id)
    const d = oaToDate(r.generated_date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - d.getDay() + 1)
    const key = monday.toISOString().slice(0, 10)
    weekCounts[key] = (weekCounts[key] ?? 0) + 1
  }
  const brdTimeline = Object.entries(weekCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, count]) => ({ week: week.slice(5), count }))

  const userStats = Array.from(new Set(logs.map(l => l.email_id)))
    .map(email => {
      const ul = logs.filter(l => l.email_id === email)
      return { email: email.split('@')[0], total: ul.length, pass: ul.filter(l => l.status === 'pass').length, fail: ul.filter(l => l.status === 'fail').length }
    })
    .sort((a, b) => b.total - a.total)

  return { total, passes, fails: total - passes, successRate, uniqueUsers, avgRtMs, topRoutes, topSlowRoutes, aiConversations, uniqueBrds, latestBrds, sectionsByBrd, brdTimeline, userStats }
}

export default function RammasBrdTab({ data }: { data: RammasAtWorkData }) {
  const s = useMemo(() => deriveStats(data), [data])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
        <KpiCard label="Total API Calls"    value={s.total.toLocaleString()}       sub="all time"                        icon="bi-activity"          color={COLOR} />
        <KpiCard label="Success Rate"       value={`${s.successRate}%`}            sub={`${s.fails} failed`}             icon="bi-check2-circle"     color={COLOR} />
        <KpiCard label="Active Users"       value={s.uniqueUsers}                  sub="unique contributors"             icon="bi-people-fill"       color={GOLD}  />
        <KpiCard label="BRD AI Chats"       value={s.aiConversations}              sub="unique conversations"            icon="bi-chat-dots-fill"    color={COLOR} />
        <KpiCard label="Avg Response Time"  value={`${s.avgRtMs} ms`}             sub="across all routes"               icon="bi-speedometer2"      color={s.avgRtMs > 500 ? RED : COLOR} />
        <KpiCard label="BRD Documents"      value={s.uniqueBrds}                  sub={`${s.total} total API calls`}    icon="bi-file-text"         color={GOLD}  />
      </div>

      {/* Route usage + Pass/Fail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <ChartCard title="API Route Usage" icon="bi-bar-chart-line-fill">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={s.topRoutes} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barSize={13}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="route" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={140} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Bar dataKey="count" name="Calls" radius={[0, 5, 5, 0]}>
                {s.topRoutes.map((r, i) => <Cell key={i} fill={r.fail > 0 ? GOLD : COLOR} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pass vs Fail" icon="bi-shield-check">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            {[
              { label: 'Successful', value: s.passes, total: s.total, color: COLOR, icon: 'bi-check-circle-fill' },
              { label: 'Failed',     value: s.fails,  total: s.total, color: RED,   icon: 'bi-x-circle-fill' },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#374151' }}><Icon name={row.icon} style={{ color: row.color }} />{row.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: row.color }}>{row.value}</span>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(row.value / row.total * 100)}%`, background: row.color, borderRadius: 6, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, textAlign: 'right' }}>{Math.round(row.value / row.total * 100)}%</div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px 14px', background: `${COLOR}08`, borderRadius: 10, border: `1px solid ${COLOR}20` }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>BRD AI assistant</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                <span>Conversations</span>
                <span style={{ color: COLOR }}>{s.aiConversations}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                <span>Documents</span>
                <span style={{ color: COLOR }}>{s.uniqueBrds}</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Response time by route */}
      <ChartCard title="Avg Response Time by Route (ms)" icon="bi-clock-history">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={s.topSlowRoutes} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barSize={13}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit=" ms" />
            <YAxis type="category" dataKey="route" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={140} />
            <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
            <Bar dataKey="avgMs" name="Avg ms" fill={GOLD} radius={[0, 5, 5, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* BRD Creation Timeline + Active Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="BRD Creation Over Time" icon="bi-graph-up-arrow">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={s.brdTimeline} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Line type="monotone" dataKey="count" name="New BRDs" stroke={COLOR} strokeWidth={2} dot={{ r: 3, fill: COLOR }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Active Users" icon="bi-people-fill">
          <div style={{ overflowX: 'auto' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLOR}20` }}>
                  {['User', 'Calls', 'Pass', 'Fail', 'Rate'].map(h => (
                    <th key={h} style={{ textAlign: 'left' as const, padding: '4px 8px', fontWeight: 700, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.userStats.map((u, i) => (
                  <tr key={u.email} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'transparent' : '#fafafa' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#1c1c1e', fontSize: 11 }}>{u.email}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: COLOR }}>{u.total}</td>
                    <td style={{ padding: '6px 8px', color: '#15803d' }}>{u.pass}</td>
                    <td style={{ padding: '6px 8px', color: u.fail > 0 ? RED : '#9ca3af' }}>{u.fail}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: COLOR }}>{Math.round(u.pass / u.total * 100)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* BRD Documents Table */}
      <ChartCard title="Recent BRD Documents" icon="bi-file-text">
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLOR}20` }}>
                {['BRD Name', 'Status', 'Sections', 'Size', 'Last Updated'].map(h => (
                  <th key={h} style={{ textAlign: 'left' as const, padding: '6px 12px', fontWeight: 700, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.latestBrds.map((b, i) => {
                const updatedDate = parseFloat(b.updated_date)
                const dateStr = isNaN(updatedDate) ? '—' : oaToDate(updatedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                const sections = (s.sectionsByBrd as Record<string, number>)[b.brd_id] ?? 1
                const statusColor = b.status === 'completed' ? COLOR : b.status === 'active' ? '#2563eb' : '#9ca3af'
                return (
                  <tr key={b.brd_id + i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'transparent' : '#fafafa' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1c1c1e' }}>{b.brd_name || b.brd_id}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: `${statusColor}15`, color: statusColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' as const }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#374151' }}>{sections}</td>
                    <td style={{ padding: '8px 12px', color: GOLD, fontWeight: 600, textTransform: 'capitalize' as const }}>{b.content_generation_size}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{dateStr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

    </div>
  )
}
