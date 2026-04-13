import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { SKILLS, type SkillCategory } from './data'
import Icon from '../../components/Icon'

const CAT_COLORS: Record<SkillCategory, string> = {
  'AI/ML':       '#007560',
  'Data':        '#ca8a04',
  'Tools':       '#004937',
  'Programming': '#004937',
}

const CATEGORIES: (SkillCategory | 'All')[] = ['All', 'AI/ML', 'Data', 'Tools', 'Programming']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const skill = SKILLS.find(s => s.name === label)
  return (
    <div style={{ background: 'rgba(28,28,30,0.92)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{payload[0].value} employees</div>
      {skill && (
        <div style={{ fontSize: 10, color: payload[0].fill, marginTop: 2, fontWeight: 600 }}>{skill.category}</div>
      )}
    </div>
  )
}

export default function SkillsTab() {
  const [catFilter, setCatFilter] = useState<SkillCategory | 'All'>('All')

  const filtered = useMemo(() =>
    SKILLS
      .filter(s => catFilter === 'All' || s.category === catFilter)
      .sort((a, b) => b.count - a.count),
    [catFilter]
  )

  const maxCount = Math.max(...SKILLS.map(s => s.count))
  const minCount = Math.min(...SKILLS.map(s => s.count))

  // Tag cloud font scale: 11px – 26px
  function tagFontSize(count: number) {
    const ratio = (count - minCount) / (maxCount - minCount)
    return Math.round(11 + ratio * 15)
  }

  function tagOpacity(count: number) {
    const ratio = (count - minCount) / (maxCount - minCount)
    return 0.55 + ratio * 0.45
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(Object.entries(CAT_COLORS) as [SkillCategory, string][]).map(([cat, color]) => {
          const cnt = SKILLS.filter(s => s.category === cat).length
          const total = SKILLS.filter(s => s.category === cat).reduce((a, s) => a + s.count, 0)
          return (
            <div key={cat} style={{
              background: '#fff', border: '1px solid rgba(0,117,96,0.15)',
              borderLeft: `4px solid ${color}`,
              borderRadius: 10, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              boxShadow: catFilter === cat ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
              transform: catFilter === cat ? 'translateY(-1px)' : undefined,
              transition: 'all 0.18s',
            }} onClick={() => setCatFilter(catFilter === cat ? 'All' : cat)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color }}>{cnt}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>skills</div>
              </div>
              <div style={{ width: 1, height: 28, background: '#e8e5de' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{cat}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{total} total usage</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bar chart — overflow:visible lets the Recharts tooltip escape the card clip */}
      <div className="ps-card" style={{ overflow: 'visible' }}>
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-bar-chart-horizontal-fill" /> Skill Frequency by Employee Count</span>
          <div className="ps-cat-filters">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`ps-cat-btn${catFilter === c ? ' active' : ''}`}
                onClick={() => setCatFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 8px 8px' }}>
          <ResponsiveContainer width="100%" height={Math.max(260, filtered.length * 34)}>
            <BarChart
              data={filtered}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5de" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 160]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,117,96,0.04)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fontWeight: 600, fill: '#374151' }}>
                {filtered.map(s => (
                  <Cell key={s.name} fill={CAT_COLORS[s.category]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tag cloud */}
      <div className="ps-card">
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-tags-fill" /> Skills Tag Cloud</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Size reflects frequency · Click category cards above to filter</span>
        </div>
        <div className="ps-tag-cloud">
          {filtered.map(s => (
            <span
              key={s.name}
              className="ps-skill-tag"
              style={{
                fontSize: tagFontSize(s.count),
                background: `${CAT_COLORS[s.category]}12`,
                color: CAT_COLORS[s.category],
                opacity: tagOpacity(s.count),
                border: `1.5px solid ${CAT_COLORS[s.category]}25`,
                fontWeight: s.count > 80 ? 700 : 500,
              }}
              title={`${s.name}: ${s.count} employees`}
            >
              {s.name}
              <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{s.count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
