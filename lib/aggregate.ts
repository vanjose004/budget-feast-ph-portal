import type { Booking, Expense, Payment } from '@/lib/supabase'

export interface Transaction {
  id: string
  date: string
  description: string
  type: 'Income' | 'Expense'
  category?: string | null
  amount: number
}

export function buildTransactions(
  payments: Payment[],
  expenses: Expense[],
  bookingNames: Map<string, string>,
): Transaction[] {
  const income: Transaction[] = payments.map((p) => ({
    id: `payment-${p.id}`,
    date: p.date_paid ?? p.created_at.slice(0, 10),
    description: `${bookingNames.get(p.booking_id ?? '') ?? 'Unknown client'} — ${p.payment_type ?? 'Payment'}`,
    type: 'Income',
    amount: p.amount ?? 0,
  }))

  const expenseTx: Transaction[] = expenses.map((e) => ({
    id: `expense-${e.id}`,
    date: e.date,
    description: e.description || e.category || 'Expense',
    type: 'Expense',
    category: e.category,
    amount: e.amount ?? 0,
  }))

  return [...income, ...expenseTx].sort((a, b) => b.date.localeCompare(a.date))
}

export interface ClientSummary {
  name: string
  contactNumber: string | null
  facebook: string | null
  totalEvents: number
  totalSpend: number
}

export function aggregateClients(bookings: Booking[]): ClientSummary[] {
  const map = new Map<string, ClientSummary>()

  for (const booking of bookings) {
    const key = booking.client_name.trim().toLowerCase()
    const existing = map.get(key)
    if (existing) {
      existing.totalEvents += 1
      existing.totalSpend += booking.amount_paid ?? 0
      existing.contactNumber = existing.contactNumber ?? booking.contact_number
      existing.facebook = existing.facebook ?? booking.facebook
    } else {
      map.set(key, {
        name: booking.client_name,
        contactNumber: booking.contact_number,
        facebook: booking.facebook,
        totalEvents: 1,
        totalSpend: booking.amount_paid ?? 0,
      })
    }
  }

  return [...map.values()].sort((a, b) => b.totalSpend - a.totalSpend)
}

export interface MonthPoint {
  month: string
  label: string
  revenue: number
  expenses: number
}

export function monthlyRevenueVsExpenses(bookings: Booking[], expenses: Expense[], monthsBack = 6): MonthPoint[] {
  const now = new Date()
  const points: MonthPoint[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    points.push({ month, label, revenue: 0, expenses: 0 })
  }

  const byMonth = new Map(points.map((p) => [p.month, p]))

  for (const booking of bookings) {
    if (!booking.created_at) continue
    const month = booking.created_at.slice(0, 7)
    const point = byMonth.get(month)
    if (point) point.revenue += booking.amount_paid ?? 0
  }

  for (const expense of expenses) {
    if (!expense.date) continue
    const month = expense.date.slice(0, 7)
    const point = byMonth.get(month)
    if (point) point.expenses += expense.amount ?? 0
  }

  return points
}

export interface PaymentStatusCount {
  status: 'Paid' | 'Partial' | 'Unpaid'
  count: number
}

export function paymentStatusCounts(bookings: Booking[]): PaymentStatusCount[] {
  const counts: Record<'Paid' | 'Partial' | 'Unpaid', number> = { Paid: 0, Partial: 0, Unpaid: 0 }
  for (const booking of bookings) {
    const status = (booking.payment_status as 'Paid' | 'Partial' | 'Unpaid') ?? 'Unpaid'
    if (status in counts) counts[status] += 1
  }
  return (Object.keys(counts) as Array<keyof typeof counts>).map((status) => ({
    status,
    count: counts[status],
  }))
}
