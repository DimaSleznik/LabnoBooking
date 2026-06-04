import { useMemo, useState } from 'react'
import { Booking, Contact } from '../types'
import { bookingsForContact, phoneTelHref } from '../utils'
import BookingCard from './BookingCard'

interface Props {
  contacts: Contact[]
  bookings: Booking[]
  onEditContact: (c: Contact) => void
  onAddContact: () => void
  onEditBooking: (b: Booking) => void
}

export default function ContactsView({ contacts, bookings, onEditContact, onAddContact, onEditBooking }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = [...contacts].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    if (!q) return list
    const qDigits = q.replace(/\D/g, '')
    return list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (qDigits && c.phone.replace(/\D/g, '').includes(qDigits))
    )
  }, [contacts, query])

  return (
    <div className="contacts-view">
      <div className="contacts-toolbar">
        <input
          className="form-input"
          placeholder="Поиск по имени или телефону…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="contacts-add-btn" onClick={onAddContact} aria-label="Добавить контакт">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">📇</div>
          <div>Контактов пока нет.<br />Они добавляются автоматически при создании брони.</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">🔍</div>
          <div>Ничего не найдено</div>
        </div>
      ) : (
        <div className="list-section">
          <div className="contacts-list">
            {filtered.map(c => {
              const cb = bookingsForContact(bookings, c)
              const isOpen = expanded === c.id
              return (
                <div key={c.id} className="contact-block">
                  <div className="contact-row" onClick={() => setExpanded(isOpen ? null : c.id)}>
                    <div className="contact-avatar">{c.name.trim().charAt(0).toUpperCase() || '?'}</div>
                    <div className="contact-info">
                      <div className="contact-name">{c.name}</div>
                      <div className="contact-sub">
                        {c.phone}
                        {cb.length > 0 && ` · ${cb.length} брон${cb.length === 1 ? 'ь' : cb.length < 5 ? 'и' : 'ей'}`}
                      </div>
                    </div>
                    {c.phone && (
                      <a
                        href={`tel:${phoneTelHref(c.phone)}`}
                        className="contact-action"
                        onClick={e => e.stopPropagation()}
                        aria-label="Позвонить"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </a>
                    )}
                    <button
                      className="contact-action"
                      onClick={e => { e.stopPropagation(); onEditContact(c) }}
                      aria-label="Редактировать"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>

                  {isOpen && (
                    <div className="contact-bookings">
                      {c.notes && <div className="contact-notes">📝 {c.notes}</div>}
                      {cb.length === 0 ? (
                        <div className="contact-bookings-empty">Броней нет</div>
                      ) : (
                        cb.map(b => <BookingCard key={b.id} booking={b} onClick={onEditBooking} />)
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
