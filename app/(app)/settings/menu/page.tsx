import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase, type MenuItem } from '@/lib/supabase'
import { MenuManagementView } from '@/components/settings/menu-management-view'

export const revalidate = 0

export default async function MenuManagementPage() {
  const { data } = await supabase.from('menu_items').select('*').order('category').order('sort_order')
  const items: MenuItem[] = data ?? []

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-6 shadow-sm sm:px-8">
        <Link
          href="/settings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Settings
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Menu Management</h1>
        <p className="mt-1 text-muted-foreground">
          Add, disable, remove, and reorder the dishes available in the booking form.
        </p>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <MenuManagementView items={items} />
        </div>
      </div>
    </>
  )
}
