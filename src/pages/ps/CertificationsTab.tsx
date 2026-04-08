import { useState, useMemo } from 'react'
import { CERTIFICATIONS, type CertStatus, type CertProvider } from './data'
import Icon from '../../components/Icon'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function StatusBadge({ status }: { status: CertStatus }) {
  const cls = status === 'Completed' ? 'completed' : status === 'In Progress' ? 'inprogress' : 'expired'
  return (
    <span className={`ps-status ps-status-${cls}`}>
      <span className="ps-status-dot" />
      {status}
    </span>
  )
}

function ProviderBadge({ provider }: { provider: CertProvider }) {
  const cls = provider === 'Microsoft' ? 'microsoft'
    : provider === 'Google' ? 'google'
    : provider === 'AWS' ? 'aws'
    : provider === 'Coursera' ? 'coursera'
    : 'dewa'
  const icons: Record<CertProvider, string> = {
    Microsoft: 'bi-windows',
    Google: 'bi-google',
    AWS: 'bi-cloud-fill',
    Coursera: 'bi-mortarboard-fill',
    'DEWA Internal': 'bi-building',
  }
  return (
    <span className={`ps-provider ps-provider-${cls}`}>
      <Icon name={icons[provider]} style={{ fontSize: 11 }} />
      {provider}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CertificationsTab() {
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState<CertStatus | 'All'>('All')
  const [provF, setProvF]     = useState<CertProvider | 'All'>('All')

  const completed  = CERTIFICATIONS.filter(c => c.status === 'Completed').length
  const inProgress = CERTIFICATIONS.filter(c => c.status === 'In Progress').length
  const expired    = CERTIFICATIONS.filter(c => c.status === 'Expired').length

  const filtered = useMemo(() => {
    return CERTIFICATIONS.filter(c => {
      const q = search.toLowerCase()
      const matchQ = !q || c.employeeName.toLowerCase().includes(q) || c.certName.toLowerCase().includes(q)
      const matchS = statusF === 'All' || c.status === statusF
      const matchP = provF   === 'All' || c.provider === provF
      return matchQ && matchS && matchP
    })
  }, [search, statusF, provF])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary cards */}
      <div className="ps-stat-row">
        {[
          { label: 'Total Certifications', value: CERTIFICATIONS.length, icon: 'bi-patch-check-fill',    bg: 'rgba(0,51,102,0.08)',   color: '#003366' },
          { label: 'Completed',            value: completed,              icon: 'bi-check-circle-fill',   bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
          { label: 'In Progress',          value: inProgress,             icon: 'bi-hourglass-split',      bg: 'rgba(245,166,35,0.12)', color: '#b07d10' },
          { label: 'Expired',              value: expired,                icon: 'bi-exclamation-circle-fill', bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
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

      {/* Provider breakdown */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['Microsoft', 'Google', 'AWS', 'Coursera', 'DEWA Internal'] as CertProvider[]).map(p => {
          const cnt = CERTIFICATIONS.filter(c => c.provider === p).length
          return (
            <div key={p} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 10, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <ProviderBadge provider={p} />
              <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{cnt}</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>certs</span>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="ps-card">
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-award-fill" /> Certification Registry</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} of {CERTIFICATIONS.length}</span>
        </div>
        <div className="ps-filter-bar">
          <input
            className="ps-search"
            placeholder="Search employee or certification…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="ps-select" value={statusF} onChange={e => setStatusF(e.target.value as CertStatus | 'All')}>
            <option value="All">All Status</option>
            <option>Completed</option>
            <option>In Progress</option>
            <option>Expired</option>
          </select>
          <select className="ps-select" value={provF} onChange={e => setProvF(e.target.value as CertProvider | 'All')}>
            <option value="All">All Providers</option>
            <option>Microsoft</option>
            <option>Google</option>
            <option>AWS</option>
            <option>Coursera</option>
            <option>DEWA Internal</option>
          </select>
        </div>
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Certification</th>
                <th>Provider</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="ps-person-cell">
                      <div className="ps-avatar">{initials(c.employeeName)}</div>
                      <div>
                        <div className="ps-person-name">{c.employeeName}</div>
                        <div className="ps-person-role">{c.division}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: '#111827', maxWidth: 240 }}>{c.certName}</td>
                  <td><ProviderBadge provider={c.provider} /></td>
                  <td style={{ color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(c.date)}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>No certifications match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
