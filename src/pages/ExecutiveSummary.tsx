import { useState, useEffect, useRef, type ReactNode } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ComposedChart, Line,
} from 'recharts'
import '../executive-summary.css'

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRange = 'month' | 'quarter' | 'year'

// ─── Static Data ──────────────────────────────────────────────────────────────
const PROGRAM_DATA: Record<DateRange, { category: string; count: number; color: string }[]> = {
  month: [
    { category: 'Events',       count: 4,  color: '#007560' },
    { category: 'Trainings',    count: 9,  color: '#ca8a04' },
    { category: 'Technologies', count: 3,  color: '#004937' },
    { category: 'Initiatives',  count: 2,  color: '#007560' },
  ],
  quarter: [
    { category: 'Events',       count: 11, color: '#007560' },
    { category: 'Trainings',    count: 28, color: '#ca8a04' },
    { category: 'Technologies', count: 9,  color: '#004937' },
    { category: 'Initiatives',  count: 6,  color: '#007560' },
  ],
  year: [
    { category: 'Events',       count: 38, color: '#007560' },
    { category: 'Trainings',    count: 94, color: '#ca8a04' },
    { category: 'Technologies', count: 22, color: '#004937' },
    { category: 'Initiatives',  count: 18, color: '#007560' },
  ],
}

const ROI_TREND = [
  { month: 'Oct', savings: 480,  hours: 3200 },
  { month: 'Nov', savings: 620,  hours: 3900 },
  { month: 'Dec', savings: 710,  hours: 4400 },
  { month: 'Jan', savings: 890,  hours: 5100 },
  { month: 'Feb', savings: 1050, hours: 6200 },
  { month: 'Mar', savings: 1240, hours: 7400 },
]

const RISK_CATEGORIES = [
  { label: 'Data Privacy & Compliance', count: 2, level: 'high',   color: '#dc2626' },
  { label: 'Model Bias & Fairness',     count: 3, level: 'medium', color: '#ca8a04' },
  { label: 'Operational Reliability',   count: 1, level: 'medium', color: '#ca8a04' },
  { label: 'Cybersecurity Exposure',    count: 1, level: 'low',    color: '#007560' },
  { label: 'Vendor & Third-Party',      count: 2, level: 'low',    color: '#007560' },
]

const SKILL_DOMAINS = [
  { domain: 'AI / ML Fundamentals',   pct: 78, trained: 922 },
  { domain: 'Prompt Engineering',     pct: 61, trained: 720 },
  { domain: 'Data Literacy',          pct: 84, trained: 992 },
  { domain: 'AI Ethics & Governance', pct: 55, trained: 649 },
  { domain: 'MLOps & Deployment',     pct: 38, trained: 449 },
  { domain: 'NLP & Computer Vision',  pct: 29, trained: 342 },
]

// Neural network background — stable random positions generated once
const NEURAL_NODES = [
  { id: 0,  x: 8,  y: 20, dur: 2.8, delay: 0.0 },
  { id: 1,  x: 18, y: 65, dur: 3.2, delay: 0.6 },
  { id: 2,  x: 28, y: 12, dur: 2.5, delay: 1.1 },
  { id: 3,  x: 35, y: 80, dur: 3.7, delay: 0.3 },
  { id: 4,  x: 44, y: 40, dur: 2.9, delay: 1.8 },
  { id: 5,  x: 52, y: 15, dur: 3.4, delay: 0.9 },
  { id: 6,  x: 58, y: 72, dur: 2.6, delay: 1.5 },
  { id: 7,  x: 66, y: 30, dur: 3.1, delay: 0.2 },
  { id: 8,  x: 73, y: 85, dur: 2.7, delay: 1.3 },
  { id: 9,  x: 80, y: 50, dur: 3.5, delay: 0.7 },
  { id: 10, x: 88, y: 18, dur: 2.4, delay: 2.1 },
  { id: 11, x: 93, y: 70, dur: 3.0, delay: 1.0 },
  { id: 12, x: 22, y: 45, dur: 3.3, delay: 0.4 },
  { id: 13, x: 62, y: 55, dur: 2.8, delay: 1.6 },
  { id: 14, x: 48, y: 88, dur: 3.6, delay: 0.8 },
  { id: 15, x: 76, y: 8,  dur: 2.5, delay: 2.3 },
]

