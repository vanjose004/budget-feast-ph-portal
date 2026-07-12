import { CreditCard } from 'lucide-react'
import type { Payment } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/empty-state'

function formatDate(dateString: string | null) {
  if (!dateString) return '—'
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PaymentTimeline({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard className="h-8 w-8" />}
        title="No payments recorded yet"
        description="Payments you add will appear here."
      />
    )
  }

  const sorted = [...payments].sort((a, b) => (b.date_paid ?? '').localeCompare(a.date_paid ?? ''))

  return (
    <ol className="space-y-4">
      {sorted.map((payment) => (
        <li key={payment.id} className="flex gap-4 border-l-2 border-primary/30 pl-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{formatCurrency(payment.amount ?? 0)}</p>
              <p className="text-sm text-muted-foreground">{formatDate(payment.date_paid)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {payment.payment_type ?? '—'} &middot; {payment.mode_of_payment ?? '—'}
              {payment.received_by ? ` · received by ${payment.received_by}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
