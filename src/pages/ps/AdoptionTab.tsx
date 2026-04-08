import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { Cr978_coe_divisionsService } from '../../generated'
import type { Cr978_coe_divisions } from '../../generated/models/Cr978_coe_divisionsModel'
import Icon from '../../components/Icon'

interface DivisionAdoption {
  division: string
  pct: number
}

function mapToDivisionAdoption(r: Cr978_coe_divisions): DivisionAdoption {
  return {
    division: r.cr978_divisionname,
    pct:      parseFloat(r.cr435_adoptionrate ?? '0') || 0,
  }
}

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(28,28,30,0.92)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{payload[0].value}% adopted</div>
    </div>
  )
}

export default function AdoptionTab() {
  const [divisionAdoption, setDivisionAdoption] = useState<DivisionAdoption[]>([])
  const [chartLoading,     setChartLoading]     = useState(true)

  useEffect(() => {
    Cr978_coe_divisionsService.getAll().then(result => {
      if (result.data) setDivisionAdoption(result.data.map(mapToDivisionAdoption))
    }).catch((err: unknown) => {
      console.error('Failed to load divisions for adoption chart', err)
    }).finally(() => setChartLoading(false))
  }, [])

  const barColors = divisionAdoption.map(d => d.pct >= 75 ? '#007560' : d.pct >= 60 ? '#ca8a04' : '#d4cfc7')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="ps-card">
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-bar-chart-line-fill" /> AI Adoption by Division</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>% of employees trained</span>
        </div>
        <div style={{ padding: '16px 8px 8px' }}>
          {chartLoading && (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
              <Icon name="bi-arrow-repeat" style={{ marginRight: 6 }} />Loading chart…
            </div>
          )}
          {!chartLoading && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={divisionAdoption} margin={{ top: 4, right: 20, left: -16, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e5de" vertical={false} />
                <XAxis dataKey="division" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(0,117,96,0.04)' }} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="pct" position="top" formatter={(v: unknown) => `${v}%`} style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }} />
                  {divisionAdoption.map((d, i) => (
                    <Cell key={d.division} fill={barColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '8px 0 4px', flexWrap: 'wrap' }}>
            {[{ color: '#007560', label: '≥75% (Strong)' }, { color: '#ca8a04', label: '60–74% (Progressing)' }, { color: '#d4cfc7', label: '<60% (Needs Attention)' }].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6b7280' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}