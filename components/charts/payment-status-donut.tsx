'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { PaymentStatusCount } from '@/lib/aggregate'

const COLORS: Record<PaymentStatusCount['status'], string> = {
  Paid: '#2D5A27',
  Partial: '#D4A373',
  Unpaid: '#8B5E3C',
}

export function PaymentStatusDonut({ data }: { data: PaymentStatusCount[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No bookings yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={220} className="max-w-[220px]">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={80} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} bookings`, String(name)]}
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--popover-foreground)',
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[entry.status] }} />
            <span className="text-foreground">{entry.status}</span>
            <span className="text-muted-foreground">
              {entry.count} ({total > 0 ? Math.round((entry.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
