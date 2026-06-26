'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, BarChart, Bar, PieChart, Pie, Cell,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CreditCard, Package, ShoppingBag, Star, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string
  quantity:     number
  unit_price:   number
  subtotal:     number
}

interface Order {
  total_amount:     number
  status:           string
  items:            OrderItem[]
  shipping_address: { country: string; city: string } | null
  created_at:       string
  customer_email:   string
}

// ── Brand palette ─────────────────────────────────────────────────────────────

const C = {
  primary: '#B5612A',
  accent:  '#C97B5E',
  light:   '#E8D5B7',
  dark:    '#7A5A3F',
  mid:     '#D4956E',
  pale:    '#F0C8A0',
}

const PALETTE = [C.primary, C.accent, C.light, C.dark, C.mid, C.pale, '#A04A1F', '#E8A87C']

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: '#EAB308' },
  paid:      { label: 'Payée',      color: '#3B82F6' },
  shipped:   { label: 'Expédiée',   color: '#A855F7' },
  delivered: { label: 'Livrée',     color: '#22C55E' },
  cancelled: { label: 'Annulée',    color: '#EF4444' },
}

// Tooltip style matching the dark admin card surface
const TT: React.CSSProperties = {
  backgroundColor: 'hsl(0,0%,12%)',
  border:          '1px solid hsl(0,0%,22%)',
  borderRadius:    '8px',
  color:           'hsl(37,51%,81%)',
  fontSize:        '12px',
}

const TICK = { fontSize: 11, fill: '#8A7A6A' }
const AXIS_PROPS = { axisLine: false, tickLine: false }

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function monthLabel(ym: string) {
  const [y, m] = ym.split('-')
  return `${MONTH_FR[parseInt(m) - 1]} ${y.slice(2)}`
}

function fmtEur(v: number) { return `${v.toFixed(0)} €` }

function last12Months() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

function thisMonthPrefix() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function trunc(s: string, n = 22) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

// ── Analytics computation ─────────────────────────────────────────────────────

