'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  order_number: string
  customer_name: string | null
  customer_email: string
  status: string
  total_amount: number
  items: { product_name: string; quantity: number; price: number }[]
  created_at: string
}

const STATUSES = [
  { value: 'all',       label: 'Toutes' },
  { value: 'pending',   label: 'En attente' },
  { value: 'paid',      label: 'Payées' },
  { value: 'shipped',   label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
]

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-yellow-500/10 text-yellow-500' },
  paid:      { label: 'Payée',      cls: 'bg-blue-500/10 text-blue-500' },
  shipped:   { label: 'Expédiée',   cls: 'bg-purple-500/10 text-purple-500' },
  delivered: { label: 'Livrée',     cls: 'bg-green-500/10 text-green-500' },
  cancelled: { label: 'Annulée',    cls: 'bg-red-500/10 text-red-500' },
}

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const supabase = createClient()

  async function load() {
    setLoading(true)
    try {
      let q = supabase.from('orders').select('id, order_number, customer_name, customer_email, status, total_amount, items, created_at').order('created_at', { ascending: false })
      if (tab !== 'all') q = q.eq('status', tab)
      const { data } = await q
      setOrders(data ?? [])
    } catch {
      setOrders([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const markShipped = async (id: string) => {
    await supabase.from('orders').update({ status: 'shipped' }).eq('id', id)
    toast.success('Commande marquée comme expédiée')
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o))
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>Commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivi et gestion des commandes</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setTab(s.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === s.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Aucune commande</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === 'all' ? 'Les commandes apparaîtront ici une fois le paiement activé.' : `Aucune commande avec le statut "${STATUSES.find(s => s.value === tab)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const st = STATUS_STYLE[o.status] ?? { label: o.status, cls: 'bg-muted text-muted-foreground' }
            return (
              <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">#{o.order_number}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{o.customer_name ?? o.customer_email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-foreground">{o.total_amount.toFixed(2)} €</p>
                    {o.status === 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border gap-1.5"
                        onClick={() => markShipped(o.id)}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        Expédier
                      </Button>
                    )}
                  </div>
                </div>
                {o.items?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {o.items.map((item, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {item.quantity}× {item.product_name} — {item.price.toFixed(2)} €
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
