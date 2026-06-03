import { useState, useEffect } from 'react'
import { Booking, BookingType } from '../types'
import {
  TYPE_LABELS, TYPE_COLORS, formatDate, todayStr,
  formatBelarusPhoneInput, normalizeBelarusPhone, phoneTelHref
} from '../utils'
import { generateId } from '../store'

interface Props {
  booking?: Booking | null
  initialDate?: string
  onSave: (b: Booking) => void
  onDelete: (id: string) => void
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

export default function BookingModal({ booking, initialDate, onSave, onDelete, onClose }: Props) {
  const isNew = !booking
  const [mode, setMode] = useState<ModalMode>(isNew ? 'edit' : 'view')

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
  }

  function handleSave() {
    if (!form.startDate || !form.endDate || !form.guestName.trim()) return
    const now = new Date().toISOString()
    onSave({
      ...form,
      id: form.id || generateId(),
      createdAt: form.createdAt || now,
      guestName: form.guestName.trim(),
      phone: normalizeBelarusPhone(form.phone),
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
              <div className="form-group">
                <label className="form-label">Имя гостя *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Имя / Фамилия"
                  value={form.guestName}
                  onChange={e => set('guestName', e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+375 (29) 000-00-00"
                  value={form.phone}
                  onChange={e => set('phone', formatBelarusPhoneInput(e.target.value))}
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
            </div>

            <div className="modal-actions">
              {!isNew && (
                <button className="btn-ghost" onClick={() => setMode('view')}>Отмена</button>
              )}
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!form.guestName.trim() || !form.startDate || !form.endDate}
                style={{ opacity: !form.guestName.trim() ? 0.5 : 1 }}
              >
                {isNew ? 'Добавить бронь' : 'Сохранить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
