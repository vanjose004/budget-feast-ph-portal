'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarX2, Search, SearchX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaymentStatusBadge } from '@/components/bookings/payment-status-badge'
import { BookingRowActions } from '@/components/bookings/booking-row-actions'
import { EmptyState } from '@/components/empty-state'
import { PAYMENT_STATUSES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Booking } from '@/lib/supabase'

function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BookingsTable({ bookings, initialSearch = '' }: { bookings: Booking[]; initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState<string>('all')
  const [month, setMonth] = useState('')

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (search && !b.client_name.toLowerCase().includes(search.toLowerCase())) return false
      if (status !== 'all' && b.payment_status !== status) return false
      if (month && (!b.event_date || !b.event_date.startsWith(month))) return false
      return true
    })
  }, [bookings, search, status, month])

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX2 className="h-8 w-8" />}
        title="No bookings yet"
        description="Create your first booking to get started."
        action={
          <Link
            href="/bookings/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            + New Booking
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name..."
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-44" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title="No bookings match your filters"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Client Name</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Event Type</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Event Date</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Buffet Time</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Venue</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-foreground">Pax</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Package</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">Total</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">Paid</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">Balance</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-foreground">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    <Link href={`/bookings/${b.id}`} className="hover:underline">
                      {b.client_name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{b.event_type ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(b.event_date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{b.buffet_time ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{b.venue ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-muted-foreground">{b.pax ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{b.package ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">
                    {formatCurrency(b.total_amount ?? 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(b.amount_paid ?? 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(b.balance ?? Math.max((b.total_amount ?? 0) - (b.amount_paid ?? 0), 0))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <PaymentStatusBadge status={b.payment_status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <BookingRowActions bookingId={b.id} clientName={b.client_name} />
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