function compute(orders: Order[]) {
  const totalRevenue     = orders.reduce((s, o) => s + o.total_amount, 0)
  const revenueThisMonth = orders.filter(o => o.created_at.startsWith(thisMonthPrefix()))
                                  .reduce((s, o) => s + o.total_amount, 0)
  const totalOrders    = orders.length
  const avgCart        = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalCustomers = new Set(orders.map(o => o.customer_email)).size

  // Best product by quantity
  const pQty = new Map<string, number>()
  const pRev = new Map<string, number>()
  for (const o of orders) {
    for (const item of o.items ?? []) {
      pQty.set(item.product_name, (pQty.get(item.product_name) ?? 0) + item.quantity)
      pRev.set(item.product_name, (pRev.get(item.product_name) ?? 0) + (item.subtotal || item.unit_price * item.quantity || 0))
    }
  }
  const sortedByQty = Array.from(pQty.entries()).sort((a, b) => b[1] - a[1])
  const bestProduct  = sortedByQty[0]?.[0] ?? '—'

  // Monthly data (last 12 months)
  const months  = last12Months()
  const monthly = months.map(ym => {
    const mo = orders.filter(o => o.created_at.startsWith(ym))
    return {
      month:   monthLabel(ym),
      revenue: mo.reduce((s, o) => s + o.total_amount, 0),
      orders:  mo.length,
    }
  })

  // Top 10 products by quantity
  const topProducts = sortedByQty.slice(0, 10).map(([name, qty]) => ({
    name:    trunc(name, 20),
    fullName: name,
    qty,
    revenue: pRev.get(name) ?? 0,
  }))

  // Top 8 countries
  const cOrders  = new Map<string, number>()
  const cRevenue = new Map<string, number>()
  for (const o of orders) {
    const country = o.shipping_address?.country || 'Inconnu'
    cOrders.set(country,  (cOrders.get(country)  ?? 0) + 1)
    cRevenue.set(country, (cRevenue.get(country) ?? 0) + o.total_amount)
  }
  const topCountries = Array.from(cOrders.entries())
    .map(([country, cnt]) => ({ country, orders: cnt, revenue: cRevenue.get(country) ?? 0 }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8)

  // Status distribution
  const sCounts = new Map<string, number>()
  for (const o of orders) sCounts.set(o.status, (sCounts.get(o.status) ?? 0) + 1)
  const statusData = Array.from(sCounts.entries()).map(([s, v]) => ({
    name:  STATUS_META[s]?.label ?? s,
    value: v,
    color: STATUS_META[s]?.color ?? '#6B7280',
  }))

  return { kpis: { totalRevenue, revenueThisMonth, totalOrders, avgCart, totalCustomers, bestProduct }, monthly, topProducts, topCountries, statusData }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
        </div>
        <div className="rounded-xl p-2.5 shrink-0" style={{ backgroundColor: `${color}25` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  )
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 ${className}`}>
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-10">{text}</p>
}

// ── Custom tooltip for products ───────────────────────────────────────────────

function ProductTooltip({ active, payload }: { active?: boolean; payload?: { payload: { fullName: string; qty: number; revenue: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={TT} className="px-3 py-2 space-y-0.5">
      <p className="font-semibold text-[13px]" style={{ color: C.light }}>{d.fullName}</p>
      <p style={{ color: C.primary }}>Qté vendue : <strong>{d.qty}</strong></p>
      <p style={{ color: C.accent }}>Revenu : <strong>{d.revenue.toFixed(2)} €</strong></p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('total_amount, status, items, shipping_address, created_at, customer_email')
      setOrders((data ?? []) as Order[])
      setLoading(false)
    }
    load()
  }, [])

  const { kpis, monthly, topProducts, topCountries, statusData } = useMemo(() => compute(orders), [orders])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Analytiques
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d'ensemble des performances de la boutique
          {orders.length > 0 && ` · ${orders.length} commande${orders.length > 1 ? 's' : ''} analysée${orders.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          label="CA total"
          value={`${kpis.totalRevenue.toFixed(2)} €`}
          icon={CreditCard}
          color={C.primary}
        />
        <KPICard
          label="CA ce mois"
          value={`${kpis.revenueThisMonth.toFixed(2)} €`}
          icon={TrendingUp}
          color={C.accent}
        />
        <KPICard
          label="Commandes"
          value={String(kpis.totalOrders)}
          icon={ShoppingBag}
          color={C.primary}
        />
        <KPICard
          label="Panier moyen"
          value={`${kpis.avgCart.toFixed(2)} €`}
          icon={Package}
          color={C.accent}
        />
        <KPICard
          label="Clients uniques"
          value={String(kpis.totalCustomers)}
          icon={Users}
          color={C.primary}
        />
        <KPICard
          label="Produit phare"
          value={trunc(kpis.bestProduct, 18)}
          sub={kpis.bestProduct.length > 18 ? kpis.bestProduct : undefined}
          icon={Star}
          color={C.accent}
        />
      </div>

      {/* ── REVENUE + ORDERS — last 12 months (combo chart) ── */}
      <Card title="Chiffre d'affaires & volume — 12 derniers mois">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthly} margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={TICK} {...AXIS_PROPS} />
            <YAxis
              yAxisId="rev"
              tickFormatter={fmtEur}
              tick={TICK}
              {...AXIS_PROPS}
              width={68}
            />
            <YAxis
              yAxisId="cnt"
              orientation="right"
              allowDecimals={false}
              tick={TICK}
              {...AXIS_PROPS}
              width={36}
            />
            <Tooltip
              contentStyle={TT}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: number, name: string) =>
                name === 'revenue' ? [`${v.toFixed(2)} €`, 'CA'] : [v, 'Commandes']
              ) as any}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#8A7A6A', paddingTop: '12px' }} />
            <Bar
              yAxisId="cnt"
              dataKey="orders"
              name="Commandes"
              fill={C.light}
              opacity={0.4}
              radius={[3, 3, 0, 0]}
              barSize={18}
            />
            <Line
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              name="CA (€)"
              stroke={C.primary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: C.primary, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── TOP PRODUCTS + STATUS PIE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Top 10 products */}
        <div className="xl:col-span-3">
          <Card title="Top 10 produits — quantités vendues & revenus" className="h-full">
            {topProducts.length === 0 ? (
              <Empty text="Aucun produit vendu pour l'instant." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ ...TICK, textAnchor: 'end' }}
                    {...AXIS_PROPS}
                    width={145}
                  />
                  {/* bottom X-axis: quantity */}
                  <XAxis
                    xAxisId="qty"
                    type="number"
                    orientation="bottom"
                    tick={TICK}
                    {...AXIS_PROPS}
                    allowDecimals={false}
                  />
                  {/* top X-axis: revenue */}
                  <XAxis
                    xAxisId="rev"
                    type="number"
                    orientation="top"
                    tick={TICK}
                    {...AXIS_PROPS}
                    tickFormatter={v => `${v}€`}
                  />
                  <Tooltip content={<ProductTooltip />} />
                  <Bar
                    xAxisId="qty"
                    dataKey="qty"
                    name="Quantité"
                    fill={C.primary}
                    radius={[0, 3, 3, 0]}
                    barSize={9}
                  />
                  <Bar
                    xAxisId="rev"
                    dataKey="revenue"
                    name="Revenu €"
                    fill={C.accent}
                    radius={[0, 3, 3, 0]}
                    barSize={9}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Status pie */}
        <div className="xl:col-span-2">
          <Card title="Répartition par statut" className="h-full">
            {statusData.length === 0 ? (
              <Empty text="Aucune commande." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TT}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={((v: number, name: string) => [v, name]) as any}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 mt-3">
                  {statusData.map((s, i) => {
                    const pct = kpis.totalOrders > 0 ? ((s.value / kpis.totalOrders) * 100).toFixed(0) : '0'
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-muted-foreground">{s.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{pct}%</span>
                          <span className="font-semibold text-foreground w-5 text-right">{s.value}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ── TOP COUNTRIES ── */}
      <Card title="Top pays — commandes & chiffre d'affaires">
        {topCountries.length === 0 ? (
          <Empty text="Aucune donnée pays disponible." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCountries} margin={{ top: 5, right: 64, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="country" tick={TICK} {...AXIS_PROPS} />
              <YAxis
                yAxisId="cnt"
                allowDecimals={false}
                tick={TICK}
                {...AXIS_PROPS}
              />
              <YAxis
                yAxisId="rev"
                orientation="right"
                tickFormatter={fmtEur}
                tick={TICK}
                {...AXIS_PROPS}
                width={64}
              />
              <Tooltip
                contentStyle={TT}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: number, name: string) =>
                  name === 'revenue' ? [`${v.toFixed(2)} €`, 'Revenu'] : [v, 'Commandes']
                ) as any}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8A7A6A', paddingTop: '10px' }} />
              <Bar yAxisId="cnt" dataKey="orders"  name="Commandes" fill={C.primary} radius={[3, 3, 0, 0]} />
              <Bar yAxisId="rev" dataKey="revenue" name="Revenu €"  fill={C.accent}  radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

    </div>
  )
}
