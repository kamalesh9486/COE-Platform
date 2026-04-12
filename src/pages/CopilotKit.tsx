import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  BarChart, LabelList,
} from 'recharts'
import Icon from '../components/Icon'
import { useCopilotData } from '../context/CopilotDataContext'

// ── Style constants ────────────────────────────────────────────
const TT = {
  background: 'rgba(28,28,30,0.93)', border: 'none',
  borderRadius: 9, padding: '8px 14px', fontSize: 12,
} as const

const G   = '#007560'
const B   = '#0078d4'
const GREY = '#e5e7eb'
const AMB  = '#f59e0b'

// ── Colour palettes ────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Assistant:    '#0078d4',
  Advisor:      '#00897b',
  Performer:    '#f59e0b',
  Retriever:    '#8b5cf6',
  Orchestrator: '#ef4444',
  Collaborator: '#64748b',
}
const BEHAVIOR_COLORS: Record<string, string> = {
  Respond:    '#0078d4',
  Decide:     '#f59e0b',
  Act:        '#ef4444',
  Sense:      '#10b981',
  Collaborate:'#8b5cf6',
  Reflect:    '#64748b',
}
const BENEFIT_PALETTE = [
  '#007560', '#0078d4', '#8b5cf6', '#f59e0b',
  '#ef4444', '#10b981', '#06b6d4', '#ec4899',
]

// ── Reusable sub-components ────────────────────────────────────

