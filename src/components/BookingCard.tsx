import { Booking } from '../types'
import { TYPE_LABELS, TYPE_COLORS, formatDateShort } from '../utils'

interface Props {
  booking: Booking
  onClick: (b: Booking) => void
}

export default function BookingCard({ booking, onClick }: Props) {
  const color = TYPE_COLORS[booking.type]
  const label = TYPE_LABELS[booking.type]
  const sameDay = booking.startDate === booking.endDate

  return (
    <div className="booking-card" onClick={() => onClick(booking)}>
      <div className="booking-type-bar" style={{ background: color }} />
      <div className="booking-info">
        <div className="booking-guest">{booking.guestName || '—'}</div>
        <div className="booking-meta">
          {sameDay
            ? formatDateShort(booking.startDate)
            : `${formatDateShort(booking.startDate)} — ${formatDateShort(booking.endDate)}`}
          {booking.phone ? ` · ${booking.phone}` : ''}
        </div>
      </div>
      <span
        className={`booking-type-badge badge-${booking.type}`}
      >
        {label}
      </span>
    </div>
  )
}
