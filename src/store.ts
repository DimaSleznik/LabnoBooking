import { Booking } from './types'

const KEY = 'labno_bookings'

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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
