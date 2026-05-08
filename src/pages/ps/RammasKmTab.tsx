import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts'
import { type RammasAtWorkData, oaToDate, parseRT } from '../../services/RammasAtWorkService'
import Icon from '../../components/Icon'

const COLOR = '#00695c'
const GOLD  = '#ca8a04'
const TEAL2 = '#004937'
const BLUE  = '#1d4ed8'

const TT_STYLE = {
  background: 'rgba(28,28,30,0.93)', border: 'none', borderRadius: 9,
  padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', fontSize: 12, color: '#fff',
}
const TT_LABEL = { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }
const TT_ITEM  = { color: '#fff', fontWeight: 600 as const }

const CAT_COLORS: Record<string, string> = {
  public: COLOR, private: GOLD, 'dewa-open': TEAL2, 'dewa-internal': BLUE,
}
function catColor(cat: string) { return CAT_COLORS[cat?.toLowerCase()] ?? '#6b7280' }

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
  const docs    = data['km-document-details']
  const users   = data['km-users']
  const convs   = data['km-conversation-analytics']
  const oai     = data['km-open-ai-analytics']
  const folders = data['km-folder-details']
  const divs    = data['km-division']

  const activeUsers        = users.filter(u => u.status?.toLowerCase() === 'active').length
  const totalConversations = new Set(convs.map(c => c.conversation_id)).size
  const totalKmTokens      = oai.reduce((s, r) => s + (parseInt(r.total_tokens) || 0), 0)
  const avgRtMs            = convs.length > 0
    ? Math.round(convs.reduce((s, c) => s + parseRT(c.response_time), 0) / convs.length * 1000)
    : 0

  // Docs by file_category
  const catCounts: Record<string, number> = {}
  for (const d of docs) {
    const cat = d.file_category || 'unknown'
    catCounts[cat] = (catCounts[cat] ?? 0) + 1
  }
  const docsByCategory = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({ cat, count }))

  // Users by bot_access
  const accessCounts: Record<string, number> = {}
  for (const u of users) {
    const access = u.bot_access || 'Unknown'
    accessCounts[access] = (accessCounts[access] ?? 0) + 1
  }
  const usersByAccess = Object.entries(accessCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([access, count]) => ({ access, count }))

  // Daily KM conversations (last 30 days)
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const dailyConvs: Record<string, Set<string>> = {}
  for (const c of convs) {
    const d = oaToDate(c.ts)
    if (d.getTime() < cutoff) continue
    const key = d.toISOString().slice(0, 10)
    if (!dailyConvs[key]) dailyConvs[key] = new Set()
    dailyConvs[key].add(c.conversation_id)
  }
  const convTimeline = Object.entries(dailyConvs)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, set]) => ({ day: day.slice(5), count: set.size }))

  // Division lookup map
  const divMap = new Map(divs.map(d => [d.div_id, d.div_name]))

  // User directory (show all)
  const userTable = users
    .slice()
    .sort((a, b) => parseRT(b.created_at) - parseRT(a.created_at))

  return { totalDocs: docs.length, activeUsers, totalUsers: users.length, totalConversations, avgRtMs, totalKmTokens, totalFolders: folders.length, docsByCategory, usersByAccess, convTimeline, divMap, userTable }
}

export default function RammasKmTab({ data }: { data: RammasAtWorkData }) {
  const s = useMemo(() => deriveStats(data), [data])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
        <KpiCard label="Total Documents"  value={s.totalDocs}                       sub="in knowledge base"       icon="bi-collection-fill"    color={COLOR}  />
        <KpiCard label="Active Users"     value={s.activeUsers}                     sub={`of ${s.totalUsers} registered`} icon="bi-people"            color={COLOR} />
        <KpiCard label="Conversations"    value={s.totalConversations}              sub="unique KM sessions"      icon="bi-chat-dots-fill"     color={GOLD} />
        <KpiCard label="Avg Response"     value={`${s.avgRtMs} ms`}                sub="KM Q&A"                  icon="bi-speedometer2"       color={s.avgRtMs > 1000 ? '#dc2626' : COLOR} />
        <KpiCard label="KM Tokens Used"   value={s.totalKmTokens.toLocaleString()} sub="completion + embedding"  icon="bi-cpu-fill"           color={TEAL2}  />
        <KpiCard label="Document Folders" value={s.totalFolders}                   sub="folder tree"             icon="bi-folder2"            color={GOLD}   />
      </div>

      {/* Docs by category + Users by access */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="Documents by Category" icon="bi-folder2-open">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={s.docsByCategory} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="cat" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Bar dataKey="count" name="Documents" radius={[5, 5, 0, 0]}>
                {s.docsByCategory.map((d, i) => <Cell key={i} fill={catColor(d.cat)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Users by Module Access" icon="bi-person-video3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={s.usersByAccess} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="access" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
              <Bar dataKey="count" name="Users" radius={[0, 5, 5, 0]}>
                {s.usersByAccess.map((_, i) => <Cell key={i} fill={[COLOR, GOLD, TEAL2, BLUE][i % 4]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Daily conversations */}
      <ChartCard title="Daily KM Conversations — Last 30 Days" icon="bi-graph-up-arrow">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={s.convTimeline} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} itemStyle={TT_ITEM} />
            <Line type="monotone" dataKey="count" name="Conversations" stroke={COLOR} strokeWidth={2} dot={{ r: 3, fill: COLOR }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* User Directory */}
      <ChartCard title="User Directory" icon="bi-people-fill">
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLOR}20` }}>
                {['Email', 'Division', 'Role', 'Module Access', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left' as const, padding: '6px 12px', fontWeight: 700, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.userTable.map((u, i) => {
                const divName  = s.divMap.get(u.div_id) ?? (u.div_id || '—')
                const statusOk = u.status?.toLowerCase() === 'active'
                const roleColor = u.user_role?.toLowerCase() === 'admin' ? GOLD : COLOR
                return (
                  <tr key={u.user_id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'transparent' : '#fafafa' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1c1c1e', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{u.email_id}</div>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#374151', fontSize: 11 }}>{divName}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: `${roleColor}15`, color: roleColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' as const }}>
                        {u.user_role || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#374151' }}>{u.bot_access || '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: statusOk ? `${COLOR}15` : '#f3f4f6', color: statusOk ? COLOR : '#9ca3af', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                        {u.status || '—'}
                      </span>
                    </td>
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
