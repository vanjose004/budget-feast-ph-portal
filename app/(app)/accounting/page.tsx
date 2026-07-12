import { supabase, type Booking, type Expense, type Payment } from '@/lib/supabase'
import { buildTransactions, monthlyRevenueVsExpenses } from '@/lib/aggregate'
import { AccountingView } from '@/components/accounting/accounting-view'

export const revalidate = 0

export default async function AccountingPage() {
  const [{ data: bookingsData }, { data: paymentsData }, { data: expensesData }] = await Promise.all([
    supabase.from('bookings').select('*'),
    supabase.from('payments').select('*'),
    supabase.from('expenses').select('*').order('date', { ascending: false }),
  ])

  const bookings: Booking[] = bookingsData ?? []
  const payments: Payment[] = paymentsData ?? []
  const expenses: Expense[] = expensesData ?? []

  const bookingNames = new Map(bookings.map((b) => [b.id, b.client_name]))
  const transactions = buildTransactions(payments, expenses, bookingNames)
  const monthlyPoints = monthlyRevenueVsExpenses(bookings, expenses)

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount ?? 0), 0)
  const totalOutstanding = bookings.reduce(
    (sum, b) => sum + (b.balance ?? Math.max((b.total_amount ?? 0) - (b.amount_paid ?? 0), 0)),
    0,
  )

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Accounting</h1>
        <p className="mt-1 text-muted-foreground">Track revenue, expenses, and profitability.</p>
      </div>

      <div className="p-4 sm:p-8">
        <AccountingView
          transactions={transactions}
          totalRevenue={totalRevenue}
          totalOutstanding={totalOutstanding}
          monthlyPoints={monthlyPoints}
        />
      </div>
    </>
  )
}
