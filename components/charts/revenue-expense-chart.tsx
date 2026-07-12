'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthPoint } from '@/lib/aggregate'
import { formatCurrency } from '@/lib/utils'

export function RevenueExpenseChart({ data, showExpenses = false }: { data: MonthPoint[]; showExpenses?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₱${Math.round(value / 1000)}k`}
          width={48}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--popover-foreground)',
            fontSize: 13,
          }}
        />
        {showExpenses && <Legend wrapperStyle={{ fontSize: 12 }} />}
        <Bar dataKey="revenue" name="Revenue" fill="#2D5A27" radius={[4, 4, 0, 0]} />
        {showExpenses && <Bar dataKey="expenses" name="Expenses" fill="#8B5E3C" radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  )
}
