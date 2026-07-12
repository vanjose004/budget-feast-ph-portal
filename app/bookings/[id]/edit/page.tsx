import { notFound } from 'next/navigation'
import { supabase, type Booking } from '@/lib/supabase'
import { BookingForm } from '@/components/bookings/booking-form'
import type { BookingInput } from '@/lib/actions'
import { packagesFromSettings } from '@/lib/constants'

export const revalidate = 0

function toBookingInput(booking: Booking): BookingInput {
  return {
    client_name: booking.client_name,
    contact_number: booking.contact_number ?? '',
    facebook: booking.facebook ?? '',
    event_type: booking.event_type ?? '',
    event_date: booking.event_date ?? '',
    buffet_time: booking.buffet_time ?? '',
    venue: booking.venue ?? '',
    pax: booking.pax,
    package: booking.package ?? '',
    add_ons: booking.add_ons ?? '',
    total_amount: booking.total_amount ?? 0,
    payment_scheme: booking.payment_scheme ?? '',
    amount_paid: booking.amount_paid ?? 0,
    notes: booking.notes ?? '',
  }
}

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: booking }, { data: settingsData }] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', id).maybeSingle(),
    supabase.from('settings').select('key, value'),
  ])

  if (!booking) notFound()

  const settings = Object.fromEntries((settingsData ?? []).map((s) => [s.key, s.value ?? '']))
  const packages = packagesFromSettings(settings)

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Edit Booking</h1>
        <p className="mt-1 text-muted-foreground">Update details for {booking.client_name}.</p>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <BookingForm mode="edit" bookingId={id} initialData={toBookingInput(booking)} packages={packages} />
      </div>
    </>
  )
}
