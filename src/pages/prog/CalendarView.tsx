import { useState, useMemo } from 'react'
import { type AppEvent, type EventStatus } from './data'
import Icon from '../../components/Icon'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS   = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const STATUS_CHIP: Record<EventStatus, { bg: string; text: string }> = {
  Upcoming:  { bg: '#ca8a04', text: '#fff' },
  Completed: { bg: '#007560', text: '#fff' },
  Cancelled: { bg: '#dc2626', text: '#fff' },
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay    = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7          // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells  = Math.ceil((startOffset + daysInMonth) / 7) * 7
  return Array.from({ length: totalCells }, (_, i) =>
    new Date(year, month, i - startOffset + 1)
  )
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  events: AppEvent[]
  onSelectEvent: (ev: AppEvent) => void
}

export default function CalendarView({ events, onSelectEvent }: Props) {
  // Default to March 2026 where most events live
  const [year,  setYear]  = useState(2026)
  const [month, setMonth] = useState(2)   // 0-indexed

  const todayStr = toDateStr(new Date())
  const grid     = useMemo(() => buildMonthGrid(year, month), [year, month])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AppEvent[]>()
    events.forEach(ev => {
      if (!map.has(ev.date)) map.set(ev.date, [])
      map.get(ev.date)!.push(ev)
    })
    return map
  }, [events])

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Split grid into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7))

  return (
    <div className="cal-root">
      {/* Header */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prev} aria-label="Previous month">
          <Icon name="bi-chevron-left" />
        </button>
        <span className="cal-month-label">{MONTHS[month]} {year}</span>
        <button className="cal-nav-btn" onClick={next} aria-label="Next month">
          <Icon name="bi-chevron-right" />
        </button>

        {/* Legend */}
        <div className="cal-legend">
          {(Object.entries(STATUS_CHIP) as [EventStatus, { bg: string }][]).map(([s, c]) => (
            <span key={s} className="cal-legend-item">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c.bg, display: 'inline-block' }} />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Weekday headers */}
      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div key={wi} className="cal-grid cal-week-row">
          {week.map(day => {
            const dateStr        = toDateStr(day)
            const isCurrentMonth = day.getMonth() === month
            const isToday        = dateStr === todayStr
            const dayEvents      = eventsByDate.get(dateStr) ?? []
            const visible        = dayEvents.slice(0, 3)
            const extra          = dayEvents.length - 3

            return (
              <div
                key={dateStr}
                className={[
                  'cal-day',
                  !isCurrentMonth ? 'cal-day--other' : '',
                ].filter(Boolean).join(' ')}
              >
                <span className={`cal-day-num${isToday ? ' cal-day-num--today' : ''}`}>
                  {day.getDate()}
                </span>
                <div className="cal-day-events">
                  {visible.map(ev => {
                    const chip = STATUS_CHIP[ev.status]
                    return (
                      <button
                        key={ev.id}
                        className="cal-event-chip"
                        style={{ background: chip.bg, color: chip.text }}
                        onClick={() => onSelectEvent(ev)}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    )
                  })}
                  {extra > 0 && (
                    <span className="cal-more">+{extra} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
