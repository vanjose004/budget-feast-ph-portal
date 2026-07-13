import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Booking {
  id: string
  client_name: string
  contact_number: string | null
  facebook: string | null
  client_address: string | null
  event_type: string | null
  event_date: string | null
  buffet_time: string | null
  venue: string | null
  pax: number | null
  package: string | null
  add_ons: string | null
  selected_menu: string | null
  total_amount: number | null
  amount_paid: number
  balance: number | null
  payment_scheme: string | null
  payment_status: string
  notes: string | null
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string | null
  amount: number | null
  payment_type: string | null
  mode_of_payment: string | null
  date_paid: string | null
  received_by: string | null
  created_at: string
}

export interface Expense {
  id: string
  date: string
  category: string | null
  description: string | null
  amount: number | null
  created_at: string
}

export interface Client {
  id: string
  name: string
  contact_number: string | null
  facebook: string | null
  address: string | null
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string | null
  updated_at: string
}
