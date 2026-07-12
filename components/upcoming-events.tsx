'use client'

import { Clock, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Booking } from '@/lib/supabase'

interface Countdown {
  days: number
  hours: number
  minutes: number
}

function eventDateTime(booking: Booking): Date {
  const date = new Date(`${booking.event_date}T00:00:00`)
  if (!booking.buffet_time) return date

  const match = booking.buffet_time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const meridiem = match[3]?.toUpperCase()
    if (meridiem === 'PM' && hours !== 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0
    date.setHours(hours, minutes, 0, 0)
  }
  return date
}

function calculateCountdown(targetDate: Date): Countdown {
  const now = new Date()
  const difference = targetDate.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0 }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((difference / 1000 / 60) % 60)

  return { days, hours, minutes }
}

export function UpcomingEvents({
  bookings,
  title = 'Upcoming Events',
}: {
  bookings: Booking[]
  title?: string
}) {
  const events = [...bookings]
    .sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))
    .slice(0, 5)

  const [countdowns, setCountdowns] = useState<Record<string, Countdown>>({})

  useEffect(() => {
    const tick = () => {
      const updated: Record<string, Countdown> = {}
      events.forEach((event) => {
        updated[event.id] = calculateCountdown(eventDateTime(event))
      })
      setCountdowns(updated)
    }

    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings])

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-6">{title}</h2>

      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No upcoming events.</p>
        )}
        {events.map((event) => {
          const countdown = countdowns[event.id]
          return (
            <div
              key={event.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{event.client_name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {event.event_date &&
                          new Date(`${event.event_date}T00:00:00`).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        {event.buffet_time ? ` at ${event.buffet_time}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{event.pax ?? '—'} pax</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-accent bg-primary/10 px-2 py-1 rounded">
                    {event.package ?? '—'}
                  </span>
                </div>

                {countdown && (
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="text-right">
                      {countdown.days > 0 && (
                        <div className="text-xl font-bold text-primary">
                          {countdown.days}d {countdown.hours}h
                        </div>
                      )}
                      {countdown.days === 0 && countdown.hours > 0 && (
                        <div className="text-xl font-bold text-orange-600">
                          {countdown.hours}h {countdown.minutes}m
                        </div>
                      )}
                      {countdown.days === 0 && countdown.hours === 0 && (
                        <div className="text-xl font-bold text-red-600">
                          {countdown.minutes}m
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">until event</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
