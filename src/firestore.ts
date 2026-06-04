import {
  collection, onSnapshot, setDoc, deleteDoc,
  doc, query, orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import { Booking, Contact } from './types'

const COL = 'bookings'
const CONTACTS_COL = 'contacts'

/**
 * Подписка на все брони — вызывается при любом изменении на любом устройстве.
 * Возвращает функцию отписки.
 */
export function subscribeBookings(
  onData: (bookings: Booking[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, COL), orderBy('createdAt', 'asc'))
  return onSnapshot(
    q,
    snap => {
      const bookings = snap.docs.map(d => d.data() as Booking)
      onData(bookings)
    },
    err => {
      console.error('Firestore error:', err)
      onError?.(err)
    }
  )
}

/** Создать или обновить бронь */
export async function saveBooking(booking: Booking): Promise<void> {
  await setDoc(doc(db, COL, booking.id), booking)
}

/** Удалить бронь */
export async function removeBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}

/**
 * Подписка на все контакты. Возвращает функцию отписки.
 */
export function subscribeContacts(
  onData: (contacts: Contact[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, CONTACTS_COL), orderBy('name', 'asc'))
  return onSnapshot(
    q,
    snap => {
      const contacts = snap.docs.map(d => d.data() as Contact)
      onData(contacts)
    },
    err => {
      console.error('Firestore error:', err)
      onError?.(err)
    }
  )
}

/** Создать или обновить контакт */
export async function saveContact(contact: Contact): Promise<void> {
  await setDoc(doc(db, CONTACTS_COL, contact.id), contact)
}

/** Удалить контакт */
export async function removeContact(id: string): Promise<void> {
  await deleteDoc(doc(db, CONTACTS_COL, id))
}
