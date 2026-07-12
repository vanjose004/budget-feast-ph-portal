'use client'

import { LayoutDashboard, BookOpen, Users, Calendar, Wallet, Settings, ChefHat, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogoutButton } from '@/components/auth/logout-button'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/accounting', label: 'Accounting', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-accent p-2">
        <ChefHat className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-primary-foreground">Budget Feast</h1>
        <p className="text-xs text-accent opacity-80">PH</p>
      </div>
    </div>
  )
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-2 px-4 py-6">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
              isActive
                ? 'bg-accent font-medium text-primary'
                : 'text-primary-foreground text-opacity-90 hover:bg-sidebar-primary'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function Footer() {
  return (
    <div className="border-t border-sidebar-border p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <span className="text-sm font-semibold text-primary">JD</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-primary-foreground">John Doe</p>
            <p className="text-xs text-accent opacity-75">Owner</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-primary px-4 py-3 print:hidden lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-primary-foreground hover:bg-sidebar-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-64 max-w-[80vw] flex-col bg-primary">
            <div className="flex items-center justify-between border-b border-sidebar-border p-6">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-primary-foreground hover:bg-sidebar-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <Footer />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-primary print:hidden lg:flex">
        <div className="border-b border-sidebar-border p-6">
          <Logo />
        </div>
        <NavLinks pathname={pathname} />
        <Footer />
      </aside>
    </>
  )
}
