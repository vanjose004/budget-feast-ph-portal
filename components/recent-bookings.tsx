import Link from 'next/link'
import type { Booking } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { PaymentStatusBadge } from '@/components/bookings/payment-status-badge'
import { BookingRowActions } from '@/components/bookings/booking-row-actions'
import { EmptyState } from '@/components/empty-state'
import { Inbox } from 'lucide-react'

function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
        <Link href="/bookings" className="text-sm font-medium text-accent hover:underline">
          View All
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="No bookings yet"
          description="New bookings will show up here once created."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Client Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Event Date</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Package</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Pax</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 text-foreground font-medium">{booking.client_name}</td>
                  <td className="py-4 px-4 text-muted-foreground">{formatDate(booking.event_date)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{booking.package ?? '—'}</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">{booking.pax ?? '—'}</td>
                  <td className="py-4 px-4 text-right font-semibold text-foreground">
                    {formatCurrency(booking.total_amount ?? 0)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <PaymentStatusBadge status={booking.payment_status} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <BookingRowActions bookingId={booking.id} clientName={booking.client_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
