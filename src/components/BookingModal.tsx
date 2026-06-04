import { useState, useEffect, useMemo } from 'react'
import { Booking, BookingType, Contact } from '../types'
import {
  TYPE_LABELS, TYPE_COLORS, formatDate, todayStr,
  formatBelarusPhoneInput, normalizeBelarusPhone, phoneTelHref, phoneKey
} from '../utils'
import { generateId } from '../store'

interface Props {
  booking?: Booking | null
  initialDate?: string
  contacts: Contact[]
  onSave: (b: Booking) => void
  onDelete: (id: string) => void
  onSaveContact: (c: Contact) => void
  onClose: () => void
}

type ModalMode = 'view' | 'edit'

const EMPTY: Omit<Booking, 'id' | 'createdAt'> = {
  type: 'both',
  startDate: '',
  endDate: '',
  guestName: '',
  phone: '',
  price: undefined,
  notes: ''
}

export default function BookingModal({ booking, initialDate, contacts, onSave, onDelete, onSaveContact, onClose }: Props) {
  const isNew = !booking
  const [mode, setMode] = useState<ModalMode>(isNew ? 'edit' : 'view')
  const [error, setError] = useState<string | null>(null)
  const [saveToContacts, setSaveToContacts] = useState(true)
  const [showSuggest, setShowSuggest] = useState(false)

  const [form, setForm] = useState(() => {
    if (booking) return { ...booking }
    const today = initialDate || todayStr()
    return { ...EMPTY, startDate: today, endDate: today, id: '', createdAt: '' }
  })

  useEffect(() => {
    if (booking) {
      setForm({ ...booking })
      setMode('view')
    }
  }, [booking])

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
    if (error) setError(null)
  }

  // Подсказки из контактов по имени или телефону
  const suggestions = useMemo(() => {
    const q = form.guestName.trim().toLowerCase()
    const qPhone = phoneKey(form.phone)
    if (!q && !qPhone) return []
    return contacts
      .filter(c => {
        const byName = q && c.name.toLowerCase().includes(q)
        const byPhone = qPhone.length >= 2 && phoneKey(c.phone).includes(qPhone)
        return byName || byPhone
      })
      // не показываем подсказку, если поля уже точно совпадают с контактом
      .filter(c => !(c.name.toLowerCase() === q && phoneKey(c.phone) === qPhone))
      .slice(0, 5)
  }, [contacts, form.guestName, form.phone])

  function pickContact(c: Contact) {
    setForm(f => ({ ...f, guestName: c.name, phone: normalizeBelarusPhone(c.phone) }))
    setShowSuggest(false)
    setError(null)
  }

  function upsertContact(name: string, phone: string) {
    const key = phoneKey(phone)
    const existing = key ? contacts.find(c => phoneKey(c.phone) === key) : undefined
    if (existing) {
      if (existing.name !== name || existing.phone !== phone) {
        onSaveContact({ ...existing, name, phone })
      }
      return
    }
    onSaveContact({
      id: generateId(),
      name,
      phone,
      createdAt: new Date().toISOString()
    })
  }

  function handleSave() {
    const name = form.guestName.trim()
    const phone = normalizeBelarusPhone(form.phone)
    if (!name) { setError('Укажите имя гостя'); return }
    if (!phoneKey(phone)) { setError('Укажите номер телефона'); return }
    if (!form.startDate || !form.endDate) { setError('Укажите даты заезда и выезда'); return }

    const now = new Date().toISOString()
    if (saveToContacts) upsertContact(name, phone)
    onSave({
      ...form,
      id: form.id || generateId(),
      createdAt: form.createdAt || now,
      guestName: name,
      phone,
      price: form.price || undefined,
      notes: form.notes?.trim() || undefined
    })
  }

  function handleDelete() {
    if (booking && confirm(`Удалить бронь для "${booking.guestName}"?`)) {
      onDelete(booking.id)
    }
  }

  const typeColor = TYPE_COLORS[form.type]

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <span className="modal-title">
            {isNew ? 'Новая бронь' : mode === 'view' ? 'Бронь' : 'Редактировать'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && mode === 'view' && (
              <button className="modal-close" onClick={() => setMode('edit')} title="Редактировать">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {mode === 'view' && booking ? (
          <>
            <div className="modal-body">
              {/* Type badge */}
              <div>
                <span
                  className={`detail-type badge-${booking.type}`}
                  style={{ border: `1px solid ${typeColor}33` }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor, display: 'inline-block' }} />
                  {TYPE_LABELS[booking.type]}
                </span>
              </div>

              {/* Info rows */}
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-row-icon">👤</span>
                  <div className="detail-row-content">
                    <div className="detail-row-label">Имя гостя</div>
                    <div className="detail-row-value">{booking.guestName}</div>
                  </div>
                </div>
                {booking.phone && (
                  <div className="detail-row">
                    <span className="detail-row-icon">📞</span>
                    <div className="detail-row-content">
                      <div className="detail-row-label">Телефон</div>
                      <div className="detail-row-value">
                        <a href={`tel:${phoneTelHref(booking.phone)}`} style={{ color: 'var(--amber)', textDecoration: 'none' }}>
                          {booking.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-row-icon">📅</span>
                  <div className="detail-row-content">
                    <div className="detail-row-label">Даты</div>
                    <div className="detail-row-value">
                      {booking.startDate === booking.endDate
                        ? formatDate(booking.startDate)
                        : `${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}`}
                    </div>
                  </div>
                </div>
                {booking.price != null && (
                  <div className="detail-row">
                    <span className="detail-row-icon">💰</span>
                    <div className="detail-row-content">
                      <div className="detail-row-label">Сумма</div>
                      <div className="detail-price">{booking.price.toLocaleString('ru')} ₽</div>
                    </div>
                  </div>
                )}
                {booking.notes && (
                  <div className="detail-row">
                    <span className="detail-row-icon">📝</span>
                    <div className="detail-row-content">
                      <div className="detail-row-label">Заметки</div>
                      <div className="detail-row-value" style={{ whiteSpace: 'pre-wrap' }}>{booking.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDelete}>Удалить</button>
              <button className="btn-primary" onClick={() => setMode('edit')}>Редактировать</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              {/* Type selector */}
              <div className="form-group">
                <span className="form-label">Объект</span>
                <div className="type-selector">
                  {(['house', 'sauna', 'both'] as BookingType[]).map(t => (
                    <button
                      key={t}
                      className={`type-btn ${form.type === t ? `active-${t}` : ''}`}
                      onClick={() => set('type', t)}
                    >
                      {t === 'house' ? '🏠 Дом' : t === 'sauna' ? '🧖 Баня' : '🏡 Всё'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Заезд</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.startDate}
                    onChange={e => {
                      set('startDate', e.target.value)
                      if (form.endDate < e.target.value) set('endDate', e.target.value)
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Выезд</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={e => set('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Guest */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Имя гостя *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Имя / Фамилия"
                  value={form.guestName}
                  onChange={e => { set('guestName', e.target.value); setShowSuggest(true) }}
                  onFocus={() => setShowSuggest(true)}
                />
                {showSuggest && suggestions.length > 0 && (
                  <div className="contact-suggest">
                    {suggestions.map(c => (
                      <button key={c.id} type="button" className="contact-suggest-item" onClick={() => pickContact(c)}>
                        <span className="contact-suggest-name">{c.name}</span>
                        {c.phone && <span className="contact-suggest-phone">{c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Телефон *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+375 (29) 000-00-00"
                  value={form.phone}
                  onChange={e => { set('phone', formatBelarusPhoneInput(e.target.value)); setShowSuggest(true) }}
                  inputMode="tel"
                />
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="form-label">Сумма (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={form.price ?? ''}
                  onChange={e => set('price', e.target.value ? Number(e.target.value) : undefined)}
                  inputMode="numeric"
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Заметки</label>
                <textarea
                  className="form-input"
                  placeholder="Доп. информация, пожелания…"
                  value={form.notes ?? ''}
                  onChange={e => set('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Save to contacts */}
              <label className="form-check">
                <input
                  type="checkbox"
                  checked={saveToContacts}
                  onChange={e => setSaveToContacts(e.target.checked)}
                />
                <span>Сохранить в контакты</span>
              </label>

              {error && <div className="form-error">{error}</div>}
            </div>

            <div className="modal-actions">
              {!isNew && (
                <button className="btn-ghost" onClick={() => setMode('view')}>Отмена</button>
              )}
              <button className="btn-primary" onClick={handleSave}>
                {isNew ? 'Добавить бронь' : 'Сохранить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
