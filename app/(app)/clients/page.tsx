import Link from 'next/link'
import { Users } from 'lucide-react'
import { supabase, type Booking } from '@/lib/supabase'
import { aggregateClients } from '@/lib/aggregate'
import { formatCurrency } from '@/lib/utils'
import { EmptyState } from '@/components/empty-state'

export const revalidate = 0

export default async function ClientsPage() {
  const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
  const bookings: Booking[] = data ?? []
  const clients = aggregateClients(bookings)

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Clients</h1>
        <p className="mt-1 text-muted-foreground">Everyone who has booked with you, auto-generated from bookings.</p>
      </div>

      <div className="p-4 sm:p-8">
        {clients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No clients yet"
            description="Clients appear here automatically once you create bookings."
            action={
              <Link
                href="/bookings/new"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                + New Booking
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Name</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Contact</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">Facebook</th>
                  <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-foreground">
                    Total Events
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                    Total Spend
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.name}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      <Link href={`/bookings?search=${encodeURIComponent(client.name)}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {client.contactNumber ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{client.facebook ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-muted-foreground">
                      {client.totalEvents}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrency(client.totalSpend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
