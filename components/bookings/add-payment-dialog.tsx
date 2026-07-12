'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PAYMENT_MODES, PAYMENT_TYPES } from '@/lib/constants'
import { addPayment } from '@/lib/actions'

const today = () => new Date().toISOString().slice(0, 10)

export function AddPaymentDialog({ bookingId, maxAmount }: { bookingId: string; maxAmount: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [mode, setMode] = useState('')
  const [datePaid, setDatePaid] = useState(today())
  const [receivedBy, setReceivedBy] = useState('')

  function reset() {
    setAmount('')
    setPaymentType('')
    setMode('')
    setDatePaid(today())
    setReceivedBy('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = Number(amount)

    if (!numericAmount || numericAmount <= 0) {
      toast.error('Enter a valid payment amount.')
      return
    }

    startTransition(async () => {
      try {
        await addPayment(bookingId, {
          amount: numericAmount,
          payment_type: paymentType,
          mode_of_payment: mode,
          date_paid: datePaid,
          received_by: receivedBy,
        })
        toast.success('Payment recorded.')
        reset()
        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to record payment.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button data-icon="inline-start" />}>
        <Plus className="h-4 w-4" />
        Add Payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="amount">
              Amount {maxAmount > 0 && <span className="text-muted-foreground">(balance ₱{maxAmount.toLocaleString('en-PH')})</span>}
            </Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment_type">Payment Type</Label>
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v ?? '')}>
              <SelectTrigger id="payment_type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mode_of_payment">Mode of Payment</Label>
            <Select value={mode} onValueChange={(v) => setMode(v ?? '')}>
              <SelectTrigger id="mode_of_payment" className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date_paid">Date Paid</Label>
            <Input id="date_paid" type="date" value={datePaid} onChange={(e) => setDatePaid(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="received_by">Received By</Label>
            <Input
              id="received_by"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Staff name"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
