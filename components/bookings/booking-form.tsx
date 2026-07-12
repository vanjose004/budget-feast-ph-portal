'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EVENT_TYPES, PACKAGES, PAYMENT_SCHEMES, computePaymentStatus, packageLabel, type PackageOption } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { createBooking, updateBooking, type BookingInput } from '@/lib/actions'

const emptyForm: BookingInput = {
  client_name: '',
  contact_number: '',
  facebook: '',
  event_type: '',
  event_date: '',
  buffet_time: '',
  venue: '',
  pax: null,
  package: '',
  add_ons: '',
  total_amount: 0,
  payment_scheme: '',
  amount_paid: 0,
  notes: '',
}

export function BookingForm({
  mode,
  bookingId,
  initialData,
  packages = PACKAGES,
}: {
  mode: 'create' | 'edit'
  bookingId?: string
  initialData?: BookingInput
  packages?: PackageOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<BookingInput>(initialData ?? emptyForm)

  const balance = Math.max(form.total_amount - form.amount_paid, 0)
  const paymentStatus = useMemo(
    () => computePaymentStatus(form.total_amount, form.amount_paid),
    [form.total_amount, form.amount_paid],
  )

  function update<K extends keyof BookingInput>(key: K, value: BookingInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handlePackageChange(value: string | null) {
    if (value === null) return
    const pkg = packages.find((p) => p.name === value)
    setForm((prev) => ({
      ...prev,
      package: value,
      pax: pkg?.pax ?? prev.pax,
      total_amount: pkg?.price ?? prev.total_amount,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.client_name.trim()) {
      toast.error('Client name is required.')
      return
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const result = await createBooking(form)
          toast.success('Booking created.')
          router.push(`/bookings/${result.id}`)
        } else if (bookingId) {
          await updateBooking(bookingId, form)
          toast.success('Booking updated.')
          router.push(`/bookings/${bookingId}`)
        }
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Something went wrong.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Client Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={form.client_name}
              onChange={(e) => update('client_name', e.target.value)}
              placeholder="Juan Dela Cruz"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input
              id="contact_number"
              value={form.contact_number}
              onChange={(e) => update('contact_number', e.target.value)}
              placeholder="0917 000 0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={form.facebook}
              onChange={(e) => update('facebook', e.target.value)}
              placeholder="facebook.com/username"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Event Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="event_type">Event Type</Label>
            <Select value={form.event_type} onValueChange={(v) => update('event_type', v ?? '')}>
              <SelectTrigger id="event_type" className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event_date">Event Date</Label>
            <Input
              id="event_date"
              type="date"
              value={form.event_date}
              onChange={(e) => update('event_date', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buffet_time">Buffet Time</Label>
            <Input
              id="buffet_time"
              value={form.buffet_time}
              onChange={(e) => update('buffet_time', e.target.value)}
              placeholder="6:00 PM"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={form.venue}
              onChange={(e) => update('venue', e.target.value)}
              placeholder="Barangay Hall, Sta. Maria"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pax">Pax</Label>
            <Input
              id="pax"
              type="number"
              min={0}
              value={form.pax ?? ''}
              onChange={(e) => update('pax', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Package &amp; Add-ons</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="package">Package</Label>
            <Select value={form.package} onValueChange={handlePackageChange}>
              <SelectTrigger id="package" className="w-full">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.name} value={pkg.name}>
                    {packageLabel(pkg)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="add_ons">Add-ons</Label>
            <Textarea
              id="add_ons"
              value={form.add_ons}
              onChange={(e) => update('add_ons', e.target.value)}
              placeholder="Lechon, extra rice, sound system..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Payment</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="total_amount">Total Amount</Label>
            <Input
              id="total_amount"
              type="number"
              min={0}
              value={form.total_amount}
              onChange={(e) => update('total_amount', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment_scheme">Payment Scheme</Label>
            <Select value={form.payment_scheme} onValueChange={(v) => update('payment_scheme', v ?? '')}>
              <SelectTrigger id="payment_scheme" className="w-full">
                <SelectValue placeholder="Select scheme" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_SCHEMES.map((scheme) => (
                  <SelectItem key={scheme} value={scheme}>
                    {scheme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount_paid">Amount Paid</Label>
            <Input
              id="amount_paid"
              type="number"
              min={0}
              value={form.amount_paid}
              onChange={(e) => update('amount_paid', Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Balance</Label>
            <div className="flex h-8 items-center rounded-lg border border-input bg-muted px-2.5 text-sm font-medium text-foreground">
              {formatCurrency(balance)}
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Payment Status</Label>
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  paymentStatus === 'Paid'
                    ? 'border border-green-300 bg-green-100 text-green-700'
                    : paymentStatus === 'Partial'
                      ? 'border border-yellow-300 bg-yellow-100 text-yellow-700'
                      : 'border border-red-300 bg-red-100 text-red-700'
                }`}
              >
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Notes</h2>
        <Textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Special requests, allergies, reminders..."
        />
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : mode === 'create' ? 'Create Booking' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
