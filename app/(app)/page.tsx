import Link from 'next/link'
import { BarChart3, Calendar, AlertCircle, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { RecentBookings } from '@/components/recent-bookings'
import { UpcomingEvents } from '@/components/upcoming-events'
import { RevenueExpenseChart } from '@/components/charts/revenue-expense-chart'
import { PaymentStatusDonut } from '@/components/charts/payment-status-donut'
import { supabase, type Booking } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { monthlyRevenueVsExpenses, paymentStatusCounts } from '@/lib/aggregate'

export const revalidate = 0

export default async function Dashboard() {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  const bookings: Booking[] = data ?? []

  const today = new Date().toISOString().slice(0, 10)

  const totalBookings = bookings.length
  const upcomingCount = bookings.filter((b) => b.event_date && b.event_date >= today).length

  const outstandingBalance = bookings.reduce(
    (sum, b) => sum + (b.balance ?? Math.max((b.total_amount ?? 0) - (b.amount_paid ?? 0), 0)),
    0,
  )

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid ?? 0), 0)

  const revenuePoints = monthlyRevenueVsExpenses(bookings, [])
  const statusCounts = paymentStatusCounts(bookings)

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome back! Here&apos;s your catering business overview.</p>
          </div>
          <Link
            href="/bookings/new"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            + New Booking
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 p-4 sm:p-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            icon={<BarChart3 className="h-6 w-6" />}
            color="primary"
          />
          <StatCard
            title="Upcoming Events"
            value={upcomingCount}
            icon={<Calendar className="h-6 w-6" />}
            color="accent"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<TrendingUp className="h-6 w-6" />}
            color="success"
          />
          <StatCard
            title="Outstanding Balance"
            value={formatCurrency(outstandingBalance)}
            icon={<AlertCircle className="h-6 w-6" />}
            color="warning"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Monthly Revenue</h2>
            <RevenueExpenseChart data={revenuePoints} />
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-foreground">Payment Status</h2>
            <PaymentStatusDonut data={statusCounts} />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentBookings bookings={bookings.slice(0, 5)} />
          </div>
          <div>
            <UpcomingEvents bookings={bookings.filter((b) => b.event_date && b.event_date >= today).slice(0, 3)} title="Upcoming This Week" />
          </div>
        </div>
      </div>
    </>
  )
}
