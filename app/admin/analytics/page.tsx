'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart, BarChart, Bar, PieChart, Pie, Cell,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Calendar, CreditCard, Download, Package, ShoppingBag, Star, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
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

type Period      = 'today' | '7d' | '30d' | '3m' | '12m' | 'year' | 'custom'
type Granularity = 'hourly' | 'daily' | 'weekly' | 'monthly'

interface BucketData { label: string; revenue: number; orders: number }

// ── Constants ─────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d',    label: '7 derniers jours' },
  { value: '30d',   label: '30 derniers jours' },
  { value: '3m',    label: '3 derniers mois' },
  { value: '12m',   label: '12 derniers mois' },
  { value: 'year',  label: 'Cette année' },
  { value: 'custom', label: 'Personnalisé' },
]

const C = {
  primary: '#B5612A',
  accent:  '#C97B5E',
  light:   '#E8D5B7',
  dark:    '#7A5A3F',
  mid:     '#D4956E',
  pale:    '#F0C8A0',
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: '#EAB308' },
  paid:      { label: 'Payée',      color: '#3B82F6' },
  shipped:   { label: 'Expédiée',   color: '#A855F7' },
  delivered: { label: 'Livrée',     color: '#22C55E' },
  cancelled: { label: 'Annulée',    color: '#EF4444' },
}

const MONTH_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const TT: React.CSSProperties = {
  backgroundColor: 'hsl(0,0%,12%)',
  border:          '1px solid hsl(0,0%,22%)',
  borderRadius:    '8px',
  color:           'hsl(37,51%,81%)',
  fontSize:        '12px',
}

const TICK       = { fontSize: 11, fill: '#8A7A6A' }
const AXIS_PROPS = { axisLine: false, tickLine: false }

const INPUT_CLS =
  'h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground ' +
  'focus:outline-none focus:ring-1 focus:ring-ring transition-colors'

// ── Date helpers ──────────────────────────────────────────────────────────────

const pad  = (n: number) => String(n).padStart(2, '0')
const ym   = (d: Date)   => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
const ymd  = (d: Date)   => `${ym(d)}-${pad(d.getDate())}`

