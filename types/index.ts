export interface Service {
  id: string
  name: string
  description: string
  icon: string
  active: boolean
}

export interface Client {
  id?: string
  name: string
  age: number
  gender: string
  email: string
  phone: string
}

export interface Booking {
  id?: string
  client_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
}

export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
}

export interface Setting {
  id: string
  key: string
  value: string
  label: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  image_url: string
  link: string
  active: boolean
  created_at: string
}

export interface SocialMedia {
  id: string
  platform: string
  url: string
  active: boolean
  display_order: number
}

export type BookingStep = 'service' | 'client' | 'schedule' | 'confirm'
