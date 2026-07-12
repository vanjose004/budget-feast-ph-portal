import Link from 'next/link'
import { supabase, type Booking } from '@/lib/supabase'
import { BookingsTable } from '@/components/bookings/bookings-table'

export const revalidate = 0

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
  const bookings: Booking[] = data ?? []

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Bookings</h1>
            <p className="mt-1 text-muted-foreground">Manage all your catering bookings.</p>
          </div>
          <Link
            href="/bookings/new"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            + New Booking
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <BookingsTable bookings={bookings} initialSearch={search ?? ''} />
      </div>
    </>
  )
}
