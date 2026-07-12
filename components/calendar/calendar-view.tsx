'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Booking } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

export function CalendarView({ bookings }: { bookings: Booking[] }) {
  const today = new Date()
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate())

  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const booking of bookings) {
      if (!booking.event_date) continue
      const list = map.get(booking.event_date) ?? []
      list.push(booking)
      map.set(booking.event_date, list)
    }
    return map
  }, [bookings])

  const firstOfMonth = new Date(cursor.year, cursor.month, 1)
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const leadingBlanks = firstOfMonth.getDay()

  const cells: Array<{ day: number; dateStr: string } | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      dateStr: toDateString(cursor.year, cursor.month, i + 1),
    })),
  ]

  function goToMonth(offset: number) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + offset, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const selectedBookings = selectedDate ? (byDate.get(selectedDate) ?? []) : []

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => goToMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => goToMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Upcoming
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Past
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`blank-${idx}`} />

          const events = byDate.get(cell.dateStr) ?? []
          const isToday = cell.dateStr === todayStr
          const isPast = cell.dateStr < todayStr

          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => events.length > 0 && setSelectedDate(cell.dateStr)}
              className={`flex min-h-20 flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-colors sm:min-h-24 sm:p-2 ${
                isToday
                  ? 'border-accent bg-accent/10'
                  : isPast
                    ? 'border-border bg-muted/40'
                    : 'border-border bg-primary/5 hover:bg-primary/10'
              } ${events.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday ? 'text-accent' : isPast ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {cell.day}
              </span>
              <div className="flex w-full flex-col gap-0.5">
                {events.slice(0, 2).map((event) => (
                  <span
                    key={event.id}
                    className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                      isPast ? 'bg-muted-foreground/10 text-muted-foreground' : 'bg-primary/15 text-primary'
                    }`}
                  >
                    {event.client_name}
                  </span>
                ))}
                {events.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{events.length - 2} more</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <p className="font-medium text-foreground">{booking.client_name}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.event_type ?? 'Event'} &middot; {booking.venue ?? 'Venue TBD'} &middot; {booking.pax ?? '—'} pax
                </p>
                <p className="text-sm text-muted-foreground">{formatCurrency(booking.total_amount ?? 0)}</p>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