function SectionLabel({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: `${B}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: B, fontSize: 14, flexShrink: 0,
      }}>
        <Icon name={icon} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{subtitle}</div>}
      </div>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb', marginLeft: 4 }} />
    </div>
  )
}

function CompactStatCard({ label, value, iconName, color, bg }: {
  label: string; value: number; iconName: string; color: string; bg: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '12px 16px',
      border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0, color,
      }}>
        <Icon name={iconName} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}

function PieCard({ title, subtitle, yes, no, colorYes, labelYes, labelNo }: {
  title: string; subtitle: string
  yes: number; no: number
  colorYes: string; labelYes: string; labelNo: string
}) {
  const total = yes + no
  const pct   = total > 0 ? Math.round((yes / total) * 100) : 0
  const data  = [{ value: yes }, { value: no }]
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      border: `1px solid ${colorYes}18`, boxShadow: `0 2px 12px ${colorYes}0a`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{subtitle}</div>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={62}
            dataKey="value" startAngle={90} endAngle={-270}>
            <Cell fill={colorYes} />
            <Cell fill={GREY} />
          </Pie>
          <Tooltip contentStyle={TT} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { color: colorYes, label: `${labelYes} · ${yes} (${pct}%)` },
          { color: GREY,     label: `${labelNo} · ${no} (${100 - pct}%)`, border: '1px solid #d1d5db' },
        ].map(leg => (
          <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: leg.color, border: leg.border, flexShrink: 0 }} />
            <span style={{ color: '#4b5563' }}>{leg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────────
function count<T>(arr: T[], key: (item: T) => string) {
  const map: Record<string, number> = {}
  arr.forEach(item => { const k = key(item) || 'Unknown'; map[k] = (map[k] ?? 0) + 1 })
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

// ── Main panel ─────────────────────────────────────────────────
export default function CopilotKitPanel({ onBack }: { onBack: () => void }) {
  const { agentDetails: agents, agentValue: agentValues, loading, error } = useCopilotData()

  const total    = agents.length
  const genAiYes = useMemo(() => agents.filter(a => a.cat_usesgenai === true).length,   [agents])
  const toolsYes = useMemo(() => agents.filter(a => a.cat_usesactions === true).length, [agents])

  const authCounts = useMemo(() => {
    let microsoft = 0, manual = 0, none = 0
    agents.forEach(a => {
      const t = (a.cat_enduserauthenticationtype ?? '').toLowerCase()
      if (t.includes('microsoft') || t.includes('azure') || t.includes('aad')) microsoft++
      else if (!t || t === 'none') none++
      else manual++
    })
    return { microsoft, manual, none }
  }, [agents])

  const timelineData = useMemo(() => {
    const map: Record<string, { month: string; yearMonth: number; count: number }> = {}
    agents.forEach(a => {
      if (!a.cat_agentcreateddate) return
      const d  = new Date(a.cat_agentcreateddate as string)
      const ym = d.getFullYear() * 100 + (d.getMonth() + 1)
      const lb = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
      if (!map[ym]) map[ym] = { month: lb, yearMonth: ym, count: 0 }
      map[ym].count++
    })
    const sorted = Object.values(map).sort((a, b) => a.yearMonth - b.yearMonth)
    let acc = 0
    return sorted.map(r => { acc += r.count; return { ...r, accumulativeCount: acc } })
  }, [agents])

  const envData = useMemo(() => {
    const map: Record<string, { name: string; count: number; published: number }> = {}
    agents.forEach(a => {
      const env = (a.cat_environmentname as string | undefined) ?? 'Unknown'
      if (!map[env]) map[env] = { name: env, count: 0, published: 0 }
      map[env].count++
      if (a.cat_published) map[env].published++
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [agents])

  // ── agentValues derivations ──
  const gloTotalAgents    = agentValues.length
  const allAgentsCount    = agents.length

  const classifiedIds = useMemo(
    () => new Set(agentValues.map(v => v.cat_agentid).filter(Boolean)),
    [agentValues]
  )
  const classifiedCount    = useMemo(() => agents.filter(a => classifiedIds.has(a.cat_agentid)).length, [agents, classifiedIds])
  const unclassifiedCount  = allAgentsCount - classifiedCount
  const classifiedPct      = allAgentsCount > 0 ? Math.round(classifiedCount / allAgentsCount * 100) : 0

  const withBenefitCount   = useMemo(() => agentValues.filter(v => (v.cat_agentvaluebenefit ?? '').trim()).length, [agentValues])
  const gloValueSaturation = gloTotalAgents > 0 ? Math.round(withBenefitCount / gloTotalAgents * 100) : 0
  const withoutBenefitCount = gloTotalAgents - withBenefitCount

  const typeData     = useMemo(() => count(agentValues, v => v.cat_agenttypes ?? ''),           [agentValues])
  const behaviorData = useMemo(() => count(agentValues, v => v.cat_agentbehaviors ?? ''),       [agentValues])
  const benefitData  = useMemo(() => count(agentValues, v => v.cat_agentvaluebenefit ?? ''),    [agentValues])

  const topType     = typeData[0]
  const topBehavior = behaviorData[0]
  const topBenefit  = benefitData[0]
  const topTypePct     = gloTotalAgents > 0 ? Math.round((topType?.value     ?? 0) / gloTotalAgents * 100) : 0
  const topBehaviorPct = gloTotalAgents > 0 ? Math.round((topBehavior?.value ?? 0) / gloTotalAgents * 100) : 0

  const envChartHeight = Math.max(160, envData.length * 38 + 48)
  const benefitChartHeight = Math.max(180, benefitData.length * 44 + 48)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1.5px solid var(--border-card)',
          borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
          color: 'var(--text-muted)', cursor: 'pointer', width: 'fit-content',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={e => {
          (e.currentTarget).style.color = 'var(--dewa-green)'
          ;(e.currentTarget).style.borderColor = 'rgba(0,117,96,0.3)'
        }}
        onMouseLeave={e => {
          (e.currentTarget).style.color = 'var(--text-muted)'
          ;(e.currentTarget).style.borderColor = 'var(--border-card)'
        }}
      >
        <Icon name="bi-chevron-left" />
        Back to all Technology
      </button>

      {/* ── Header banner ── */}
      <div style={{
        background: `linear-gradient(135deg, #0078d4 0%, #005fa3 100%)`,
        borderRadius: 16, padding: '20px 28px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 4px 20px rgba(0,120,212,0.25)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0, color: '#fff',
        }}>
          <Icon name="bi-windows" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Microsoft Copilot</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
            Copilot Studio agent analytics — live from Power Platform
          </div>
        </div>
        {!loading && !error && (
          <div style={{ display: 'flex', gap: 32, textAlign: 'center' }}>
            {[
              { label: 'Total Agents', value: total },
              { label: 'GenAI Enabled', value: genAiYes },
              { label: 'With Tools', value: toolsYes },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          <Icon name="bi-arrow-repeat" style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
          Loading agent data…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: 13 }}>
          Error: {error}
        </div>
      )}

      {/* ── Dashboard ── */}
      {!loading && !error && (
        <>

          {/* ═══════════════ SECTION: Agent Capabilities ═══════════════ */}
          <SectionLabel
            icon="bi-cpu-fill"
            title="Agent Capabilities"
            subtitle="GenAI features, tool usage and authentication across all agents"
          />

          {/* 3-col: GenAI pie | Tools pie | Auth cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <PieCard
              title="GenAI Features"
              subtitle="Agents using Generative AI"
              yes={genAiYes} no={total - genAiYes}
              colorYes={G} labelYes="Uses GenAI" labelNo="No GenAI"
            />
            <PieCard
              title="Tools & Actions"
              subtitle="Agents using connectors"
              yes={toolsYes} no={total - toolsYes}
              colorYes={B} labelYes="Uses Tools" labelNo="No Tools"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e', marginBottom: 2 }}>Authentication</div>
              <CompactStatCard label="Microsoft / Azure AD" value={authCounts.microsoft} iconName="bi-microsoft"   color={B}       bg={`${B}0f`}   />
              <CompactStatCard label="Manual / Custom Auth"  value={authCounts.manual}   iconName="bi-key-fill"    color={AMB}     bg={`${AMB}12`} />
              <CompactStatCard label="No Authentication"     value={authCounts.none}     iconName="bi-unlock-fill" color="#6b7280" bg="#f3f4f6"    />
            </div>
          </div>

          {/* ═══════════════ SECTION: Growth & Environments ═══════════════ */}
          <SectionLabel
            icon="bi-graph-up-arrow"
            title="Growth & Environments"
            subtitle="Agent deployment timeline and distribution across Power Platform environments"
          />

          {/* Timeline */}
          {timelineData.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: `1px solid ${G}18`, boxShadow: `0 2px 12px ${G}0a` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Agent Growth Timeline</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>
                Monthly new agents&nbsp;
                <span style={{ color: G, fontWeight: 700 }}>■</span>&nbsp;
                Cumulative total&nbsp;
                <span style={{ color: B, fontWeight: 700 }}>─</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={timelineData} margin={{ top: 4, right: 28, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TT} />
                  <Bar  yAxisId="left"  dataKey="count"             name="New Agents" fill={G} radius={[5,5,0,0]} opacity={0.85} />
                  <Line yAxisId="right" dataKey="accumulativeCount" name="Cumulative" stroke={B} strokeWidth={2.5} type="monotone" dot={{ fill: B, r: 3 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Environments — horizontal bar chart */}
          {envData.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: `1px solid ${B}18`, boxShadow: `0 2px 12px ${B}0a` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Agents by Environment</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>
                Distribution across Power Platform environments — total vs published
              </div>
              <ResponsiveContainer width="100%" height={envChartHeight}>
                <BarChart
                  data={envData}
                  layout="vertical"
                  margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                  barSize={14}
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip contentStyle={TT} />
                  <Bar dataKey="count"     name="Total Agents" fill={`${B}cc`} radius={[0,5,5,0]}>
                    <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }} />
                  </Bar>
                  <Bar dataKey="published" name="Published"    fill={`${G}cc`} radius={[0,5,5,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {[{ color: `${B}cc`, label: 'Total Agents' }, { color: `${G}cc`, label: 'Published' }].map(leg => (
                  <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: leg.color, flexShrink: 0 }} />
                    <span style={{ color: '#4b5563' }}>{leg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ VALUE INTELLIGENCE DIVIDER ═══════════════ */}
          {agentValues.length > 0 && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, margin: '4px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: `linear-gradient(135deg, ${G}14, ${B}0a)`,
                  border: `1px solid ${G}25`, borderRadius: 20,
                  padding: '5px 14px',
                }}>
                  <Icon name="bi-lightbulb-fill" style={{ color: G, fontSize: 12 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: G, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    Agent Value Intelligence
                  </span>
                </div>
                <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              </div>

              {/* ── 6 KPI tiles ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Agents Classified',   value: gloTotalAgents,           sub: 'value records',                              color: B,         icon: 'bi-collection-fill' },
                  { label: 'Classification Cover', value: `${classifiedPct}%`,      sub: `${classifiedCount} of ${allAgentsCount}`,    color: G,         icon: 'bi-check2-circle' },
                  { label: 'Value Saturation',     value: `${gloValueSaturation}%`, sub: 'have benefit assigned',                      color: '#10b981', icon: 'bi-lightbulb-fill' },
                  { label: 'Top Value Delivered',  value: topBenefit?.name ?? '—',  sub: `${topBenefit?.value ?? 0} agents`,           color: '#f59e0b', icon: 'bi-trophy-fill' },
                  { label: 'Top Agent Type',       value: topType?.name ?? '—',     sub: `${topTypePct}% of classified`,               color: TYPE_COLORS[topType?.name ?? ''] ?? '#94a3b8', icon: 'bi-robot' },
                  { label: 'Top Behavior',         value: topBehavior?.name ?? '—', sub: `${topBehaviorPct}% of classified`,           color: BEHAVIOR_COLORS[topBehavior?.name ?? ''] ?? '#94a3b8', icon: 'bi-graph-up-arrow' },
                ].map(k => (
                  <div key={k.label} style={{
                    background: '#fff', borderRadius: 12, padding: '16px 18px',
                    border: `1px solid ${k.color}20`, boxShadow: `0 2px 8px ${k.color}08`,
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: `${k.color}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0, color: k.color,
                    }}>
                      <Icon name={k.icon} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 3 }}>{k.label}</div>
                      <div style={{ fontSize: typeof k.value === 'string' && k.value.length > 8 ? 12 : 18, fontWeight: 900, color: k.color, lineHeight: 1.1, wordBreak: 'break-word' }}>{k.value}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>{k.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ═══════════════ SECTION: Coverage & Classification ═══════════════ */}
              <SectionLabel
                icon="bi-pie-chart-fill"
                title="Coverage & Classification"
                subtitle="How many agents are classified and have a value benefit assigned"
              />

              {/* 2-col: classification pie + saturation pie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Classification coverage */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: `1px solid ${B}18`, boxShadow: `0 2px 12px ${B}0a` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Classification Coverage</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Agents matched from agentdetails to agentvalues</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[{ name: 'Classified', value: classifiedCount }, { name: 'Not Classified', value: unclassifiedCount }]}
                        cx="50%" cy="50%" innerRadius={38} outerRadius={62}
                        dataKey="value" startAngle={90} endAngle={-270}
                      >
                        <Cell fill={B} />
                        <Cell fill={GREY} />
                      </Pie>
                      <Tooltip contentStyle={TT} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                      { color: B,    label: `Classified · ${classifiedCount} (${classifiedPct}%)` },
                      { color: GREY, label: `Not classified · ${unclassifiedCount} (${100 - classifiedPct}%)`, border: '1px solid #d1d5db' },
                    ].map(leg => (
                      <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: leg.color, border: leg.border, flexShrink: 0 }} />
                        <span style={{ color: '#4b5563' }}>{leg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value saturation pie */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: `1px solid ${G}18`, boxShadow: `0 2px 12px ${G}0a` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Value Benefit Saturation</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Agents with vs without a benefit assigned</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[{ name: 'With Benefit', value: withBenefitCount }, { name: 'No Benefit', value: withoutBenefitCount }]}
                        cx="50%" cy="50%" innerRadius={38} outerRadius={62}
                        dataKey="value" startAngle={90} endAngle={-270}
                      >
                        <Cell fill={G} />
                        <Cell fill={GREY} />
                      </Pie>
                      <Tooltip contentStyle={TT} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                      { color: G,    label: `With benefit · ${withBenefitCount} (${gloValueSaturation}%)` },
                      { color: GREY, label: `No benefit · ${withoutBenefitCount} (${100 - gloValueSaturation}%)`, border: '1px solid #d1d5db' },
                    ].map(leg => (
                      <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: leg.color, border: leg.border, flexShrink: 0 }} />
                        <span style={{ color: '#4b5563' }}>{leg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ═══════════════ SECTION: Types & Behaviors ═══════════════ */}
              <SectionLabel
                icon="bi-diagram-3-fill"
                title="Agent Types & Behaviors"
                subtitle="Role classification and behavioral patterns of classified agents"
              />

              {/* 2-col: types donut + behaviors bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Agent Types donut */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Agent Types</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Classification by agent role</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={typeData} cx="50%" cy="50%" innerRadius={36} outerRadius={62}
                        dataKey="value" startAngle={90} endAngle={-270}>
                        {typeData.map(entry => (
                          <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TT} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px', justifyContent: 'center' }}>
                    {typeData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[d.name] ?? '#94a3b8', flexShrink: 0 }} />
                        <span style={{ color: '#4b5563' }}>{d.name} · {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Behaviors bar */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Agent Behaviors</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>How agents interact with their environment</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={behaviorData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={76} />
                      <Tooltip contentStyle={TT} />
                      <Bar dataKey="value" radius={[0, 5, 5, 0]} name="Agents">
                        {behaviorData.map(entry => (
                          <Cell key={entry.name} fill={BEHAVIOR_COLORS[entry.name] ?? '#94a3b8'} />
                        ))}
                        <LabelList dataKey="value" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ═══════════════ SECTION: Value Registry by Benefit ═══════════════ */}
              <SectionLabel
                icon="bi-trophy-fill"
                title="Agent Value Registry — by Benefit"
                subtitle="Number of agents delivering each business benefit category"
              />

              <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: `1px solid ${G}18`, boxShadow: `0 2px 12px ${G}0a` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1c1e' }}>Benefit Distribution</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{benefitData.length} benefit categories · {gloTotalAgents} total classified agents</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${G}0d`, border: `1px solid ${G}25`, borderRadius: 8, padding: '5px 12px' }}>
                    <Icon name="bi-bar-chart-horizontal-fill" style={{ color: G, fontSize: 13 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: G }}>
                      Top: {topBenefit?.name ?? '—'} ({topBenefit?.value ?? 0} agents)
                    </span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={benefitChartHeight}>
                  <BarChart
                    data={benefitData}
                    layout="vertical"
                    margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false} tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#374151' }}
                      axisLine={false} tickLine={false}
                      width={160}
                    />
                   
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Agents">
                      {benefitData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={i === 0 ? G : BENEFIT_PALETTE[i % BENEFIT_PALETTE.length]}
                          opacity={i === 0 ? 1 : 0.82}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        content={({ value, x, y, width, height }) => {
                          if (value == null || gloTotalAgents === 0) return null
                          const pct = Math.round((value as number) / gloTotalAgents * 100)
                          return (
                            <text
                              x={(x as number) + (width as number) + 6}
                              y={(y as number) + (height as number) / 2}
                              fill="#374151" fontSize={11} fontWeight={700}
                              dominantBaseline="middle"
                            >
                              {value} <tspan fill="#9ca3af" fontWeight={400}>({pct}%)</tspan>
                            </text>
                          )
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
