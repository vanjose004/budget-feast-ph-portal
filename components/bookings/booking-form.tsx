'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
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
import { AddOnsEditor } from '@/components/bookings/add-ons-editor'
import { MenuSelectionEditor } from '@/components/bookings/menu-selection-editor'
import {
  EVENT_TYPES,
  PACKAGES,
  PAYMENT_SCHEMES,
  addOnsBreakdown,
  addOnsTotal,
  computePaymentStatus,
  packageLabel,
  parseAddOns,
  parseSelectedMenu,
  visibleMenuCategories,
  type AddOnsState,
  type PackageOption,
  type SelectedMenu,
} from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { createBooking, updateBooking, type BookingInput } from '@/lib/actions'
import type { MenuItem } from '@/lib/supabase'

const emptyForm: BookingInput = {
  client_name: '',
  contact_number: '',
  facebook: '',
  client_address: '',
  event_type: '',
  event_date: '',
  buffet_time: '',
  venue: '',
  pax: null,
  package: '',
  add_ons: '',
  selected_menu: '',
  total_amount: 0,
  payment_scheme: '',
  amount_paid: 0,
  notes: '',
}

interface DraftPayload {
  form: BookingInput
  addOns: AddOnsState
  selectedMenu: SelectedMenu
}

export function BookingForm({
  mode,
  bookingId,
  initialData,
  packages = PACKAGES,
  menuItems = [],
}: {
  mode: 'create' | 'edit'
  bookingId?: string
  initialData?: BookingInput
  packages?: PackageOption[]
  menuItems?: MenuItem[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<BookingInput>(initialData ?? emptyForm)
  const [addOns, setAddOns] = useState<AddOnsState>(parseAddOns(initialData?.add_ons))
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenu>(parseSelectedMenu(initialData?.selected_menu))

  const draftKey = mode === 'create' ? 'booking-draft:new' : `booking-draft:edit:${bookingId}`
  const hasLoadedDraft = useRef(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<DraftPayload>
        if (parsed.form) setForm(parsed.form)
        if (parsed.addOns) setAddOns(parsed.addOns)
        if (parsed.selectedMenu) setSelectedMenu(parsed.selectedMenu)
      } catch {
        window.localStorage.removeItem(draftKey)
      }
    }
    hasLoadedDraft.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasLoadedDraft.current) return
    const timeout = setTimeout(() => {
      const payload: DraftPayload = { form, addOns, selectedMenu }
      window.localStorage.setItem(draftKey, JSON.stringify(payload))
      setLastSavedAt(Date.now())
    }, 500)
    return () => clearTimeout(timeout)
  }, [form, addOns, selectedMenu, draftKey])

  useEffect(() => {
    if (lastSavedAt === null) return
    setShowSaved(true)
    const hide = setTimeout(() => setShowSaved(false), 2000)
    return () => clearTimeout(hide)
  }, [lastSavedAt])

  function clearDraft() {
    window.localStorage.removeItem(draftKey)
    setForm(initialData ?? emptyForm)
    setAddOns(parseAddOns(initialData?.add_ons))
    setSelectedMenu(parseSelectedMenu(initialData?.selected_menu))
    setLastSavedAt(null)
    setShowSaved(false)
    toast.success('Draft cleared.')
  }

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
    }))
  }

  const selectedPackage = useMemo(() => packages.find((p) => p.name === form.package), [packages, form.package])
  const breakdown = useMemo(() => addOnsBreakdown(addOns), [addOns])
  const totalAmount = (selectedPackage?.price ?? 0) + addOnsTotal(addOns)

  useEffect(() => {
    setForm((prev) => (prev.total_amount === totalAmount ? prev : { ...prev, total_amount: totalAmount }))
  }, [totalAmount])

  const visibleMenu = useMemo(() => visibleMenuCategories(addOns), [addOns])

  useEffect(() => {
    const visibleKeys = new Set(visibleMenu.map((c) => c.key))
    setSelectedMenu((prev) => {
      const next: SelectedMenu = {}
      let changed = false
      for (const key of Object.keys(prev) as (keyof SelectedMenu)[]) {
        if (visibleKeys.has(key)) {
          next[key] = prev[key]
        } else {
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [visibleMenu])

  const balance = Math.max(totalAmount - form.amount_paid, 0)
  const paymentStatus = useMemo(
    () => computePaymentStatus(totalAmount, form.amount_paid),
    [totalAmount, form.amount_paid],
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.client_name.trim()) {
      toast.error('Client name is required.')
      return
    }

    const payload: BookingInput = {
      ...form,
      total_amount: totalAmount,
      add_ons: JSON.stringify(addOns),
      selected_menu: JSON.stringify(selectedMenu),
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          const result = await createBooking(payload)
          window.localStorage.removeItem(draftKey)
          toast.success('Booking created.')
          router.push(`/bookings/${result.id}`)
        } else if (bookingId) {
          await updateBooking(bookingId, payload)
          window.localStorage.removeItem(draftKey)
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="client_address">Address</Label>
            <Input
              id="client_address"
              value={form.client_address}
              onChange={(e) => update('client_address', e.target.value)}
              placeholder="Sta. Clara, Santa Maria, Bulacan"
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
        <h2 className="mb-4 text-lg font-semibold text-foreground">Package</h2>
        <div className="space-y-1.5">
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
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Add-ons</h2>
        <AddOnsEditor value={addOns} onChange={setAddOns} />
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Menu Selection</h2>
        <MenuSelectionEditor
          value={selectedMenu}
          onChange={setSelectedMenu}
          addOns={addOns}
          menuItems={menuItems}
          pax={form.pax ?? 0}
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Payment</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Total Amount</Label>
            <div className="flex h-8 items-center rounded-lg border border-input bg-muted px-2.5 text-sm font-semibold text-foreground">
              {formatCurrency(totalAmount)}
            </div>
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

        {(selectedPackage || breakdown.length > 0) && (
          <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Total Breakdown
            </p>
            {selectedPackage && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{packageLabel(selectedPackage)}</span>
                <span className="text-foreground">{formatCurrency(selectedPackage.price ?? 0)}</span>
              </div>
            )}
            {breakdown.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Notes</h2>
        <Textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Special requests, allergies, reminders..."
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity ${
              showSaved ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            Draft saved
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={clearDraft} disabled={isPending}>
            Clear Draft
          </Button>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : mode === 'create' ? 'Create Booking' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  )
}
