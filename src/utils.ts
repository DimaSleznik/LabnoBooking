import {
  format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday,
  isWithinInterval, compareAsc
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Booking, BookingType } from './types'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: ru })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: ru })
}

export function formatMonth(date: Date): string {
  return format(date, 'LLLL yyyy', { locale: ru })
}

export function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getBookingsForDay(bookings: Booking[], day: Date): Booking[] {
  return bookings.filter(b => {
    const start = parseISO(b.startDate)
    const end = parseISO(b.endDate)
    return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end)
  })
}

export function isInCurrentMonth(day: Date, month: Date): boolean {
  return isSameMonth(day, month)
}

export function isDayToday(day: Date): boolean {
  return isToday(day)
}

export function isSameDate(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}

export function sortedUpcoming(bookings: Booking[]): Booking[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return [...bookings]
    .filter(b => {
      const end = parseISO(b.endDate)
      return end >= today
    })
    .sort((a, b) => compareAsc(parseISO(a.startDate), parseISO(b.startDate)))
}

export function sortedPast(bookings: Booking[]): Booking[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return [...bookings]
    .filter(b => {
      const end = parseISO(b.endDate)
      return end < today
    })
    .sort((a, b) => compareAsc(parseISO(b.startDate), parseISO(a.startDate)))
}

export const TYPE_LABELS: Record<BookingType, string> = {
  house: 'Дом',
  sauna: 'Баня',
  both: 'Дом + Баня'
}

export const TYPE_COLORS: Record<BookingType, string> = {
  house: 'var(--house)',
  sauna: 'var(--sauna)',
  both: 'var(--both)'
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatBelarusPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('80')) {
    digits = `375${digits.slice(2)}`
  } else if (digits.startsWith('0')) {
    digits = `375${digits.slice(1)}`
  } else if (!digits.startsWith('375')) {
    digits = `375${digits}`
  }

  digits = digits.slice(0, 12)

  const operator = digits.slice(3, 5)
  const first = digits.slice(5, 8)
  const second = digits.slice(8, 10)
  const third = digits.slice(10, 12)

  let formatted = '+375'
  if (operator) formatted += ` (${operator}`
  if (operator.length === 2) formatted += ')'
  if (first) formatted += ` ${first}`
  if (second) formatted += `-${second}`
  if (third) formatted += `-${third}`

  return formatted
}

export function normalizeBelarusPhone(value: string): string {
  return value.trim() ? formatBelarusPhoneInput(value) : ''
}

export function phoneTelHref(value: string): string {
  const digits = normalizeBelarusPhone(value).replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}
