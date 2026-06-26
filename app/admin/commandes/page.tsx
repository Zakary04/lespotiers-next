'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Download, RotateCcw, Search, ShoppingBag, Truck, Users } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ShippingAddress {
  firstName:  string
  lastName:   string
  email:      string
  address:    string
  city:       string
  postalCode: string
  country:    string
  phone:      string
}

interface OrderItem {
  product_name: string
  quantity:     number
  unit_price:   number
  subtotal:     number
}

interface Order {
  id:               string
  order_number:     string
  customer_name:    string | null
  customer_email:   string
  status:           string
  total_amount:     number
  items:            OrderItem[]
  shipping_address: ShippingAddress | null
  created_at:       string
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

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const fieldCls =
  'h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground ' +
  'focus:outline-none focus:ring-1 focus:ring-ring transition-colors'

export default function AdminCommandesPage() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [search,    setSearch]    = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [country,   setCountry]   = useState('')
  const [city,      setCity]      = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [minAmt,    setMinAmt]    = useState('')
  const [maxAmt,    setMaxAmt]    = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, status, total_amount, items, shipping_address, created_at')
      .order('created_at', { ascending: false })
    setOrders((data ?? []) as Order[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { setCity('') }, [country])

  const countries = useMemo(() =>
    Array.from(new Set(orders.map(o => o.shipping_address?.country ?? '').filter(Boolean))).sort()
  , [orders])

  const cities = useMemo(() =>
    Array.from(new Set(
      orders
        .filter(o => !country || o.shipping_address?.country === country)
        .map(o => o.shipping_address?.city ?? '')
        .filter(Boolean)
    )).sort()
  , [orders, country])

  const filteredOrders = useMemo(() => {
    const q      = search.toLowerCase()
    const toDate = dateTo ? dateTo + 'T23:59:59' : ''
    return orders.filter(o => {
      if (statusTab !== 'all' && o.status !== statusTab) return false
      if (q && !(o.order_number.toLowerCase().includes(q) || (o.customer_name ?? '').toLowerCase().includes(q))) return false
      if (country && o.shipping_address?.country !== country) return false
      if (city    && o.shipping_address?.city    !== city)    return false
      if (dateFrom && o.created_at < dateFrom)  return false
      if (toDate   && o.created_at > toDate)    return false
      if (minAmt && o.total_amount < parseFloat(minAmt)) return false
      if (maxAmt && o.total_amount > parseFloat(maxAmt)) return false
      return true
    })
  }, [orders, statusTab, search, country, city, dateFrom, dateTo, minAmt, maxAmt])

  const hasFilters = !!(search || statusTab !== 'all' || country || city || dateFrom || dateTo || minAmt || maxAmt)

  const resetFilters = () => {
    setSearch(''); setStatusTab('all'); setCountry(''); setCity('')
    setDateFrom(''); setDateTo(''); setMinAmt(''); setMaxAmt('')
  }

  const markShipped = async (id: string) => {
    await supabase.from('orders').update({ status: 'shipped' }).eq('id', id)
    toast.success('Commande marquée comme expédiée')
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o))
  }

  const exportOrders = () => {
    const rows = filteredOrders.map(o => ({
      'Numéro de commande':  o.order_number,
      'Date':                fmtDate(o.created_at),
      'Nom client':          o.customer_name ?? '',
      'Email':               o.customer_email,
      'Ville':               o.shipping_address?.city       ?? '',
      'Pays':                o.shipping_address?.country    ?? '',
      'Téléphone':           o.shipping_address?.phone      ?? '',
      'Produits':            (o.items ?? []).map(i => `${i.quantity}× ${i.product_name}`).join(' | '),
      'Prix unitaires (€)':  (o.items ?? []).map(i => `${(i.unit_price ?? 0).toFixed(2)}`).join(' | '),
      'Montant total (€)':   o.total_amount,
      'Statut':              STATUS_STYLE[o.status]?.label ?? o.status,
      'Adresse':             o.shipping_address?.address    ?? '',
      'Code postal':         o.shipping_address?.postalCode ?? '',
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes')
    XLSX.writeFile(wb, `commandes-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const exportCustomers = () => {
    const map = new Map<string, {
      name: string; email: string; phone: string; city: string; country: string
      count: number; total: number; first: string; last: string
    }>()
    for (const o of orders) {
      const email = o.customer_email
      if (!map.has(email)) {
        map.set(email, {
          name:    o.customer_name ?? '',
          email,
          phone:   o.shipping_address?.phone   ?? '',
          city:    o.shipping_address?.city    ?? '',
          country: o.shipping_address?.country ?? '',
          count: 0, total: 0,
          first: o.created_at,
          last:  o.created_at,
        })
      }
      const c = map.get(email)!
      c.count++
      c.total += o.total_amount
      if (o.created_at < c.first) c.first = o.created_at
      if (o.created_at > c.last)  c.last  = o.created_at
    }
    const rows = Array.from(map.values()).map(c => ({
      'Nom complet':               c.name,
      'Email':                     c.email,
      'Téléphone':                 c.phone,
      'Ville':                     c.city,
      'Pays':                      c.country,
      'Nombre de commandes':       c.count,
      'Montant total dépensé (€)': c.total,
      'Première commande':         fmtDate(c.first),
      'Dernière commande':         fmtDate(c.last),
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Clients')
    XLSX.writeFile(wb, `clients-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
            Commandes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? 'Chargement…'
              : `${filteredOrders.length} commande${filteredOrders.length !== 1 ? 's' : ''}${hasFilters ? ' (filtrées)' : ''}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={exportCustomers}>
            <Users className="h-3.5 w-3.5" />
            Exporter clients
          </Button>
          <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={exportOrders}>
            <Download className="h-3.5 w-3.5" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setStatusTab(s.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusTab === s.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="N° commande ou nom client"
              className="bg-background border-border pl-8"
            />
          </div>

          {/* Country */}
          <select value={country} onChange={e => setCountry(e.target.value)} className={fieldCls}>
            <option value="">Tous les pays</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* City */}
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className={fieldCls}
            disabled={cities.length === 0}
          >
            <option value="">Toutes les villes</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Date from */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Date de début</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className={fieldCls}
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Date de fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className={fieldCls}
            />
          </div>

          {/* Amount range */}
          <div className="flex gap-2">
            <input
              type="number"
              value={minAmt}
              onChange={e => setMinAmt(e.target.value)}
              placeholder="Min €"
              min="0"
              className={fieldCls}
            />
            <input
              type="number"
              value={maxAmt}
              onChange={e => setMaxAmt(e.target.value)}
              placeholder="Max €"
              min="0"
              className={fieldCls}
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Aucune commande</p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasFilters
              ? 'Aucune commande ne correspond aux filtres actifs.'
              : 'Les commandes apparaîtront ici une fois le paiement activé.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(o => {
            const st = STATUS_STYLE[o.status] ?? { label: o.status, cls: 'bg-muted text-muted-foreground' }
            return (
              <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">#{o.order_number}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {o.customer_name ?? o.customer_email}
                    </p>
                    {o.shipping_address && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.shipping_address.city}
                        {o.shipping_address.country ? `, ${o.shipping_address.country}` : ''}
                      </p>
                    )}
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
                {(o.items?.length ?? 0) > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {o.items.map((item, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {item.quantity}× {item.product_name} — {(item.unit_price ?? 0).toFixed(2)} €
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
