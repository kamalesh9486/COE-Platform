import { useState, useMemo, useEffect } from 'react'
import { type AppEvent, type EventStatus, type EventType, type Program, type ProgramStatus } from './prog/data'
import { Cr978_coe_eventsesService, Cr978_coe_divisionsService } from '../generated'
import type { Cr978_coe_eventses } from '../generated/models/Cr978_coe_eventsesModel'
import CalendarView from './prog/CalendarView'
import '../programs.css'
import Icon from '../components/Icon'
import { useScrollLock } from '../hooks/useScrollLock'

// ── Map Dataverse record → AppEvent ──────────────────────────
function mapToAppEvent(r: Cr978_coe_eventses, divisionMap: Map<string, string>): AppEvent {
  // Status mapping
  const STATUS_MAP: Record<number, EventStatus> = {
    893470003: 'Completed',
    893470004: 'Cancelled',
  }
  const status: EventStatus = STATUS_MAP[r.cr978_coe_event_status as number] ?? 'Upcoming'

  // Type mapping
  const TYPE_MAP: Record<number, EventType> = {
    893470000: 'Webinar',
    893470001: 'Seminar',
    893470002: 'Workshop',
    893470003: 'Hackathon',
  }
  const type: EventType = TYPE_MAP[r.cr978_coe_eventtype as number] ?? 'Workshop'

  // Date: extract YYYY-MM-DD from ISO string
  const date = r.cr978_coe_eventdate ? r.cr978_coe_eventdate.split('T')[0] : ''

  // Time: combine start and end time
  const start = r.cr978_coe_eventstarttime ?? ''
  const end   = r.cr978_coe_eventendtime   ?? ''
  const time  = start && end ? `${start} – ${end}` : start || end || ''

  // Speakers: derive from trainer field
  const speakers = r.cr978_coe_eventtrainer
    ? [{ name: r.cr978_coe_eventtrainer, title: 'Trainer', division: r.cr978_coe_eventdivision ?? '' }]
    : []

  const attendees = parseInt(r.cr978_coe_nofattendees ?? '0', 10) || 0
  const invitees  = parseInt(r.cr978_coe_noofinvitees  ?? '0', 10) || 0
  const adoptionRate = invitees > 0 ? Math.round((attendees / invitees) * 100) : undefined

  return {
    id:            r.cr978_coe_eventsid,
    programId:     r._cr978_coe_program_value ?? '',
    title:         r.cr978_coe_eventname,
    type,
    date,
    time,
    location:      r.cr978_coe_eventvenue ?? '',
    attendees,
    status,
    description:   r.cr978_coe_description ?? '',
    speakers,
    attendeesList: [],
    outcomes:      [],
    // Extended fields
    duration:      r.cr978_coe_eventduration,
    invitees:      invitees || undefined,
    adoptionRate,
    techStack:     r.cr978_coe_eventtechstackname,
    eventCode:     r.cr978_coe_eventcode,
    targetAudience: r.cr978_coe_targetedaudience,
    division:      divisionMap.get(r._cr978_coe_division_value ?? '') ?? r.cr978_coe_divisionname,
    program:       r.cr978_coe_programname,
  }
}

type ViewMode = 'list' | 'calendar'
type TabFilter = EventStatus | 'All'

// ── Helpers ──────────────────────────────────────────────────
function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Type badge ───────────────────────────────────────────────
const TYPE_CLASS: Record<EventType, string> = {
  Workshop:   'ev-type-workshop',
  Seminar:    'ev-type-seminar',
  Hackathon:  'ev-type-hackathon',
  Webinar:    'ev-type-webinar',
  'Town Hall':'ev-type-town-hall',
}
const TYPE_ICONS: Record<EventType, string> = {
  Workshop:   'bi-tools',
  Seminar:    'bi-person-video3',
  Hackathon:  'bi-lightning-charge-fill',
  Webinar:    'bi-camera-video-fill',
  'Town Hall':'bi-people-fill',
}

function TypeBadge({ type }: { type: EventType }) {
  return (
    <span className={`ev-type ${TYPE_CLASS[type]}`}>
      <Icon name={TYPE_ICONS[type]} style={{ fontSize: 10 }} /> {type}
    </span>
  )
}

// ── Status badge ─────────────────────────────────────────────
const STATUS_PILLAR: Record<EventStatus, string> = {
  Upcoming:  '#ca8a04',
  Completed: '#007560',
  Cancelled: '#dc2626',
}

function StatusBadge({ status }: { status: EventStatus }) {
  const cls = status === 'Upcoming' ? 'active' : status === 'Completed' ? 'completed' : 'cancelled'
  return (
    <span className={`prog-badge prog-badge-${cls}`}>
      <span className="prog-badge-dot" />{status}
    </span>
  )
}

