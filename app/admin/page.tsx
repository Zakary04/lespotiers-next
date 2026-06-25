'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Package, Hammer, ShoppingBag, Users, TrendingUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  products: number
  artisans: number
  customers: number
  orders: number
  revenue: number
}

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string | null
  customer_email: string
  status: string
  total_amount: number
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-yellow-500/10 text-yellow-500' },
  paid:      { label: 'Payé',       cls: 'bg-blue-500/10 text-blue-500' },
  shipped:   { label: 'Expédié',    cls: 'bg-purple-500/10 text-purple-500' },
  delivered: { label: 'Livré',      cls: 'bg-green-500/10 text-green-500' },
  cancelled: { label: 'Annulé',     cls: 'bg-red-500/10 text-red-500' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [
        { count: products },
        { count: artisans },
        { count: customers },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('artisans').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      ])

      let ordersCount = 0
      let revenue = 0
      try {
        const { count, data: revData } = await supabase
          .from('orders')
          .select('total_amount', { count: 'exact' })
          .neq('status', 'cancelled')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ordersCount = count ?? 0
        revenue = (revData ?? []).reduce((s: number, r: { total_amount: number }) => s + r.total_amount, 0)
      } catch {}

      setStats({ products: products ?? 0, artisans: artisans ?? 0, customers: customers ?? 0, orders: ordersCount, revenue })

      try {
        const { data } = await supabase.from('orders').select('id, order_number, customer_name, customer_email, status, total_amount, created_at').order('created_at', { ascending: false }).limit(5)
        setOrders(data ?? [])
      } catch {}
    }

    load()
  }, [])

  const statCards = [
    { icon: ShoppingBag, label: 'Commandes ce mois', value: stats?.orders ?? '—', sub: `${stats?.revenue?.toFixed(0) ?? '—'} € de CA`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: TrendingUp,  label: 'Chiffre d\'affaires', value: stats ? `${stats.revenue.toFixed(0)} €` : '—', sub: 'ce mois', color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Package,     label: 'Produits actifs', value: stats?.products ?? '—', sub: 'en catalogue', color: 'text-primary', bg: 'bg-primary/10', href: '/admin/produits' },
    { icon: Users,       label: 'Clients', value: stats?.customers ?? '—', sub: 'inscrits', color: 'text-purple-500', bg: 'bg-purple-500/10', href: '/admin/utilisateurs' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de votre boutique</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/produits/nouveau">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nouveau produit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, sub, color, bg, href }) => {
          const inner = (
            <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          )
          return href ? <Link key={label} href={href}>{inner}</Link> : <div key={label}>{inner}</div>
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/produits/nouveau', label: 'Ajouter un produit', icon: Package },
          { href: '/admin/artisans/nouveau', label: 'Ajouter un artisan', icon: Hammer },
          { href: '/admin/commandes', label: 'Voir les commandes', icon: ShoppingBag },
          { href: '/admin/utilisateurs', label: 'Gérer les utilisateurs', icon: Users },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-muted/50 transition-all text-center group"
          >
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Commandes récentes</h2>
          <Link href="/admin/commandes" className="text-xs text-primary hover:underline">Voir tout</Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">Aucune commande pour le moment</p>
            <p className="text-xs text-muted-foreground mt-1">Les commandes apparaîtront ici une fois que le système de paiement sera actif.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(o => {
              const st = STATUS_LABELS[o.status] ?? { label: o.status, cls: 'bg-muted text-muted-foreground' }
              return (
                <div key={o.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name ?? o.customer_email}</p>
                  </div>
                  <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  <p className="text-sm font-bold text-foreground shrink-0">{o.total_amount.toFixed(2)} €</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