function addDays(d: Date, n: number)   { const r = new Date(d); r.setDate(r.getDate() + n);     return r }
function addMonths(d: Date, n: number) { const r = new Date(d); r.setMonth(r.getMonth() + n);   return r }
function startOfDay(d: Date)           { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function monthLabel(d: Date)           { return `${MONTH_FR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` }

function getPeriodRange(period: Period, customFrom: string, customTo: string) {
  const now   = new Date()
  const today = startOfDay(now)
  switch (period) {
    case 'today':  return { from: today, to: now, granularity: 'hourly'  as Granularity }
    case '7d':     return { from: addDays(today, -6),    to: now, granularity: 'daily'   as Granularity }
    case '30d':    return { from: addDays(today, -29),   to: now, granularity: 'daily'   as Granularity }
    case '3m':     return { from: addMonths(today, -3),  to: now, granularity: 'weekly'  as Granularity }
    case '12m':    return { from: new Date(now.getFullYear(), now.getMonth() - 11, 1), to: now, granularity: 'monthly' as Granularity }
    case 'year':   return { from: new Date(now.getFullYear(), 0, 1), to: now, granularity: 'monthly' as Granularity }
    case 'custom': {
      if (!customFrom || !customTo) return { from: addDays(today, -29), to: now, granularity: 'daily' as Granularity }
      const f = new Date(customFrom + 'T00:00:00')
      const t = new Date(customTo   + 'T23:59:59')
      const diff = (t.getTime() - f.getTime()) / 86400000
      const g: Granularity = diff <= 1 ? 'hourly' : diff <= 31 ? 'daily' : diff <= 92 ? 'weekly' : 'monthly'
      return { from: f, to: t, granularity: g }
    }
  }
}

function periodDesc(period: Period, from: Date, to: Date) {
  if (period === 'today')  return "Aujourd'hui"
  if (period === '7d')     return '7 derniers jours'
  if (period === '30d')    return '30 derniers jours'
  if (period === '3m')     return '3 derniers mois'
  if (period === '12m')    return '12 derniers mois'
  if (period === 'year')   return `Année ${to.getFullYear()}`
  return `${from.toLocaleDateString('fr-FR')} → ${to.toLocaleDateString('fr-FR')}`
}

function chartTitle(g: Granularity) {
  if (g === 'hourly')  return "CA & volume par heure — Aujourd'hui"
  if (g === 'daily')   return 'CA & volume par jour'
  if (g === 'weekly')  return 'CA & volume par semaine'
  return 'CA & volume par mois'
}

// ── Time-series builders ──────────────────────────────────────────────────────

function sumOrders(orders: Order[], f: (o: Order) => boolean): BucketData & { _orders: Order[] } {
  const mo = orders.filter(f)
  return { label: '', revenue: mo.reduce((s, o) => s + o.total_amount, 0), orders: mo.length, _orders: mo }
}

function buildHourly(orders: Order[], date: Date): BucketData[] {
  return Array.from({ length: 24 }, (_, h) => {
    const s = new Date(date); s.setHours(h, 0, 0, 0)
    const e = new Date(date); e.setHours(h, 59, 59, 999)
    const mo = orders.filter(o => { const d = new Date(o.created_at); return d >= s && d <= e })
    return { label: `${pad(h)}h`, revenue: mo.reduce((s2, o) => s2 + o.total_amount, 0), orders: mo.length }
  })
}

function buildDaily(orders: Order[], from: Date, to: Date): BucketData[] {
  const out: BucketData[] = []
  const cur = startOfDay(from)
  const end = startOfDay(to)
  while (cur <= end) {
    const next = addDays(cur, 1)
    const mo = orders.filter(o => { const d = new Date(o.created_at); return d >= cur && d < next })
    out.push({ label: `${pad(cur.getDate())} ${MONTH_FR[cur.getMonth()]}`, revenue: mo.reduce((s, o) => s + o.total_amount, 0), orders: mo.length })
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

function buildWeekly(orders: Order[], from: Date, to: Date): BucketData[] {
  const out: BucketData[] = []
  const cur = startOfDay(from)
  const dow = cur.getDay()
  cur.setDate(cur.getDate() - (dow === 0 ? 6 : dow - 1)) // align to Monday
  while (cur <= to) {
    const weekEnd = new Date(cur); weekEnd.setDate(weekEnd.getDate() + 6); weekEnd.setHours(23, 59, 59, 999)
    const mo = orders.filter(o => { const d = new Date(o.created_at); return d >= cur && d <= weekEnd })
    out.push({ label: `${pad(cur.getDate())} ${MONTH_FR[cur.getMonth()]}`, revenue: mo.reduce((s, o) => s + o.total_amount, 0), orders: mo.length })
    cur.setDate(cur.getDate() + 7)
  }
  return out
}

function buildMonthly(orders: Order[], from: Date, to: Date): BucketData[] {
  const out: BucketData[] = []
  const cur = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  while (cur <= end) {
    const next = new Date(cur); next.setMonth(next.getMonth() + 1)
    const mo = orders.filter(o => { const d = new Date(o.created_at); return d >= cur && d < next })
    out.push({ label: monthLabel(cur), revenue: mo.reduce((s, o) => s + o.total_amount, 0), orders: mo.length })
    cur.setMonth(cur.getMonth() + 1)
  }
  return out
}

function buildTimeSeries(orders: Order[], from: Date, to: Date, g: Granularity): BucketData[] {
  if (g === 'hourly')  return buildHourly(orders, from)
  if (g === 'daily')   return buildDaily(orders, from, to)
  if (g === 'weekly')  return buildWeekly(orders, from, to)
  return buildMonthly(orders, from, to)
}

// ── Analytics computation ─────────────────────────────────────────────────────

function compute(orders: Order[], from: Date, to: Date, g: Granularity) {
  const totalRevenue   = orders.reduce((s, o) => s + o.total_amount, 0)
  const totalOrders    = orders.length
  const avgCart        = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalCustomers = new Set(orders.map(o => o.customer_email)).size
  const maxOrder       = orders.reduce((m, o) => Math.max(m, o.total_amount), 0)

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

  const timeSeries = buildTimeSeries(orders, from, to, g)

  const topProducts = sortedByQty.slice(0, 10).map(([name, qty]) => ({
    name: name.length > 20 ? name.slice(0, 20) + '…' : name,
    fullName: name,
    qty,
    revenue: pRev.get(name) ?? 0,
  }))

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

  const sCounts = new Map<string, number>()
  for (const o of orders) sCounts.set(o.status, (sCounts.get(o.status) ?? 0) + 1)
  const statusData = Array.from(sCounts.entries()).map(([s, v]) => ({
    name:  STATUS_META[s]?.label ?? s,
    value: v,
    color: STATUS_META[s]?.color ?? '#6B7280',
  }))

  return { kpis: { totalRevenue, totalOrders, avgCart, totalCustomers, bestProduct, maxOrder }, timeSeries, topProducts, topCountries, statusData }
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
  const [allOrders,   setAllOrders]   = useState<Order[]>([])
  const [loading,     setLoading]     = useState(true)
  const [period,      setPeriod]      = useState<Period>('30d')
  const [customFrom,  setCustomFrom]  = useState('')
  const [customTo,    setCustomTo]    = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('total_amount, status, items, shipping_address, created_at, customer_email')
      setAllOrders((data ?? []) as Order[])
      setLoading(false)
    }
    load()
  }, [])

  const { from, to, granularity } = useMemo(
    () => getPeriodRange(period, customFrom, customTo),
    [period, customFrom, customTo]
  )

  const filteredOrders = useMemo(
    () => allOrders.filter(o => { const d = new Date(o.created_at); return d >= from && d <= to }),
    [allOrders, from, to]
  )

  const { kpis, timeSeries, topProducts, topCountries, statusData } = useMemo(
    () => compute(filteredOrders, from, to, granularity),
    [filteredOrders, from, to, granularity]
  )

  const xInterval = granularity === 'daily' && timeSeries.length > 14 ? Math.ceil(timeSeries.length / 10) - 1 : 0

  const exportAnalytics = () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { 'Indicateur': "Chiffre d'affaires",  'Valeur': `${kpis.totalRevenue.toFixed(2)} €` },
      { 'Indicateur': 'Commandes',            'Valeur': kpis.totalOrders },
      { 'Indicateur': 'Panier moyen',         'Valeur': `${kpis.avgCart.toFixed(2)} €` },
      { 'Indicateur': 'Clients uniques',      'Valeur': kpis.totalCustomers },
      { 'Indicateur': 'Produit phare',        'Valeur': kpis.bestProduct },
      { 'Indicateur': 'Commande max',         'Valeur': `${kpis.maxOrder.toFixed(2)} €` },
      { 'Indicateur': 'Période',              'Valeur': periodDesc(period, from, to) },
    ]), 'KPIs')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      timeSeries.map(d => ({ 'Période': d.label, 'CA (€)': d.revenue, 'Commandes': d.orders }))
    ), 'CA & volume')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      topProducts.map(p => ({ 'Produit': p.fullName, 'Quantité vendue': p.qty, 'Revenu (€)': p.revenue.toFixed(2) }))
    ), 'Top produits')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      topCountries.map(c => ({ 'Pays': c.country, 'Commandes': c.orders, 'Revenu (€)': c.revenue.toFixed(2) }))
    ), 'Top pays')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      statusData.map(s => ({ 'Statut': s.name, 'Commandes': s.value }))
    ), 'Statuts')
    XLSX.writeFile(wb, `analytiques-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
            Analytiques
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {periodDesc(period, from, to)}
            {filteredOrders.length > 0 && ` · ${filteredOrders.length} commande${filteredOrders.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-border gap-1.5 shrink-0"
          onClick={exportAnalytics}
          disabled={filteredOrders.length === 0}
        >
          <Download className="h-3.5 w-3.5" />
          Exporter Excel
        </Button>
      </div>

      {/* ── PERIOD SELECTOR ── */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex gap-1.5 flex-wrap items-center">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground shrink-0">Du</label>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground shrink-0">Au</label>
              <input
                type="date"
                value={customTo}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setCustomTo(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          label="Chiffre d'affaires"
          value={`${kpis.totalRevenue.toFixed(2)} €`}
          icon={CreditCard}
          color={C.primary}
        />
        <KPICard
          label="Commandes"
          value={String(kpis.totalOrders)}
          icon={ShoppingBag}
          color={C.accent}
        />
        <KPICard
          label="Panier moyen"
          value={`${kpis.avgCart.toFixed(2)} €`}
          icon={Package}
          color={C.primary}
        />
        <KPICard
          label="Clients uniques"
          value={String(kpis.totalCustomers)}
          icon={Users}
          color={C.accent}
        />
        <KPICard
          label="Produit phare"
          value={kpis.bestProduct.length > 18 ? kpis.bestProduct.slice(0, 18) + '…' : kpis.bestProduct}
          sub={kpis.bestProduct.length > 18 ? kpis.bestProduct : undefined}
          icon={Star}
          color={C.primary}
        />
        <KPICard
          label="Commande max"
          value={`${kpis.maxOrder.toFixed(2)} €`}
          icon={TrendingUp}
          color={C.accent}
        />
      </div>

      {/* ── REVENUE + ORDERS — time series ── */}
      <Card title={chartTitle(granularity)}>
        {filteredOrders.length === 0 ? (
          <Empty text="Aucune commande sur cette période." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={timeSeries} margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={TICK}
                interval={xInterval}
                {...AXIS_PROPS}
              />
              <YAxis yAxisId="rev" tickFormatter={v => `${v}€`} tick={TICK} {...AXIS_PROPS} width={64} />
              <YAxis yAxisId="cnt" orientation="right" allowDecimals={false} tick={TICK} {...AXIS_PROPS} width={32} />
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
                barSize={granularity === 'hourly' ? 10 : granularity === 'daily' && timeSeries.length > 14 ? 8 : 18}
              />
              <Line
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                name="CA (€)"
                stroke={C.primary}
                strokeWidth={2.5}
                dot={{ r: granularity === 'hourly' || timeSeries.length > 20 ? 0 : 3, fill: C.primary, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── TOP PRODUCTS + STATUS PIE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <Card title="Top 10 produits — quantités & revenus" className="h-full">
            {topProducts.length === 0 ? (
              <Empty text="Aucun produit vendu sur cette période." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <YAxis dataKey="name" type="category" tick={{ ...TICK, textAnchor: 'end' }} {...AXIS_PROPS} width={145} />
                  <XAxis xAxisId="qty" type="number" orientation="bottom" tick={TICK} {...AXIS_PROPS} allowDecimals={false} />
                  <XAxis xAxisId="rev" type="number" orientation="top"    tick={TICK} {...AXIS_PROPS} tickFormatter={v => `${v}€`} />
                  <Tooltip content={<ProductTooltip />} />
                  <Bar xAxisId="qty" dataKey="qty"     name="Quantité" fill={C.primary} radius={[0, 3, 3, 0]} barSize={9} />
                  <Bar xAxisId="rev" dataKey="revenue" name="Revenu €" fill={C.accent}  radius={[0, 3, 3, 0]} barSize={9} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <div className="xl:col-span-2">
          <Card title="Répartition par statut" className="h-full">
            {statusData.length === 0 ? (
              <Empty text="Aucune commande sur cette période." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
          <Empty text="Aucune donnée pays sur cette période." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCountries} margin={{ top: 5, right: 64, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="country" tick={TICK} {...AXIS_PROPS} />
              <YAxis yAxisId="cnt" allowDecimals={false} tick={TICK} {...AXIS_PROPS} />
              <YAxis yAxisId="rev" orientation="right" tickFormatter={v => `${v}€`} tick={TICK} {...AXIS_PROPS} width={64} />
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
