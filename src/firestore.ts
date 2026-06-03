import {
  collection, onSnapshot, setDoc, deleteDoc,
  doc, query, orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import { Booking } from './types'

const COL = 'bookings'

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
