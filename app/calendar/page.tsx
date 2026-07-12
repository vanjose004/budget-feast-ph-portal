import { supabase, type Booking } from '@/lib/supabase'
import { CalendarView } from '@/components/calendar/calendar-view'

export const revalidate = 0

export default async function CalendarPage() {
  const { data } = await supabase.from('bookings').select('*').order('event_date', { ascending: true })
  const bookings: Booking[] = data ?? []

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Calendar</h1>
        <p className="mt-1 text-muted-foreground">See all your booked events at a glance.</p>
      </div>

      <div className="p-4 sm:p-8">
        <CalendarView bookings={bookings} />
      </div>
    </>
  )
}
