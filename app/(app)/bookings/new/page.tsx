import { BookingForm } from '@/components/bookings/booking-form'
import { supabase, type MenuItem } from '@/lib/supabase'
import { packagesFromSettings } from '@/lib/constants'

export const revalidate = 0

export default async function NewBookingPage() {
  const [{ data: settingsData }, { data: menuData }] = await Promise.all([
    supabase.from('settings').select('key, value'),
    supabase.from('menu_items').select('*').eq('is_active', true).order('sort_order'),
  ])

  const settings = Object.fromEntries((settingsData ?? []).map((s) => [s.key, s.value ?? '']))
  const packages = packagesFromSettings(settings)
  const menuItems: MenuItem[] = menuData ?? []

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">New Booking</h1>
        <p className="mt-1 text-muted-foreground">Fill out the details to create a new booking.</p>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <BookingForm mode="create" packages={packages} menuItems={menuItems} />
      </div>
    </>
  )
}
