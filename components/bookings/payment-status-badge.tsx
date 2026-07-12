const statusClasses: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700 border border-green-300',
  Partial: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  Unpaid: 'bg-red-100 text-red-700 border border-red-300',
}

export function PaymentStatusBadge({ status }: { status: string | null }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        statusClasses[status ?? ''] ?? statusClasses.Unpaid
      }`}
    >
      {status ?? 'Unpaid'}
    </span>
  )
}
