import { useState } from 'react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Booking } from '../types'
import {
  getCalendarDays, getBookingsForDay, isInCurrentMonth,
  isDayToday, isSameDate, formatMonth, TYPE_COLORS
} from '../utils'
import BookingCard from './BookingCard'

interface Props {
  bookings: Booking[]
  onAddForDate: (date: string) => void
  onEdit: (booking: Booking) => void
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function CalendarView({ bookings, onAddForDate, onEdit }: Props) {
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<Date | null>(null)

  const days = getCalendarDays(month)

  function selectDay(day: Date) {
    if (selected && isSameDate(selected, day)) {
      setSelected(null)
    } else {
      setSelected(day)
    }
  }

  const selectedBookings = selected ? getBookingsForDay(bookings, selected) : []
  const selectedStr = selected ? format(selected, 'yyyy-MM-dd') : ''

  return (
    <div>
      {/* Month nav */}
      <div className="calendar-nav">
        <button className="calendar-arrow" onClick={() => { setMonth(m => subMonths(m, 1)); setSelected(null) }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="calendar-month">{formatMonth(month)}</span>
        <button className="calendar-arrow" onClick={() => { setMonth(m => addMonths(m, 1)); setSelected(null) }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="calendar-grid">
        {days.map(day => {
          const dayBookings = getBookingsForDay(bookings, day)
          const isOther = !isInCurrentMonth(day, month)
          const isToday = isDayToday(day)
          const isSel = selected ? isSameDate(day, selected) : false

          const dots = dayBookings.slice(0, 3)
          const classes = [
            'calendar-day',
            isOther ? 'other-month' : '',
            isToday ? 'today' : '',
            isSel ? 'selected' : '',
            dayBookings.length > 0 ? 'has-booking' : ''
          ].filter(Boolean).join(' ')

          return (
            <div key={day.toISOString()} className={classes} onClick={() => selectDay(day)}>
              <span className="day-num">{format(day, 'd')}</span>
              <div className="day-dots">
                {dots.map(b => (
                  <span
                    key={b.id}
                    className={`day-dot dot-${b.type}`}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <span style={{ fontSize: 8, color: 'var(--text-3)', lineHeight: 1 }}>+</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="day-panel">
          <div className="day-panel-header">
            <span className="day-panel-date">
              {format(selected, 'EEEE, d MMMM', { locale: ru })}
            </span>
            <button className="day-panel-close" onClick={() => setSelected(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {selectedBookings.length === 0 ? (
            <p className="day-panel-empty">Броней нет</p>
          ) : (
            selectedBookings.map(b => (
              <BookingCard key={b.id} booking={b} onClick={onEdit} />
            ))
          )}

          <button className="day-panel-add" onClick={() => onAddForDate(selectedStr)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Добавить бронь на этот день
          </button>
        </div>
      )}
    </div>
  )
}
