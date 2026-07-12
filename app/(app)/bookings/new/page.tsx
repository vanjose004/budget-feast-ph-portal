import { BookingForm } from '@/components/bookings/booking-form'
import { supabase } from '@/lib/supabase'
import { packagesFromSettings } from '@/lib/constants'

export const revalidate = 0

export default async function NewBookingPage() {
  const { data } = await supabase.from('settings').select('key, value')
  const settings = Object.fromEntries((data ?? []).map((s) => [s.key, s.value ?? '']))
  const packages = packagesFromSettings(settings)

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">New Booking</h1>
        <p className="mt-1 text-muted-foreground">Fill out the details to create a new booking.</p>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <BookingForm mode="create" packages={packages} />
      </div>
    </>
  )
}
