'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { logout } from '@/lib/auth-actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-accent opacity-75 transition-opacity hover:opacity-100 disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? 'Logging out...' : 'Logout'}
    </button>
  )
}
