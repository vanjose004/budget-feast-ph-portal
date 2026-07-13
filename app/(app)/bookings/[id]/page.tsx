import { notFound } from 'next/navigation'
import { supabase, type Payment } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { addOnsBreakdown, parseAddOns, parseSelectedMenu, selectedMenuBreakdown } from '@/lib/constants'
import { PaymentStatusBadge } from '@/components/bookings/payment-status-badge'
import { BookingDetailActions } from '@/components/bookings/booking-detail-actions'
import { AddPaymentDialog } from '@/components/bookings/add-payment-dialog'
import { PaymentTimeline } from '@/components/bookings/payment-timeline'
import { EditableNotes } from '@/components/bookings/editable-notes'

export const revalidate = 0

function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  )
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: booking }, { data: paymentsData }] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', id).maybeSingle(),
    supabase.from('payments').select('*').eq('booking_id', id),
  ])

  if (!booking) notFound()

  const payments: Payment[] = paymentsData ?? []
  const balance = booking.balance ?? Math.max((booking.total_amount ?? 0) - (booking.amount_paid ?? 0), 0)
  const addOnsBreakdownItems = addOnsBreakdown(parseAddOns(booking.add_ons))
  const menuBreakdownItems = selectedMenuBreakdown(parseSelectedMenu(booking.selected_menu))

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8 print:static print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{booking.client_name}</h1>
            <p className="mt-1 text-muted-foreground">
              {booking.event_type ?? 'Event'} &middot; {formatDate(booking.event_date)}
            </p>
          </div>
          <BookingDetailActions bookingId={booking.id} clientName={booking.client_name} />
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-8 print:p-0">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Client Name" value={booking.client_name} />
              <InfoRow label="Contact Number" value={booking.contact_number ?? '—'} />
              <InfoRow label="Facebook" value={booking.facebook ?? '—'} />
              <InfoRow label="Address" value={booking.client_address ?? '—'} />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Event Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Event Type" value={booking.event_type ?? '—'} />
              <InfoRow label="Event Date" value={formatDate(booking.event_date)} />
              <InfoRow label="Buffet Time" value={booking.buffet_time ?? '—'} />
              <InfoRow label="Venue" value={booking.venue ?? '—'} />
              <InfoRow label="Pax" value={booking.pax ? String(booking.pax) : '—'} />
              <InfoRow label="Package" value={booking.package ?? '—'} />
            </div>
          </section>
        </div>

        {menuBreakdownItems.length > 0 && (
          <section className="rounded-lg border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Menu Selection</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {menuBreakdownItems.map((item) => (
                <InfoRow key={item.label} label={item.label} value={item.dish} />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
            <PaymentStatusBadge status={booking.payment_status} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoRow label="Total Amount" value={formatCurrency(booking.total_amount ?? 0)} />
            <InfoRow label="Amount Paid" value={formatCurrency(booking.amount_paid ?? 0)} />
            <InfoRow label="Balance" value={formatCurrency(balance)} />
            <InfoRow label="Payment Scheme" value={booking.payment_scheme ?? '—'} />
          </div>

          {addOnsBreakdownItems.length > 0 && (
            <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Add-ons Breakdown
              </p>
              {addOnsBreakdownItems.map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Notes</h2>
          <EditableNotes bookingId={booking.id} notes={booking.notes} />
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
            <AddPaymentDialog bookingId={booking.id} maxAmount={balance} />
          </div>
          <h2 className="mb-4 hidden text-lg font-semibold text-foreground print:block">Payment History</h2>
          <PaymentTimeline payments={payments} />
        </section>
      </div>
    </>
  )
}