const NEURAL_EDGES = [
  [0, 2], [0, 4], [1, 3], [1, 12], [2, 5], [2, 7],
  [3, 6], [4, 5], [4, 12], [5, 7], [6, 8], [7, 9],
  [8, 11], [9, 10], [9, 13], [10, 15], [11, 13], [12, 14],
  [13, 14], [14, 8], [6, 13], [15, 10],
]

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

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

// ─── Neural Network Hero ──────────────────────────────────────────────────────
function NeuralHero() {
  return (
    <div className="es2-hero">
      <svg className="es2-hero-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {NEURAL_EDGES.map(([ai, bi], idx) => {
          const a = NEURAL_NODES[ai]
          const b = NEURAL_NODES[bi]
          return (
            <line
              key={idx}
              x1={`${a.x}%`} y1={`${a.y}%`}
              x2={`${b.x}%`} y2={`${b.y}%`}
              stroke="rgba(0,255,160,0.18)"
              strokeWidth="0.35"
            >
              <animate
                attributeName="opacity"
                values="0.08;0.55;0.08"
                dur={`${3.5 + (idx % 5) * 0.6}s`}
                repeatCount="indefinite"
                begin={`${(idx % 4) * 0.7}s`}
              />
            </line>
          )
        })}
        {NEURAL_NODES.map(n => (
          <circle key={n.id} cx={`${n.x}%`} cy={`${n.y}%`} r="0.65" fill="rgba(0,255,160,0.7)">
            <animate attributeName="r"       values="0.4;1.0;0.4" dur={`${n.dur}s`} repeatCount="indefinite" begin={`${n.delay}s`} />
            <animate attributeName="opacity" values="0.25;1;0.25"  dur={`${n.dur}s`} repeatCount="indefinite" begin={`${n.delay}s`} />
          </circle>
        ))}
      </svg>
      <div className="es2-hero-content">
        <div className="es2-hero-live">
          <span className="es2-hero-live-dot" />
          Live · Q1 2026
        </div>
        <h1 className="es2-hero-title">AI Intelligence Command Center</h1>
        <p className="es2-hero-sub">DEWA Centre of Excellence · Updated 20 Mar 2026</p>
      </div>
    </div>
  )
}

// ─── Animated Circular Ring ───────────────────────────────────────────────────
function AnimatedRing({ pct, size = 82, color = '#ca8a04', go }: { pct: number; size?: number; color?: string; go: boolean }) {
  const count = useCounter(pct, 1400, go)
  const r = (size - 14) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (count / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={9} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={circ}
        strokeDashoffset={go ? offset : circ}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill="#1c1c1e" fontSize={size * 0.2} fontWeight={800}
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        {count}%
      </text>
    </svg>
  )
}

