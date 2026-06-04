import { View } from '../types'

interface Props {
  view: View
  onViewChange: (v: View) => void
  onAdd: () => void
}

export default function BottomNav({ view, onViewChange, onAdd }: Props) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn ${view === 'calendar' ? 'active' : ''}`}
        onClick={() => onViewChange('calendar')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Календарь
      </button>

      <button
        className={`nav-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
          <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none"/>
        </svg>
        Список
      </button>

      <button className="nav-add" onClick={onAdd} aria-label="Добавить бронь">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <button
        className={`nav-btn ${view === 'contacts' ? 'active' : ''}`}
        onClick={() => onViewChange('contacts')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        Контакты
      </button>
    </nav>
  )
}
