import { useState, useEffect } from 'react'
import { Booking, Contact, View } from './types'
import { loadBookings, persistBookings, loadContacts, persistContacts } from './store'
import {
  subscribeBookings, saveBooking, removeBooking,
  subscribeContacts, saveContact, removeContact
} from './firestore'
import { todayStr, sortedUpcoming } from './utils'
import BottomNav from './components/BottomNav'
import CalendarView from './components/CalendarView'
import ListView from './components/ListView'
import ContactsView from './components/ContactsView'
import BookingModal from './components/BookingModal'
import ContactModal from './components/ContactModal'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type SyncStatus = 'syncing' | 'synced' | 'offline'

export default function App() {
  const [view, setView] = useState<View>('calendar')
  // Стартуем с localStorage — мгновенный рендер без ожидания Firebase
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings())
  const [contacts, setContacts] = useState<Contact[]>(() => loadContacts())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing')
  const [showModal, setShowModal] = useState(false)
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [initialDate, setInitialDate] = useState<string | undefined>()
  const [showContactModal, setShowContactModal] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)

  // Подписка на Firestore — обновляет UI на всех устройствах в реальном времени
  useEffect(() => {
    const unsubBookings = subscribeBookings(
      (data) => {
        setBookings(data)
        persistBookings(data) // кешируем локально для офлайна
        setSyncStatus('synced')
      },
      () => setSyncStatus('offline')
    )
    const unsubContacts = subscribeContacts(
      (data) => {
        setContacts(data)
        persistContacts(data)
      },
      () => setSyncStatus('offline')
    )
    return () => { unsubBookings(); unsubContacts() }
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

  async function handleSaveContact(c: Contact) {
    // оптимистичное обновление, чтобы подсказки работали даже офлайн
    setContacts(prev => {
      const next = prev.some(x => x.id === c.id)
        ? prev.map(x => (x.id === c.id ? c : x))
        : [...prev, c]
      persistContacts(next)
      return next
    })
    await saveContact(c)
  }

  function openAddContact() {
    setEditContact(null)
    setShowContactModal(true)
  }

  function openEditContact(c: Contact) {
    setEditContact(c)
    setShowContactModal(true)
  }

  function closeContactModal() {
    setShowContactModal(false)
    setEditContact(null)
  }

  async function handleContactModalSave(c: Contact) {
    closeContactModal()
    await handleSaveContact(c)
  }

  async function handleDeleteContact(id: string) {
    closeContactModal()
    setContacts(prev => {
      const next = prev.filter(x => x.id !== id)
      persistContacts(next)
      return next
    })
    await removeContact(id)
  }

  const today = format(new Date(), 'EEEE, d MMMM', { locale: ru })
  const upcomingCount = sortedUpcoming(bookings).length

  const syncDot = {
    syncing: { color: 'var(--amber)', title: 'Синхронизация...' },
    synced:  { color: 'var(--both)',  title: 'Синхронизировано' },
    offline: { color: 'var(--house)', title: 'Офлайн — данные из кеша' },
  }[syncStatus]

  const headerSub =
    view === 'contacts'
      ? (contacts.length > 0 ? `${contacts.length} контакт${contacts.length === 1 ? '' : contacts.length < 5 ? 'а' : 'ов'} · ${today}` : today)
      : (upcomingCount > 0
          ? `${upcomingCount} предстоящ${upcomingCount === 1 ? 'ая' : 'их'} · ${today}`
          : today)

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
            {headerSub}
          </div>
        </div>
        <button
          className="header-btn"
          onClick={() => (view === 'contacts' ? openAddContact() : openAdd())}
          title={view === 'contacts' ? 'Добавить контакт' : 'Добавить бронь'}
        >
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
        ) : view === 'list' ? (
          <ListView
            bookings={bookings}
            onEdit={openEdit}
          />
        ) : (
          <ContactsView
            contacts={contacts}
            bookings={bookings}
            onEditContact={openEditContact}
            onAddContact={openAddContact}
            onEditBooking={openEdit}
          />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav
        view={view}
        onViewChange={setView}
        onAdd={() => openAdd()}
      />

      {/* Modals */}
      {showModal && (
        <BookingModal
          booking={editBooking}
          initialDate={initialDate}
          contacts={contacts}
          onSave={handleSave}
          onDelete={handleDelete}
          onSaveContact={handleSaveContact}
          onClose={closeModal}
        />
      )}

      {showContactModal && (
        <ContactModal
          contact={editContact}
          onSave={handleContactModalSave}
          onDelete={handleDeleteContact}
          onClose={closeContactModal}
        />
      )}
    </div>
  )
}
