import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton({
  cards = 4,
  showTable = true,
}: {
  cards?: number
  showTable?: boolean
}) {
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="space-y-8 p-4 sm:p-8">
        {cards > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: cards }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        )}

        {showTable && (
          <div className="space-y-3 rounded-lg border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function FormSkeleton() {
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
