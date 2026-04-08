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

type AdoptionStatus = 'Active' | 'Inactive'

interface EmployeeRow {
  id:         string
  name:       string
  email:      string
  role:       string
  division:   string
  department: string
  aiTools:    string[]
  status:     AdoptionStatus
}

// Build lookup maps: GUID → display name
type DivMap  = Map<string, string>
type DeptMap = Map<string, string>
type RoleMap = Map<string, string>

function mapToPerson(
  r:       Cr978_coe_persons,
  divMap:  DivMap,
  deptMap: DeptMap,
  roleMap: RoleMap,
): EmployeeRow {
  // _cr978_coe_division_value  = GUID FK → compare with cr978_coe_divisionid
  // _cr978_departmentid_value  = GUID FK → compare with cr978_coe_departmentid
  // _cr978_roleid_value        = GUID FK → compare with cr978_coe_approleid
  const divName  = (r._cr978_coe_division_value  ? divMap.get(r._cr978_coe_division_value)  : undefined) ?? ''
  const deptName = (r._cr978_departmentid_value   ? deptMap.get(r._cr978_departmentid_value)  : undefined) ?? ''
  const roleName = (r._cr978_roleid_value         ? roleMap.get(r._cr978_roleid_value)         : undefined) ?? ''

  return {
    id:         r.cr978_coe_personid,
    name:       r.cr978_personname,
    email:      r.cr978_email ?? '',
    role:       roleName,
    division:   divName,
    department: deptName,
    aiTools:    ['Copilot'],
    status:     r.statecode === 0 ? 'Active' : 'Inactive',
  }
}

function StatusBadge({ status }: { status: AdoptionStatus }) {
  const cls = status === 'Active' ? 'active' : 'notstarted'
  return (
    <span className={`ps-status ps-status-${cls}`}>
      <span className="ps-status-dot" />
      {status}
    </span>
  )
}

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

  const [search,       setSearch]       = useState('')
  const [divFilter,    setDivFilter]    = useState('All')
  const [deptFilter,   setDeptFilter]   = useState('All')
  const [roleFilter,   setRoleFilter]   = useState('All')
  const [statusFilter, setStatusFilter] = useState<AdoptionStatus | 'All'>('All')

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

      // Build Maps: id → name
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

  const total    = employees.length
  const active   = employees.filter(e => e.status === 'Active').length
  const inactive = employees.filter(e => e.status === 'Inactive').length

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const q      = search.toLowerCase()
      const matchQ = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
      const matchD    = divFilter    === 'All' || e.division   === divFilter
      const matchDept = deptFilter   === 'All' || e.department === deptFilter
      const matchR    = roleFilter   === 'All' || e.role       === roleFilter
      const matchS    = statusFilter === 'All' || e.status     === statusFilter
      return matchQ && matchD && matchDept && matchR && matchS
    })
  }, [employees, search, divFilter, deptFilter, roleFilter, statusFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* KPI stats */}
      <div className="ps-stat-row">
        {[
          { label: 'Total Employees', value: total,    icon: 'bi-people-fill',       bg: 'rgba(0,51,102,0.08)',   color: '#003366' },
          { label: 'Active',          value: active,   icon: 'bi-check-circle-fill', bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
          { label: 'Inactive',        value: inactive, icon: 'bi-x-circle',          bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
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

      {/* Table card */}
      <div className="ps-card">
        <div className="ps-card-header">
          <span className="ps-card-title"><Icon name="bi-table" /> Employee Adoption Detail</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} of {total} employees</span>
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
          <select className="ps-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as AdoptionStatus | 'All')}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
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
                  <td><StatusBadge status={e.status} /></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>
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
