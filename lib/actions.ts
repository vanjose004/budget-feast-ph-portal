'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { computePaymentStatus } from '@/lib/constants'

export interface BookingInput {
  client_name: string
  contact_number: string
  facebook: string
  client_address: string
  event_type: string
  event_date: string
  buffet_time: string
  venue: string
  pax: number | null
  package: string
  add_ons: string
  selected_menu: string
  total_amount: number
  payment_scheme: string
  amount_paid: number
  notes: string
}

function toBookingRow(data: BookingInput) {
  const balance = Math.max(data.total_amount - data.amount_paid, 0)
  const payment_status = computePaymentStatus(data.total_amount, data.amount_paid)
  return {
    client_name: data.client_name,
    contact_number: data.contact_number || null,
    facebook: data.facebook || null,
    client_address: data.client_address || null,
    event_type: data.event_type || null,
    event_date: data.event_date || null,
    buffet_time: data.buffet_time || null,
    venue: data.venue || null,
    pax: data.pax,
    package: data.package || null,
    add_ons: data.add_ons || null,
    selected_menu: data.selected_menu || null,
    total_amount: data.total_amount,
    amount_paid: data.amount_paid,
    balance,
    payment_scheme: data.payment_scheme || null,
    payment_status,
    notes: data.notes || null,
  }
}

export async function createBooking(data: BookingInput) {
  const { data: row, error } = await supabase
    .from('bookings')
    .insert(toBookingRow(data))
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/bookings')
  revalidatePath('/clients')
  revalidatePath('/calendar')
  revalidatePath('/accounting')

  return row as { id: string }
}

export async function updateBooking(id: string, data: BookingInput) {
  const { error } = await supabase.from('bookings').update(toBookingRow(data)).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/bookings')
  revalidatePath(`/bookings/${id}`)
  revalidatePath('/clients')
  revalidatePath('/calendar')
  revalidatePath('/accounting')
}

export async function updateBookingNotes(id: string, notes: string) {
  const { error } = await supabase.from('bookings').update({ notes: notes || null }).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/bookings/${id}`)
  revalidatePath('/bookings')
}

export async function deleteBooking(id: string) {
  await supabase.from('payments').delete().eq('booking_id', id)
  const { error } = await supabase.from('bookings').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/bookings')
  revalidatePath('/clients')
  revalidatePath('/calendar')
  revalidatePath('/accounting')
}

export interface PaymentInput {
  amount: number
  payment_type: string
  mode_of_payment: string
  date_paid: string
  received_by: string
}

export async function addPayment(bookingId: string, data: PaymentInput) {
  const { error: paymentError } = await supabase.from('payments').insert({
    booking_id: bookingId,
    amount: data.amount,
    payment_type: data.payment_type || null,
    mode_of_payment: data.mode_of_payment || null,
    date_paid: data.date_paid || null,
    received_by: data.received_by || null,
  })

  if (paymentError) throw new Error(paymentError.message)

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('total_amount, amount_paid')
    .eq('id', bookingId)
    .single()

  if (bookingError) throw new Error(bookingError.message)

  const totalAmount = booking.total_amount ?? 0
  const newAmountPaid = (booking.amount_paid ?? 0) + data.amount
  const balance = Math.max(totalAmount - newAmountPaid, 0)
  const payment_status = computePaymentStatus(totalAmount, newAmountPaid)

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ amount_paid: newAmountPaid, balance, payment_status })
    .eq('id', bookingId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/')
  revalidatePath('/bookings')
  revalidatePath(`/bookings/${bookingId}`)
  revalidatePath('/clients')
  revalidatePath('/accounting')
}

export interface ExpenseInput {
  date: string
  category: string
  description: string
  amount: number
}

export async function addExpense(data: ExpenseInput) {
  const { error } = await supabase.from('expenses').insert({
    date: data.date,
    category: data.category || null,
    description: data.description || null,
    amount: data.amount,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/accounting')
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/accounting')
}

export async function updateSettings(values: Record<string, string>) {
  const rows = Object.entries(values).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })

  if (error) throw new Error(error.message)

  revalidatePath('/settings')
  revalidatePath('/bookings/new')
}

function revalidateMenu() {
  revalidatePath('/settings/menu')
  revalidatePath('/bookings/new')
  revalidatePath('/bookings/[id]/edit', 'page')
}

export async function addMenuItem(category: string, dishName: string) {
  const { data: existing, error: existingError } = await supabase
    .from('menu_items')
    .select('sort_order')
    .eq('category', category)
    .order('sort_order', { ascending: false })
    .limit(1)

  if (existingError) throw new Error(existingError.message)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  const { error } = await supabase
    .from('menu_items')
    .insert({ category, dish_name: dishName, sort_order: nextOrder })

  if (error) throw new Error(error.message)

  revalidateMenu()
}

export async function setMenuItemActive(id: string, isActive: boolean) {
  const { error } = await supabase.from('menu_items').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateMenu()
}

export async function deleteMenuItem(id: string) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidateMenu()
}

export async function moveMenuItem(id: string, direction: 'up' | 'down') {
  const { data: item, error: itemError } = await supabase
    .from('menu_items')
    .select('id, category, sort_order')
    .eq('id', id)
    .single()

  if (itemError) throw new Error(itemError.message)

  const { data: siblings, error: siblingsError } = await supabase
    .from('menu_items')
    .select('id, sort_order')
    .eq('category', item.category)
    .order('sort_order', { ascending: true })

  if (siblingsError) throw new Error(siblingsError.message)

  const list = siblings ?? []
  const index = list.findIndex((s) => s.id === id)
  const swapIndex = direction === 'up' ? index - 1 : index + 1

  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) return

  const current = list[index]
  const other = list[swapIndex]

  const { error: firstUpdateError } = await supabase
    .from('menu_items')
    .update({ sort_order: other.sort_order })
    .eq('id', current.id)
  if (firstUpdateError) throw new Error(firstUpdateError.message)

  const { error: secondUpdateError } = await supabase
    .from('menu_items')
    .update({ sort_order: current.sort_order })
    .eq('id', other.id)
  if (secondUpdateError) throw new Error(secondUpdateError.message)

  revalidateMenu()
}