// ─── Animated Bar ─────────────────────────────────────────────────────────────
function AnimBar({ pct, color, inView }: { pct: number; color: string; inView: boolean }) {
  return (
    <div className="es2-bar-track">
      <div
        className="es2-bar-fill"
        style={{ width: inView ? `${pct}%` : '0%', background: color }}
      />
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiProps {
  icon: ReactNode
  label: string
  target: number
  displayValue?: string
  sub: string
  accent?: boolean
  showRing?: boolean
  delay?: number
}

function KpiCard({ icon, label, target, displayValue, sub, accent, showRing, delay = 0 }: KpiProps) {
  const { ref, inView } = useInView()
  const count = useCounter(target, 1400, inView)
  const display = displayValue ?? count.toLocaleString()

  return (
    <div
      ref={ref}
      className={`es2-kpi-card${accent ? ' es2-kpi-card--accent' : ''}`}
      style={{ animationDelay: `${delay}s, ${delay}s, ${delay}s` }}
    >
      <div className="es2-kpi-shimmer" />
      <div className="es2-kpi-icon">{icon}</div>
      {showRing ? (
        <div className="es2-kpi-ring"><AnimatedRing pct={target} go={inView} /></div>
      ) : (
        <div className={`es2-kpi-value${inView ? ' es2-kpi-value--in' : ''}`}>{display}</div>
      )}
      <div className="es2-kpi-label">{label}</div>
      <div className="es2-kpi-sub">{sub}</div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} className={`es2-sh${inView ? ' es2-sh--in' : ''}`}>
      <h2 className="es2-sh-title">
        <span className="es2-sh-icon">{icon}</span>
        {title}
        <span className={`es2-sh-line${inView ? ' es2-sh-line--in' : ''}`} />
      </h2>
      <span className="es2-sh-sub">{sub}</span>
    </div>
  )
}

// ─── Tooltip components ───────────────────────────────────────────────────────
function BarTip({ active, payload, label }: { active?: boolean; payload?: { value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="es2-tooltip">
      <div className="es2-tooltip-label">{label}</div>
      <div className="es2-tooltip-value" style={{ color: payload[0].fill }}>■ {payload[0].value} programs</div>
    </div>
  )
}

function RoiTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="es2-tooltip">
      <div className="es2-tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="es2-tooltip-value" style={{ color: p.color, marginTop: 2 }}>
          ■ {p.name === 'savings' ? `AED ${p.value}K saved` : `${p.value.toLocaleString()} hrs`}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExecutiveSummary() {
  const [dateRange, setDateRange] = useState<DateRange>('quarter')
  const programData   = PROGRAM_DATA[dateRange]
  const totalPrograms = programData.reduce((s, d) => s + d.count, 0)

  const { ref: wfRef,    inView: wfInView    } = useInView()
  const { ref: skillRef, inView: skillInView } = useInView()

  const iconKpi = (path: string) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d={path} />
    </svg>
  )

  return (
    <div className="es2-root">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <NeuralHero />

      {/* ── SECTION 1: KPIs ──────────────────────────────────────── */}
      <div className="es2-section" style={{ animationDelay: '0.05s' }}>
        <SectionHeader
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ca8a04" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.39.39 0 0 0-.029-.518z"/>
              <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A8 8 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3"/>
            </svg>
          }
          title="Key Performance Indicators"
          sub="Q1 2026 · Updated 20 Mar 2026"
        />
        <div className="es2-kpi-grid">
          <KpiCard
            accent showRing
            icon={iconKpi('M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5')}
            label="AI Adoption Rate"
            target={64}
            sub="Across all divisions"
            delay={0}
          />
          <KpiCard
            icon={iconKpi('M6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM5.5.5a.5.5 0 0 0-1 0V2A2.5 2.5 0 0 0 2 4.5H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2A2.5 2.5 0 0 0 4.5 14v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14a2.5 2.5 0 0 0 2.5-2.5h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14A2.5 2.5 0 0 0 11.5 2V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1zm1 4.5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3A1.5 1.5 0 0 1 6.5 5')}
            label="Total AI Initiatives"
            target={47}
            sub="+6 from last quarter ↑"
            delay={0.08}
          />
          <KpiCard
            icon={iconKpi('M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1')}
            label="Active AI Projects"
            target={31}
            sub="7 new this quarter"
            delay={0.16}
          />
          <KpiCard
            icon={iconKpi('M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917zM4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466z')}
            label="People Trained in AI"
            target={1182}
            sub="Target: 1,500 by Q2"
            delay={0.24}
          />
        </div>
      </div>

      {/* ── SECTION 2: Impact Analysis ────────────────────────────── */}
      <div className="es2-section" style={{ animationDelay: '0.12s' }}>
        <SectionHeader
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ca8a04" viewBox="0 0 16 16">
              <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
            </svg>
          }
          title="Impact Analysis"
          sub="Business value delivered · Oct 2025 – Mar 2026"
        />

        <div className="es2-impact-grid">
          {[
            { c: 'green',  icon: '💰', value: 'AED 4.2M', label: 'Cost Savings Realized',      sub: '+38% vs same period last year', delay: 0    },
            { c: 'blue',   icon: '⏱', value: '28,400',   label: 'Process Hours Automated',     sub: 'Equivalent to 14.2 FTEs',        delay: 0.08 },
            { c: 'amber',  icon: '⚡', value: '+34%',     label: 'Operational Efficiency Gain', sub: 'Across automated workflows',     delay: 0.16 },
            { c: 'purple', icon: '✓',  value: '−62%',     label: 'Error Rate Reduction',        sub: 'In AI-assisted processes',       delay: 0.24 },
          ].map(card => (
            <div
              key={card.c}
              className={`es2-impact-card es2-impact-card--${card.c}`}
              style={{ animationDelay: `${card.delay}s` }}
            >
              <div className="es2-impact-icon">{card.icon}</div>
              <div className="es2-impact-value">{card.value}</div>
              <div className="es2-impact-label">{card.label}</div>
              <div className="es2-impact-sub">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ROI Trend Chart */}
        <div className="es2-chart-card">
          <div className="es2-chart-header">
            <span className="es2-chart-title">Monthly ROI Trend — Cost Savings &amp; Hours Automated</span>
            <span className="es2-chart-badge">6-month · Oct–Mar 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={ROI_TREND} margin={{ top: 8, right: 52, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#ca8a04' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip content={<RoiTip />} />
              <Bar yAxisId="left" dataKey="savings" name="savings" fill="#007560" radius={[6, 6, 0, 0]} barSize={30} opacity={0.9} />
              <Line yAxisId="right" type="monotone" dataKey="hours" name="hours" stroke="#ca8a04" strokeWidth={2.5} dot={{ r: 4, fill: '#ca8a04', stroke: '#17271f', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="es2-chart-legend">
            <span className="es2-legend-item"><span style={{ background: '#007560' }} />Cost Savings (AED K) — bars</span>
            <span className="es2-legend-item"><span style={{ background: '#ca8a04' }} />Process Hours Saved — line</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Risk & Governance ─────────────────────────── */}
      <div className="es2-section" style={{ animationDelay: '0.18s' }}>
        <SectionHeader
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ca8a04" viewBox="0 0 16 16">
              <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .201 0q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524z"/>
              <path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0z"/>
            </svg>
          }
          title="AI Risk & Governance"
          sub="Governance health · Q1 2026"
        />
        <div className="es2-risk-row">
          <div className="es2-risk-stats">
            {[
              { val: '9',   label: 'Open Risk Items',       sub: '2 high · 4 med · 3 low',    cls: 'red',   delay: 0    },
              { val: '94%', label: 'AI Compliance Score',   sub: 'Policies & regulations',     cls: 'green', delay: 0.07 },
              { val: '3',   label: 'Active AI Incidents',   sub: '12 resolved this quarter',   cls: 'amber', delay: 0.14 },
              { val: '88%', label: 'Model Audit Coverage',  sub: '22 of 25 models audited',    cls: 'blue',  delay: 0.21 },
            ].map(s => (
              <div key={s.label} className={`es2-risk-stat es2-risk-stat--${s.cls}`} style={{ animationDelay: `${s.delay}s` }}>
                <div className="es2-risk-stat-val">{s.val}</div>
                <div className="es2-risk-stat-label">{s.label}</div>
                <div className="es2-risk-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="es2-risk-breakdown">
            <div className="es2-risk-bd-title">Risk by Category</div>
            {RISK_CATEGORIES.map(r => (
              <div key={r.label} className="es2-risk-item">
                <span className="es2-risk-item-label">{r.label}</span>
                <div className="es2-risk-item-right">
                  <span
                    className="es2-risk-badge"
                    style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}33` }}
                  >{r.level}</span>
                  <span className="es2-risk-count">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Workforce Readiness ────────────────────────── */}
      <div className="es2-section" style={{ animationDelay: '0.24s' }}>
        <SectionHeader
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ca8a04" viewBox="0 0 16 16">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
            </svg>
          }
          title="AI Workforce Readiness"
          sub="Training & skill progress · Target Q2 2026"
        />
        <div className="es2-wf-row">
          <div ref={wfRef} className="es2-wf-metrics">
            {[
              { val: '1,182', label: 'Employees Trained',          sub: 'of 1,500 target',    pct: 78.8, color: '#007560' },
              { val: '89',    label: 'Certified AI Practitioners',  sub: '+23 this quarter',   pct: 59,   color: '#0891b2' },
              { val: '6',     label: 'Active Learning Paths',       sub: '420 in progress',    pct: 100,  color: '#ca8a04' },
              { val: '4.1/5', label: 'Avg Assessment Score',        sub: 'Across all modules', pct: 82,   color: '#7c3aed' },
            ].map(m => (
              <div key={m.label} className="es2-wf-card">
                <div className="es2-wf-val" style={{ color: m.color }}>{m.val}</div>
                <div className="es2-wf-label">{m.label}</div>
                <div className="es2-wf-sub">{m.sub}</div>
                <AnimBar pct={m.pct} color={m.color} inView={wfInView} />
                <div className="es2-wf-pct">{m.pct}%</div>
              </div>
            ))}
          </div>

          <div ref={skillRef} className="es2-skill-panel">
            <div className="es2-skill-title">Skill Domain Completion</div>
            {SKILL_DOMAINS.map(s => {
              const color = s.pct >= 70 ? '#007560' : s.pct >= 50 ? '#ca8a04' : '#dc2626'
              return (
                <div key={s.domain} className="es2-skill-item">
                  <div className="es2-skill-row">
                    <span className="es2-skill-name">{s.domain}</span>
                    <span className="es2-skill-stat" style={{ color }}>{s.pct}%</span>
                  </div>
                  <AnimBar pct={s.pct} color={color} inView={skillInView} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Programs Overview ──────────────────────────── */}
      <div className="es2-section" style={{ animationDelay: '0.30s' }}>
        <div className="es2-sh es2-sh--in">
          <h2 className="es2-sh-title">
            <span className="es2-sh-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ca8a04" viewBox="0 0 16 16">
                <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-5 4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
              </svg>
            </span>
            AI Programs Overview
          </h2>
          <div className="es2-tab-filter">
            {(['month', 'quarter', 'year'] as DateRange[]).map(r => (
              <button
                key={r}
                className={`es2-tab${dateRange === r ? ' es2-tab--active' : ''}`}
                onClick={() => setDateRange(r)}
              >
                {r === 'month' ? 'This Month' : r === 'quarter' ? 'This Quarter' : 'This Year'}
              </button>
            ))}
          </div>
        </div>

        <div className="es2-programs-grid">
          <div className="es2-chart-card">
            <div className="es2-chart-header">
              <span className="es2-chart-title">Programs by Category</span>
              <span className="es2-chart-badge">{totalPrograms} total</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={programData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }} barSize={46}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(0,117,96,0.06)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {programData.map(e => <Cell key={e.category} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="es2-program-tiles">
            {programData.map((p, i) => (
              <div
                key={p.category}
                className="es2-program-tile"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="es2-program-tile-dot" style={{ background: p.color }} />
                <div className="es2-program-tile-body">
                  <div className="es2-program-tile-val" style={{ color: p.color }}>{p.count}</div>
                  <div className="es2-program-tile-label">{p.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
