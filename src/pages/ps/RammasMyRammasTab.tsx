import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { type RammasAtWorkData, oaToDate, parseRT } from '../../services/RammasAtWorkService'
import Icon from '../../components/Icon'

const COLOR  = '#00695c'
const GOLD   = '#ca8a04'
const TEAL2  = '#004937'
const PURPLE = '#7c3aed'

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
  const liveBots   = data['myrammas-live-bot']
  const draftBots  = data['myrammas-draft-bot']
  const apiLogs    = data['myrammas-api-logs']
  const oaiData    = data['myrammas-openai-analytics']
  const sharedBots = data['myrammas-shared-bots']

  const totalConversations = new Set(apiLogs.map(l => l.conversation_id)).size
  const uniqueUsers        = new Set(apiLogs.map(l => l.user_id)).size
  const totalTokens        = oaiData.reduce((s, r) => s + (parseInt(r.total_tokens) || 0), 0)
  const sharedBotCount     = new Set(sharedBots.map(s => s.bot_id)).size

  // Top bots by conversation count
  const botNameMap = new Map(liveBots.map(b => [b.bot_id, b.bot_name]))
  const botConvCounts: Record<string, number> = {}
  for (const log of apiLogs) {
    if (log.bot_id) botConvCounts[log.bot_id] = (botConvCounts[log.bot_id] ?? 0) + 1
  }
  const topBots = Object.entries(botConvCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([bot_id, count]) => ({ name: botNameMap.get(bot_id) || bot_id, count }))

  // Visibility split for live bots
  const pubCount  = liveBots.filter(b => b.visibility?.toLowerCase() === 'public').length
  const privCount = liveBots.length - pubCount
  const visibilityData = [
    { name: 'Public',  value: pubCount,  color: COLOR  },
    { name: 'Private', value: privCount, color: GOLD   },
  ]

  // Daily token usage (last 30 days)
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const dailyTokens: Record<string, number> = {}
  for (const r of oaiData) {
    const d = oaToDate(r._ts)
    if (d.getTime() < cutoff) continue
    const key = d.toISOString().slice(0, 10)
    dailyTokens[key] = (dailyTokens[key] ?? 0) + (parseInt(r.total_tokens) || 0)
  }
  const tokenTimeline = Object.entries(dailyTokens)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, tokens]) => ({ day: day.slice(5), tokens }))

  // Bot inventory table
  const botTable = liveBots
    .slice()
    .sort((a, b) => parseRT(b.created_at) - parseRT(a.created_at))
    .slice(0, 15)

  // Avg response time across all conversations
  const avgRt = apiLogs.length > 0
    ? Math.round(apiLogs.reduce((s, l) => s + parseRT(l.response_time), 0) / apiLogs.length * 1000)
    : 0

  return { liveBots: liveBots.length, draftBots: draftBots.length, totalConversations, uniqueUsers, totalTokens, sharedBotCount, topBots, visibilityData, tokenTimeline, botTable, avgRt }
}

export default function RammasMyRammasTab({ data }: { data: RammasAtWorkData }) {
  const s = useMemo(() => deriveStats(data), [data])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
        <KpiCard label="Live Bots"          value={s.liveBots}                     sub="published & active"        icon="bi-robot"              color={COLOR}   />
        <KpiCard label="Draft Bots"         value={s.draftBots}                    sub="in development"            icon="bi-kanban"             color={PURPLE}  />
        <KpiCard label="Conversations"      value={s.totalConversations}           sub="unique sessions"           icon="bi-chat-dots-fill"     color={COLOR}   />
        <KpiCard label="Unique Users"       value={s.uniqueUsers}                  sub="across all bots"           icon="bi-people-fill"        color={GOLD}    />
        <KpiCard label="Total AI Tokens"    value={s.totalTokens.toLocaleString()} sub="MyRammas module"           icon="bi-cpu-fill"           color={COLOR}   />
        <KpiCard label="Shared Bots"        value={s.sharedBotCount}               sub="shared with others"        icon="bi-box-arrow-up-right" color={TEAL2}   />
      </div>

      {/* Top Bots + Visibility split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <ChartCard title="Top 10 Bots by Usage" icon="bi-bar-chart-line-fill">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.topBots} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={150} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Bar dataKey="count" name="Conversations" fill={COLOR} radius={[0, 5, 5, 0]}>
                {s.topBots.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? COLOR : TEAL2} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bot Visibility Split" icon="bi-pie-chart-fill">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280 }}>
            <PieChart width={220} height={220}>
              <Pie data={s.visibilityData} cx={110} cy={100} innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {s.visibilityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend formatter={(value) => <span style={{ fontSize: 11, color: '#374151' }}>{value}</span>} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
            </PieChart>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLOR, marginTop: -8 }}>Live Bots: {s.liveBots}</div>
          </div>
        </ChartCard>
      </div>

      {/* Daily token usage */}
      <ChartCard title="Daily Token Usage — Last 30 Days" icon="bi-lightning-charge-fill">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={s.tokenTimeline} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
            <Bar dataKey="tokens" name="Tokens" fill={COLOR} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Live bot inventory table */}
      <ChartCard title="Live Bot Inventory" icon="bi-grid-3x3-gap">
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLOR}20` }}>
                {['Bot Name', 'Owner', 'Visibility', 'Status', 'Created'].map(h => (
                  <th key={h} style={{ textAlign: 'left' as const, padding: '6px 12px', fontWeight: 700, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.botTable.map((bot, i) => {
                const created = parseRT(bot.created_at)
                const dateStr = created > 0 ? oaToDate(created).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
                const visColor = bot.visibility?.toLowerCase() === 'public' ? COLOR : GOLD
                const statusColor = bot.status?.toLowerCase() === 'active' || bot.status?.toLowerCase() === 'live' ? COLOR : '#9ca3af'
                return (
                  <tr key={bot.bot_id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'transparent' : '#fafafa' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1c1c1e', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{bot.bot_name}</div>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#374151' }}>{bot.bot_owner}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: `${visColor}15`, color: visColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' as const }}>
                        {bot.visibility || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: `${statusColor}15`, color: statusColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' as const }}>
                        {bot.status || '—'}
                      </span>
                    </td>
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
