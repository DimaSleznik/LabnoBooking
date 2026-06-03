import { Booking } from '../types'
import { sortedUpcoming, sortedPast } from '../utils'
import BookingCard from './BookingCard'

interface Props {
  bookings: Booking[]
  onEdit: (booking: Booking) => void
}

export default function ListView({ bookings, onEdit }: Props) {
  const upcoming = sortedUpcoming(bookings)
  const past = sortedPast(bookings)

  if (bookings.length === 0) {
    return (
      <div className="list-empty">
        <div className="list-empty-icon">🏡</div>
        <div>Броней пока нет.<br />Нажмите + чтобы добавить первую.</div>
      </div>
    )
  }

  return (
    <div>
      {upcoming.length > 0 && (
        <div className="list-section">
          <div className="list-section-title">Предстоящие · {upcoming.length}</div>
          <div className="list-cards">
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} onClick={onEdit} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="list-section">
          <div className="list-section-title">Прошедшие · {past.length}</div>
          <div className="list-cards">
            {past.map(b => (
              <BookingCard key={b.id} booking={b} onClick={onEdit} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
