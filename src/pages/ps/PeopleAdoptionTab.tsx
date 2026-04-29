import { useState, useMemo, useEffect } from 'react'
import { Cr978_coe_personsService }     from '../../generated'
import { Cr978_coe_divisionsService }   from '../../generated'
import { Cr978_coe_departmentsService } from '../../generated'
import { Cr978_coe_approlesService }    from '../../generated'
import type { Cr978_coe_persons }       from '../../generated/models/Cr978_coe_personsModel'
import type { Cr978_coe_divisions }     from '../../generated/models/Cr978_coe_divisionsModel'
import type { Cr978_coe_departments }   from '../../generated/models/Cr978_coe_departmentsModel'
import type { Cr978_coe_approles }      from '../../generated/models/Cr978_coe_approlesModel'
import Icon from '../../components/Icon'

interface EmployeeRow {
  id:         string
  name:       string
  email:      string
  role:       string
  division:   string
  department: string
  aiTools:    string[]
}

type DivMap  = Map<string, string>
type DeptMap = Map<string, string>
type RoleMap = Map<string, string>

function mapToPerson(
  r:       Cr978_coe_persons,
  divMap:  DivMap,
  deptMap: DeptMap,
  roleMap: RoleMap,
): EmployeeRow {
  const divName  = (r._cr978_coe_division_value ? divMap.get(r._cr978_coe_division_value)   : undefined) ?? ''
  const deptName = (r._cr978_departmentid_value  ? deptMap.get(r._cr978_departmentid_value)  : undefined) ?? ''
  const roleName = (r._cr978_roleid_value        ? roleMap.get(r._cr978_roleid_value)         : undefined) ?? ''
  return {
    id:         r.cr978_coe_personid,
    name:       r.cr978_personname,
    email:      r.cr978_email ?? '',
    role:       roleName,
    division:   divName,
    department: deptName,
    aiTools:    ['Copilot'],
  }
}

// keyword → icon — only icons embedded in Icon.tsx are used here
const ROLE_KEYWORD_ICONS: [string, string][] = [
  ['director',    'bi-building'],
  ['vp',          'bi-building'],
  ['chief',       'bi-building'],
  ['head',        'bi-award-fill'],
  ['manager',     'bi-kanban-fill'],
  ['lead',        'bi-star-fill'],
  ['supervisor',  'bi-star-fill'],
  ['architect',   'bi-diagram-3-fill'],
  ['developer',   'bi-code-slash'],
  ['programmer',  'bi-code-slash'],
  ['engineer',    'bi-cpu-fill'],
  ['analyst',     'bi-bar-chart-line-fill'],
  ['data',        'bi-database-exclamation'],
  ['scientist',   'bi-lightbulb-fill'],
  ['researcher',  'bi-search'],
  ['designer',    'bi-grid-3x3-gap'],
  ['consultant',  'bi-person-video3'],
  ['specialist',  'bi-star-fill'],
  ['coordinator', 'bi-clipboard-check-fill'],
  ['officer',     'bi-shield-check'],
  ['admin',       'bi-key-fill'],
  ['security',    'bi-shield-check'],
  ['finance',     'bi-currency-dirham'],
  ['legal',       'bi-file-text'],
  ['hr',          'bi-people-fill'],
  ['human',       'bi-people-fill'],
  ['project',     'bi-clipboard-check-fill'],
  ['product',     'bi-collection-fill'],
  ['operations',  'bi-gear'],
  ['ops',         'bi-gear'],
  ['support',     'bi-chat-dots-fill'],
  ['trainer',     'bi-mortarboard-fill'],
  ['champion',    'bi-trophy-fill'],
  ['practitioner','bi-tools'],
  ['user',        'bi-person'],
  ['intern',      'bi-person'],
]
const DEFAULT_ROLE_ICON = 'bi-person'

function roleIcon(role: string): string {
  const lower = role.toLowerCase()
  for (const [kw, icon] of ROLE_KEYWORD_ICONS) {
    if (lower.includes(kw)) return icon
  }
  return DEFAULT_ROLE_ICON
}

