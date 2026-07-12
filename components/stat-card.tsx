import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'primary' | 'accent' | 'success' | 'warning'
}

const colorClasses = {
  primary: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-green-600 text-white',
  warning: 'bg-orange-500 text-white',
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-lg p-3 ml-4`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
