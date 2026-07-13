'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowDownCircle, ArrowUpCircle, Receipt, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/stat-card'
import { RevenueExpenseChart } from '@/components/charts/revenue-expense-chart'
import { AddExpenseDialog } from '@/components/accounting/add-expense-dialog'
import { EmptyState } from '@/components/empty-state'
import { formatCurrency } from '@/lib/utils'
import { deleteExpense } from '@/lib/actions'
import { expenseCategoryGroup } from '@/lib/constants'
import type { MonthPoint, Transaction } from '@/lib/aggregate'

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AccountingView({
  transactions,
  totalRevenue,
  totalOutstanding,
  monthlyPoints,
}: {
  transactions: Transaction[]
  totalRevenue: number
  totalOutstanding: number
  monthlyPoints: MonthPoint[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [month, setMonth] = useState('')

  const filtered = useMemo(
    () => (month ? transactions.filter((t) => t.date.startsWith(month)) : transactions),
    [transactions, month],
  )

  const totalCollected = filtered.filter((t) => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filtered.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)
  const netProfit = totalCollected - totalExpenses

  const ledger = useMemo(() => {
    const ascending = [...filtered].sort((a, b) => a.date.localeCompare(b.date))
    let running = 0
    const withBalance = ascending.map((t) => {
      running += t.type === 'Income' ? t.amount : -t.amount
      return { ...t, balance: running }
    })
    return withBalance.reverse()
  }, [filtered])

  function handleDeleteExpense(id: string) {
    const expenseId = id.replace('expense-', '')
    startTransition(async () => {
      try {
        await deleteExpense(expenseId)
        toast.success('Expense deleted.')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete expense.')
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<Wallet className="h-6 w-6" />} color="primary" />
        <StatCard title="Total Collected" value={formatCurrency(totalCollected)} icon={<ArrowDownCircle className="h-6 w-6" />} color="success" />
        <StatCard title="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={<Receipt className="h-6 w-6" />} color="warning" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={<ArrowUpCircle className="h-6 w-6" />} color="accent" />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={netProfit >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
          color={netProfit >= 0 ? 'success' : 'warning'}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Revenue vs Expenses</h2>
        <RevenueExpenseChart data={monthlyPoints} showExpenses />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Transactions</h2>
          <div className="flex items-center gap-2">
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
            <AddExpenseDialog />
          </div>
        </div>

        {ledger.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-8 w-8" />}
            title="No transactions"
            description="Payments and expenses will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-foreground">Date</th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-foreground">Description</th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-foreground">Category</th>
                  <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-foreground">Type</th>
                  <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-foreground">Amount</th>
                  <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-foreground">Balance</th>
                  <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{formatDate(t.date)}</td>
                    <td className="px-3 py-2.5 text-foreground">{t.description}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                      {t.type === 'Expense' && t.category ? (
                        <>
                          <span className="text-xs">{expenseCategoryGroup(t.category)}</span>
                          <span className="mx-1">&middot;</span>
                          {t.category}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          t.type === 'Income'
                            ? 'border border-green-300 bg-green-100 text-green-700'
                            : 'border border-orange-300 bg-orange-100 text-orange-700'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2.5 text-right font-medium ${
                        t.type === 'Income' ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium text-foreground">
                      {formatCurrency(t.balance)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      {t.type === 'Expense' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(t.id)}
                          disabled={isPending}
                          aria-label="Delete expense"
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
