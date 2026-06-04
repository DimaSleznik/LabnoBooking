export type BookingType = 'house' | 'sauna' | 'both'

export interface Booking {
  id: string
  type: BookingType
  startDate: string // 'YYYY-MM-DD'
  endDate: string   // 'YYYY-MM-DD'
  guestName: string
  phone: string
  price?: number
  notes?: string
  createdAt: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  notes?: string
  createdAt: string
}

export type View = 'calendar' | 'list' | 'contacts'
