'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Hammer, ShoppingBag, Users, FileText,
  BarChart2, LogOut, ExternalLink, Menu, X, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/produits', label: 'Produits', icon: Package, exact: false },
  { href: '/admin/artisans', label: 'Artisans', icon: Hammer, exact: false },
  { href: '/admin/commandes',    label: 'Commandes',       icon: ShoppingBag, exact: false },
  { href: '/admin/utilisateurs', label: 'Utilisateurs',    icon: Users,       exact: false },
  { href: '/admin/analytics',    label: 'Analytiques',     icon: BarChart2,   exact: false },
  { href: '/admin/contenu',      label: 'Contenu du site', icon: FileText,    exact: false },
]

interface Props {
  userName: string
  userEmail: string
  children: React.ReactNode
}

export default function AdminShell({ userName, userEmail, children }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  function Sidebar() {
    return (
      <>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border shrink-0">
          <img src="/logo_transparent.png" alt="Les Potiers" className="h-8 w-auto" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground leading-tight">Les Potiers</p>
            <p className="text-xs font-semibold text-primary leading-tight">Administration</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3 w-3 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-0.5 shrink-0">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          <Link
            href="/boutique"
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Voir le site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 bg-card border-r border-border z-30">
        <Sidebar />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 flex flex-col w-72 bg-card border-r border-border z-50 transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end px-4 py-3 border-b border-border shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <span
            className="text-sm font-bold text-primary"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Administration
          </span>
          <button
            onClick={signOut}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl">{children}</main>
      </div>
    </div>
  )
}