// ── Event Modal ──────────────────────────────────────────────
function EventModal({ event: ev, onClose }: { event: AppEvent; onClose: () => void }) {
  useScrollLock()
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header"
          style={{ background: `linear-gradient(135deg, ${STATUS_PILLAR[ev.status]}dd 0%, ${STATUS_PILLAR[ev.status]} 100%)` }}
        >
          <div className="modal-header-info">
            <div className="modal-title" style={{ color: '#fff' }}>{ev.title}</div>
            <div className="modal-badges">
              <TypeBadge type={ev.type} />
              <StatusBadge status={ev.status} />
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Icon name="bi-x-lg" />
          </button>
        </div>

        <div className="modal-body">
          {/* Meta */}
          <div className="modal-meta-grid">
            <div className="modal-meta-cell">
              <div className="modal-meta-label">Date</div>
              <div className="modal-meta-value">{formatDateFull(ev.date)}</div>
            </div>
            <div className="modal-meta-cell">
              <div className="modal-meta-label">Time</div>
              <div className="modal-meta-value">{ev.time}</div>
            </div>
            <div className="modal-meta-cell" style={{ gridColumn: '1 / -1' }}>
              <div className="modal-meta-label">Location</div>
              <div className="modal-meta-value" style={{ fontSize: 12, fontWeight: 500 }}>{ev.location}</div>
            </div>
            <div className="modal-meta-cell" style={{ gridColumn: '1 / -1' }}>
              <div className="modal-meta-label">Division</div>
              <div className="modal-meta-value">
                {ev.division ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,117,96,0.08)', color: '#007560', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    <Icon name="bi-building" style={{ fontSize: 11 }} />{ev.division}
                  </span>
                ) : '—'}
              </div>
            </div>
            <div className="modal-meta-cell">
              <div className="modal-meta-label">Total Attendees</div>
              <div className="modal-meta-value">{ev.attendees > 0 ? ev.attendees.toLocaleString() : '—'}</div>
            </div>
            <div className="modal-meta-cell">
              <div className="modal-meta-label">Total Invitees</div>
              <div className="modal-meta-value">{ev.invitees ? ev.invitees.toLocaleString() : '—'}</div>
            </div>
            <div className="modal-meta-cell">
              <div className="modal-meta-label">Duration</div>
              <div className="modal-meta-value">{ev.duration || '—'}</div>
            </div>
            <div className="modal-meta-cell">
              <div className="modal-meta-label">Adoption Rate</div>
              <div className="modal-meta-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {ev.adoptionRate !== undefined ? (
                  <>
                    <span style={{ fontWeight: 700, color: ev.adoptionRate >= 75 ? '#007560' : ev.adoptionRate >= 50 ? '#b07d10' : '#dc2626' }}>
                      {ev.adoptionRate}%
                    </span>
                    <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', maxWidth: 80 }}>
                      <div style={{ width: `${ev.adoptionRate}%`, height: '100%', background: ev.adoptionRate >= 75 ? '#007560' : ev.adoptionRate >= 50 ? '#ca8a04' : '#dc2626', borderRadius: 4 }} />
                    </div>
                  </>
                ) : '—'}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="modal-section">
            <div className="modal-section-title"><Icon name="bi-info-circle" /> Event Details</div>
            <div className="modal-meta-grid" style={{ marginTop: 8 }}>
              {ev.eventCode && (
                <div className="modal-meta-cell">
                  <div className="modal-meta-label">Event Code</div>
                  <div className="modal-meta-value">
                    <code style={{ background: '#f3f4f6', padding: '2px 7px', borderRadius: 5, fontSize: 12, fontFamily: "'Dubai', 'Segoe UI', system-ui, sans-serif", color: '#374151' }}>{ev.eventCode}</code>
                  </div>
                </div>
              )}
              <div className="modal-meta-cell">
                <div className="modal-meta-label">Event Type</div>
                <div className="modal-meta-value"><TypeBadge type={ev.type} /></div>
              </div>
              {ev.techStack && (
                <div className="modal-meta-cell">
                  <div className="modal-meta-label">Technology Stack</div>
                  <div className="modal-meta-value">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,117,96,0.07)', color: '#007560', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                      <Icon name="bi-cpu" style={{ fontSize: 11 }} />{ev.techStack}
                    </span>
                  </div>
                </div>
              )}
              {ev.program && (
                <div className="modal-meta-cell" style={{ gridColumn: '1 / -1' }}>
                  <div className="modal-meta-label">Program</div>
                  <div className="modal-meta-value">{ev.program}</div>
                </div>
              )}
              {ev.targetAudience && (
                <div className="modal-meta-cell" style={{ gridColumn: '1 / -1' }}>
                  <div className="modal-meta-label">Target Audience</div>
                  <div className="modal-meta-value">{ev.targetAudience}</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="modal-section">
            <div className="modal-section-title"><Icon name="bi-file-text" /> About This Event</div>
            <p className="modal-desc">{ev.description}</p>
          </div>

          {/* Speakers */}
          {ev.speakers.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-title"><Icon name="bi-mic-fill" /> Speakers</div>
              <div className="modal-speakers">
                {ev.speakers.map((s, i) => (
                  <div key={i} className="modal-speaker-card">
                    <div className="modal-speaker-avatar">{initials(s.name)}</div>
                    <div>
                      <div className="modal-speaker-name">{s.name}</div>
                      <div className="modal-speaker-role">{s.title} · {s.division}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendees list */}
          {ev.attendeesList.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-title"><Icon name="bi-people-fill" /> Notable Attendees</div>
              <div className="modal-attendees-grid">
                {ev.attendeesList.map((a, i) => (
                  <span key={i} className="modal-attendee-chip">
                    <span className="modal-attendee-dot" />
                    {a.name}
                    <span style={{ color: '#9ca3af', fontSize: 10 }}>· {a.division}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outcomes (completed only) */}
          {ev.status === 'Completed' && ev.outcomes && ev.outcomes.length > 0 && (
            <div className="modal-section">
              <div className="modal-section-title"><Icon name="bi-trophy-fill" /> Outcomes & Highlights</div>
              <ul className="modal-list">
                {ev.outcomes.map((o, i) => (
                  <li key={i}><span className="modal-list-dot" />{o}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cancelled note */}
          {ev.status === 'Cancelled' && (
            <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#dc2626', marginBottom: 4 }}>
                <Icon name="bi-exclamation-circle-fill" style={{ marginRight: 6 }} />
                Event Cancelled
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{ev.description}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── List view ────────────────────────────────────────────────
function ListView({ events, onSelect }: { events: AppEvent[]; onSelect: (ev: AppEvent) => void }) {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', color: '#9ca3af' }}>
        <Icon name="bi-calendar-x" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
        No events in this category
      </div>
    )
  }
  return (
    <div className="ev-list">
      {events.map(ev => {
        const pillarColor = STATUS_PILLAR[ev.status]
        const d = new Date(ev.date)
        const dayNum   = d.getDate()
        const monthStr = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
        return (
          <div key={ev.id} className="ev-item">
            {/* Date pillar */}
            <div className="ev-item-date-pillar" style={{ background: pillarColor }}>
              <div className="ev-date-day">{dayNum}</div>
              <div className="ev-date-month">{monthStr}</div>
            </div>

            {/* Body */}
            <div className="ev-item-body">
              <div className="ev-item-top">
                <TypeBadge type={ev.type} />
                <span className="ev-item-title">{ev.title}</span>
              </div>
              <div className="ev-item-meta">
                <span className="ev-item-meta-piece">
                  <Icon name="bi-clock" />{ev.time}
                </span>
                <span className="ev-item-meta-piece">
                  <Icon name="bi-geo-alt" />{ev.location.split('—')[0].trim()}
                </span>
                {ev.attendees > 0 && (
                  <span className="ev-item-meta-piece">
                    <Icon name="bi-people" />{ev.attendees.toLocaleString()} attendees
                  </span>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="ev-item-right">
              <StatusBadge status={ev.status} />
              <button className="ev-detail-btn" onClick={() => onSelect(ev)}>
                View Details <Icon name="bi-arrow-right" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Program Detail Panel (shown when navigated from a program) ─
function progStatusCls(s: ProgramStatus) {
  return s === 'Active' ? 'active' : s === 'Completed' ? 'completed' : 'upcoming'
}

function ProgramDetailPanel({ program: p, onBack }: { program: Program; onBack: () => void }) {
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return (
    <div style={{ marginBottom: 24, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid rgba(0,117,96,0.15)' }}>
      {/* Header strip */}
      <div style={{ background: 'linear-gradient(135deg, var(--dewa-navy) 0%, #004937 100%)', padding: '18px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.85)', borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 10, transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            <Icon name="bi-arrow-left" /> Back to Programs
          </button>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 8 }}>{p.name}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`prog-badge prog-badge-${progStatusCls(p.status)}`}>
              <span className="prog-badge-dot" />{p.status}
            </span>
            {p.ownerDivision && (
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                {p.ownerDivision}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: '#fff', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 3 }}>Start Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="bi-calendar3" style={{ fontSize: 12, color: '#007560' }} />
              {p.startDate ? fmtDate(p.startDate) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 3 }}>End Date</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="bi-calendar-event" style={{ fontSize: 12, color: '#007560' }} />
              {p.endDate ? fmtDate(p.endDate) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 3 }}>Events</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="bi-collection" style={{ fontSize: 12, color: '#007560' }} />
              {p.eventCount}
            </div>
          </div>
          {p.totalParticipants > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 3 }}>Participants</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="bi-people" style={{ fontSize: 12, color: '#007560' }} />
                {p.totalParticipants.toLocaleString()}
              </div>
            </div>
          )}
          {p.targetAudience && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 3 }}>Target Audience</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1c1c1e' }}>{p.targetAudience}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {p.description && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 5 }}>Overview</div>
            <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{p.description}</p>
          </div>
        )}

        {/* Objectives */}
        {p.objectives.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: 6 }}>Objectives</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {p.objectives.map((o, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#007560', marginTop: 5, flexShrink: 0, display: 'inline-block' }} />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
interface EventsProps {
  fromProgram?: Program | null
  onBackToPrograms?: () => void
}

export default function Events({ fromProgram, onBackToPrograms }: EventsProps = {}) {
  const [tabFilter,  setTabFilter]  = useState<TabFilter>('All')
  const [viewMode,   setViewMode]   = useState<ViewMode>('list')
  const [selected,   setSelected]   = useState<AppEvent | null>(null)
  const [events,     setEvents]     = useState<AppEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      Cr978_coe_eventsesService.getAll(),
      Cr978_coe_divisionsService.getAll(),
    ]).then(([eventsResult, divisionsResult]) => {
      const divisionMap = new Map<string, string>()
      divisionsResult.data?.forEach(d => {
        divisionMap.set(d.cr978_coe_divisionid, d.cr978_divisionname)
      })
      if (eventsResult.data) setEvents(eventsResult.data.map(r => mapToAppEvent(r, divisionMap)))
    }).catch((err: unknown) => {
      console.error('[Events] Failed to load events:', err instanceof Error ? err.message : String(err))
      setError('Failed to load events from Dataverse.')
    }).finally(() => setLoading(false))
  }, [])

  const scopedEvents = fromProgram ? events.filter(e => e.programId === fromProgram.id) : events
  const counts = {
    All:       scopedEvents.length,
    Upcoming:  scopedEvents.filter(e => e.status === 'Upcoming').length,
    Completed: scopedEvents.filter(e => e.status === 'Completed').length,
    Cancelled: scopedEvents.filter(e => e.status === 'Cancelled').length,
  }

  const visibleEvents = useMemo(() => {
    let base = tabFilter === 'All' ? events : events.filter(e => e.status === tabFilter)
    if (fromProgram) base = base.filter(e => e.programId === fromProgram.id)
    return [...base].sort((a, b) => a.date.localeCompare(b.date))
  }, [tabFilter, events, fromProgram])

  const TABS: { id: TabFilter; label: string }[] = [
    { id: 'All',       label: 'All'       },
    { id: 'Upcoming',  label: 'Upcoming'  },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ]

  return (
    <div>
      {fromProgram ? (
        <ProgramDetailPanel program={fromProgram} onBack={onBackToPrograms ?? (() => {})} />
      ) : (
        <div className="page-header">
          <h1>Events</h1>
          <p>Workshops, seminars, hackathons and webinars across all AI programs</p>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Summary tiles */}
      <div className="kpi-4-grid" style={{ gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Events',   value: counts.All,       icon: 'bi-calendar3',           bg: 'rgba(0,117,96,0.08)',   color: '#007560' },
          { label: 'Upcoming',       value: counts.Upcoming,  icon: 'bi-calendar-plus-fill',   bg: 'rgba(202,138,4,0.12)', color: '#b07d10' },
          { label: 'Completed',      value: counts.Completed, icon: 'bi-calendar-check-fill',  bg: 'rgba(0,117,96,0.1)',   color: '#007560' },
          { label: 'Cancelled',      value: counts.Cancelled, icon: 'bi-calendar-x-fill',      bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <Icon name={s.icon} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls row: tabs left, view toggle right */}
      <div className="ev-page-header-row">
        <div className="ev-tab-bar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`ev-tab-btn${tabFilter === tab.id ? ' active' : ''}`}
              onClick={() => setTabFilter(tab.id)}
            >
              {tab.label}
              <span className="ev-tab-count">{counts[tab.id]}</span>
            </button>
          ))}
        </div>

        <div className="ev-view-toggle">
          <button
            className={`ev-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <Icon name="bi-list-ul" /> List
          </button>
          <button
            className={`ev-toggle-btn${viewMode === 'calendar' ? ' active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <Icon name="bi-calendar3" /> Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
          <Icon name="bi-arrow-repeat" style={{ fontSize: 28, display: 'block', marginBottom: 10 }} />
          Loading events…
        </div>
      ) : viewMode === 'list' ? (
        <ListView events={visibleEvents} onSelect={setSelected} />
      ) : (
        <CalendarView
          events={visibleEvents}
          onSelectEvent={setSelected}
        />
      )}

      {/* Event modal */}
      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
