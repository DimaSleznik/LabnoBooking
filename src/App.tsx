import { useState, useEffect, useCallback } from 'react'
import { Booking, View } from './types'
import { loadBookings, persistBookings } from './store'
import { subscribeBookings, saveBooking, removeBooking } from './firestore'
import { todayStr, sortedUpcoming } from './utils'
import BottomNav from './components/BottomNav'
import CalendarView from './components/CalendarView'
import ListView from './components/ListView'
import BookingModal from './components/BookingModal'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type SyncStatus = 'syncing' | 'synced' | 'offline'

export default function App() {
  const [view, setView] = useState<View>('calendar')
  // Стартуем с localStorage — мгновенный рендер без ожидания Firebase
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing')
  const [showModal, setShowModal] = useState(false)
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [initialDate, setInitialDate] = useState<string | undefined>()

  // Подписка на Firestore — обновляет UI на всех устройствах в реальном времени
  useEffect(() => {
    const unsubscribe = subscribeBookings(
      (data) => {
        setBookings(data)
        persistBookings(data) // кешируем локально для офлайна
        setSyncStatus('synced')
      },
      () => setSyncStatus('offline')
    )
    return unsubscribe
  }, [])

  function openAdd(date?: string) {
    setEditBooking(null)
    setInitialDate(date || todayStr())
    setShowModal(true)
  }

  function openEdit(booking: Booking) {
    setEditBooking(booking)
    setInitialDate(undefined)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditBooking(null)
    setInitialDate(undefined)
  }

  async function handleSave(b: Booking) {
    closeModal()
    await saveBooking(b) // Firestore → onSnapshot автоматически обновит bookings
  }

  async function handleDelete(id: string) {
    closeModal()
    await removeBooking(id)
  }

  const today = format(new Date(), 'EEEE, d MMMM', { locale: ru })
  const upcomingCount = sortedUpcoming(bookings).length

  const syncDot = {
    syncing: { color: 'var(--amber)', title: 'Синхронизация...' },
    synced:  { color: 'var(--both)',  title: 'Синхронизировано' },
    offline: { color: 'var(--house)', title: 'Офлайн — данные из кеша' },
  }[syncStatus]

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Лабно
            <span
              title={syncDot.title}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: syncDot.color,
                display: 'inline-block',
                opacity: syncStatus === 'syncing' ? 0.6 : 1,
                animation: syncStatus === 'syncing' ? 'pulse 1.2s ease-in-out infinite' : 'none'
              }}
            />
          </div>
          <div className="header-sub" style={{ textTransform: 'capitalize' }}>
            {upcomingCount > 0
              ? `${upcomingCount} предстоящ${upcomingCount === 1 ? 'ая' : 'их'} · ${today}`
              : today}
          </div>
        </div>
        <button className="header-btn" onClick={() => openAdd()} title="Добавить бронь">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="view">
        {view === 'calendar' ? (
          <CalendarView
            bookings={bookings}
            onAddForDate={openAdd}
            onEdit={openEdit}
          />
        ) : (
          <ListView
            bookings={bookings}
            onEdit={openEdit}
          />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav
        view={view}
        onViewChange={setView}
        onAdd={() => openAdd()}
      />

      {/* Modal */}
      {showModal && (
        <BookingModal
          booking={editBooking}
          initialDate={initialDate}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