const ROLE_COLOURS = [
  { color: '#005a47', bg: 'rgba(0,90,71,0.09)'   },
  { color: '#b07d10', bg: 'rgba(202,138,4,0.10)' },
  { color: '#0d4270', bg: 'rgba(13,66,112,0.09)' },
  { color: '#6e44b2', bg: 'rgba(110,68,178,0.09)'},
  { color: '#0e7490', bg: 'rgba(14,116,144,0.09)'},
  { color: '#9f1239', bg: 'rgba(159,18,57,0.09)' },
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function PeopleAdoptionTab() {
  const [employees,   setEmployees]   = useState<EmployeeRow[]>([])
  const [divisions,   setDivisions]   = useState<Cr978_coe_divisions[]>([])
  const [departments, setDepartments] = useState<Cr978_coe_departments[]>([])
  const [approles,    setApproles]    = useState<Cr978_coe_approles[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  const [search,     setSearch]     = useState('')
  const [divFilter,  setDivFilter]  = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')

  useEffect(() => {
    Promise.all([
      Cr978_coe_personsService.getAll(),
      Cr978_coe_divisionsService.getAll(),
      Cr978_coe_departmentsService.getAll(),
      Cr978_coe_approlesService.getAll(),
    ]).then(([persons, divs, depts, roles]) => {
      const divsData  = divs.data  ?? []
      const deptsData = depts.data ?? []
      const rolesData = roles.data ?? []

      const divMap:  DivMap  = new Map(divsData.map(d  => [d.cr978_coe_divisionid,   d.cr978_divisionname]))
      const deptMap: DeptMap = new Map(deptsData.map(d => [d.cr978_coe_departmentid, d.cr978_departmentname]))
      const roleMap: RoleMap = new Map(rolesData.map(r => [r.cr978_coe_approleid,    r.cr978_rolename]))

      if (persons.data) {
        setEmployees(persons.data.map(p => mapToPerson(p, divMap, deptMap, roleMap)))
      }
      setDivisions(divsData)
      setDepartments(deptsData)
      setApproles(rolesData)
    }).catch((err: unknown) => {
      console.error('Failed to load people data', err)
      setError('Failed to load employee data from Dataverse.')
    }).finally(() => setLoading(false))
  }, [])

  // Count by role across all employees (unfiltered)
  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of employees) {
      const label = e.role || 'Unassigned'
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([role, count], i) => ({
        role, count,
        icon:  roleIcon(role),
        color: ROLE_COLOURS[i % ROLE_COLOURS.length].color,
        bg:    ROLE_COLOURS[i % ROLE_COLOURS.length].bg,
      }))
  }, [employees])

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const q      = search.toLowerCase()
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
      const matchD    = divFilter  === 'All' || e.division   === divFilter
      const matchDept = deptFilter === 'All' || e.department === deptFilter
      const matchR    = roleFilter === 'All' || e.role       === roleFilter
      return matchQ && matchD && matchDept && matchR
    })
  }, [employees, search, divFilter, deptFilter, roleFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Role breakdown cards */}
      {loading ? (
        <div className="ps-stat-row">
          {[1, 2, 3].map(i => (
            <div className="ps-stat-mini" key={i} style={{ opacity: 0.4 }}>
              <div className="ps-stat-mini-icon" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
                <Icon name="bi-person-fill" />
              </div>
              <div>
                <div className="ps-stat-mini-val">—</div>
                <div className="ps-stat-mini-lbl">Loading…</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ps-stat-row" style={{ flexWrap: 'wrap' }}>
          {roleCounts.map(r => (
            <div className="ps-stat-mini" key={r.role}>
              <div className="ps-stat-mini-icon" style={{ background: r.bg, color: r.color }}>
                <Icon name={r.icon} />
              </div>
              <div>
                <div className="ps-stat-mini-val" style={{ color: r.color }}>{r.count}</div>
                <div className="ps-stat-mini-lbl">{r.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="ps-card">
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-table" /> Employee Adoption Detail</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} of {employees.length} employees</span>
        </div>

        {/* Filters */}
        <div className="ps-filter-bar">
          <input
            className="ps-search"
            placeholder="Search name, email, department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="ps-select" value={divFilter} onChange={e => setDivFilter(e.target.value)}>
            <option value="All">All Divisions</option>
            {divisions.map(d => (
              <option key={d.cr978_coe_divisionid} value={d.cr978_divisionname}>
                {d.cr978_divisionname}
              </option>
            ))}
          </select>
          <select className="ps-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.cr978_coe_departmentid} value={d.cr978_departmentname}>
                {d.cr978_departmentname}
              </option>
            ))}
          </select>
          <select className="ps-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            {approles.map(r => (
              <option key={r.cr978_coe_approleid} value={r.cr978_rolename}>
                {r.cr978_rolename}
              </option>
            ))}
          </select>
        </div>

        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Role</th>
                <th>Division</th>
                <th>Department</th>
                <th>AI Tools Used</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                    <Icon name="bi-arrow-repeat" style={{ marginRight: 6 }} />Loading employees…
                  </td>
                </tr>
              )}
              {!loading && filtered.map(e => (
                <tr key={e.id}>
                  <td>
                    <div className="ps-person-cell">
                      <div className="ps-avatar">{initials(e.name)}</div>
                      <div className="ps-person-name">{e.name}</div>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 12 }}>{e.email || '—'}</td>
                  <td style={{ fontWeight: 500, color: '#374151' }}>{e.role || '—'}</td>
                  <td style={{ color: '#374151' }}>{e.division || '—'}</td>
                  <td style={{ color: '#6b7280' }}>{e.department || '—'}</td>
                  <td>
                    <div className="ps-tool-tags">
                      {e.aiTools.map(t => <span key={t} className="ps-tool-tag">{t}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                    No employees match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
