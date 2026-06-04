import { useState } from 'react'
import { Contact } from '../types'
import { formatBelarusPhoneInput, normalizeBelarusPhone, phoneKey } from '../utils'
import { generateId } from '../store'

interface Props {
  contact?: Contact | null
  onSave: (c: Contact) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function ContactModal({ contact, onSave, onDelete, onClose }: Props) {
  const isNew = !contact
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(() =>
    contact
      ? { ...contact }
      : { id: '', name: '', phone: '', notes: '', createdAt: '' }
  )

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
    if (error) setError(null)
  }

  function handleSave() {
    const name = form.name.trim()
    const phone = normalizeBelarusPhone(form.phone)
    if (!name) { setError('Укажите имя'); return }
    if (!phoneKey(phone)) { setError('Укажите номер телефона'); return }
    onSave({
      id: form.id || generateId(),
      createdAt: form.createdAt || new Date().toISOString(),
      name,
      phone,
      notes: form.notes?.trim() || undefined
    })
  }

  function handleDelete() {
    if (contact && confirm(`Удалить контакт "${contact.name}"?`)) {
      onDelete(contact.id)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <span className="modal-title">{isNew ? 'Новый контакт' : 'Контакт'}</span>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Имя *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Имя / Фамилия"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Телефон *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+375 (29) 000-00-00"
              value={form.phone}
              onChange={e => set('phone', formatBelarusPhoneInput(e.target.value))}
              inputMode="tel"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Заметки</label>
            <textarea
              className="form-input"
              placeholder="Доп. информация…"
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              rows={3}
            />
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-actions">
          {!isNew && <button className="btn-danger" onClick={handleDelete}>Удалить</button>}
          <button className="btn-primary" onClick={handleSave}>
            {isNew ? 'Добавить' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
