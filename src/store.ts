import { Booking, Contact } from './types'

const KEY = 'labno_bookings'
const CONTACTS_KEY = 'labno_contacts'

export function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function persistBookings(bookings: Booking[]): void {
  localStorage.setItem(KEY, JSON.stringify(bookings))
}

export function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function persistContacts(contacts: Contact[]): void {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
