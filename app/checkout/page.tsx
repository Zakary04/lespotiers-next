'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, MapPin, ClipboardList, CreditCard,
  Plus, Minus, Trash2, ChevronRight, ArrowLeft, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { fmtXOF } from '@/lib/utils/currency'

type Step = 1 | 2 | 3 | 4

interface Address {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
}

const SHIPPING_THRESHOLD = 150
const SHIPPING_COST = 12.9
const ADDRESS_KEY = 'lp_shipping_address'

const STEP_LABELS = ['Panier', 'Livraison', 'Récapitulatif', 'Paiement']
const STEP_ICONS  = [ShoppingBag, MapPin, ClipboardList, CreditCard]

function genOrderNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.random().toString(36).toUpperCase().slice(2, 7)
  return `LP-${y}${m}-${rand}`
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center mb-10">
      {STEP_ICONS.map((Icon, i) => {
        const n    = (i + 1) as Step
        const done   = current > n
        const active = current === n
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? 'bg-primary border-primary text-primary-foreground'
                : active ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-muted-foreground'
              }`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
              }`}>{STEP_LABELS[i]}</span>
            </div>
            {i < STEP_ICONS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 sm:mb-6 transition-colors ${
                current > n ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function QtyControl({ value, onDec, onInc }: { value: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
      <button onClick={onDec} className="px-3 py-2 hover:bg-muted transition-colors text-foreground">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-4 py-2 text-sm font-semibold text-foreground min-w-[3rem] text-center border-x border-border">{value}</span>
      <button onClick={onInc} className="px-3 py-2 hover:bg-muted transition-colors text-foreground">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, isLoadingCart } = useCart()
  const { user, profile } = useAuth()
  const router   = useRouter()
  const supabase = createClient()

  const [step,         setStep]         = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveAddress,  setSaveAddress]  = useState(false)
  const [address, setAddress] = useState<Address>({
    firstName: '', lastName: '', email: '',
    address: '', city: '', postalCode: '',
    country: 'France', phone: '',
  })

  const shipping  = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total     = cartTotal + shipping
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    const saved = localStorage.getItem(ADDRESS_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAddress({
          ...parsed,
          email: user?.email || parsed.email || '',
        })
      } catch { /* ignore */ }
    } else {
      setAddress(prev => ({
        ...prev,
        firstName: profile?.first_name ?? prev.firstName,
        lastName:  profile?.last_name  ?? prev.lastName,
        email: user?.email || prev.email,
      }))
    }
  }, [profile, user])

  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0 && step === 1) {
      router.replace('/panier')
    }
  }, [isLoadingCart, cartItems.length, step])

  const set = (field: keyof Address) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress(prev => ({ ...prev, [field]: e.target.value }))

  const continueFromAddress = () => {
    const required: (keyof Address)[] = [
      'firstName', 'lastName', 'email',
      'address', 'postalCode', 'city', 'country', 'phone',
    ]
    const missing = required.some(k => !(address[k] ?? '').trim())
    if (missing) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (saveAddress) localStorage.setItem(ADDRESS_KEY, JSON.stringify(address))
    setStep(3)
  }

  const placeOrder = async () => {
    setIsSubmitting(true)
    try {
      const orderNumber = genOrderNumber()
      const items = cartItems.map(item => ({
        product_id:   String(item.id),
        product_name: item.name,
        artisan_name: item.artisan,
        quantity:     item.quantity,
        unit_price:   item.price,
        subtotal:     item.price * item.quantity,
        image:        item.images[0] ?? null,
      }))

      const { error } = await supabase.from('orders').insert({
        order_number:     orderNumber,
        user_id:          user?.id ?? null,
        customer_email:   address.email,
        customer_name:    `${address.firstName} ${address.lastName}`,
        status:           'pending',
        total_amount:     total,
        items,
        shipping_address: address,
      })
      if (error) throw error

      sessionStorage.setItem('lp_last_order', JSON.stringify({
        orderNumber,
        customerName:    `${address.firstName} ${address.lastName}`,
        customerEmail:   address.email,
        items,
        shippingAddress: address,
        subtotal:        cartTotal,
        shipping,
        total,
      }))

      await clearCart()
      router.push(`/confirmation?order=${orderNumber}`)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du paiement')
      setIsSubmitting(false)
    }
  }

  if (isLoadingCart) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8"
            style={{ fontFamily: 'Cinzel, serif' }}>
            Commande
          </h1>

          <StepIndicator current={step} />

          {/* ── Step 1: Cart ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={String(item.id)} className="flex gap-4 bg-card border border-border rounded-2xl p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder-pot.jpg' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.artisan}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{fmtXOF(item.price)} / pièce</p>
                        </div>
                        <p className="font-bold text-foreground shrink-0">{fmtXOF(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <QtyControl
                          value={item.quantity}
                          onDec={() => updateQuantity(item.id, item.quantity - 1)}
                          onInc={() => updateQuantity(item.id, item.quantity + 1)}
                        />
                        <button onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total ({cartCount} article{cartCount > 1 ? 's' : ''})</span>
                  <span className="font-medium text-foreground">{fmtXOF(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  {shipping === 0
                    ? <span className="text-green-500 font-medium">Offerte</span>
                    : <span className="font-medium text-foreground">{fmtXOF(shipping)}</span>}
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                    Livraison offerte dès {fmtXOF(SHIPPING_THRESHOLD)}
                  </p>
                )}
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{fmtXOF(total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link href="/panier" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au panier
                </Link>
                <Button onClick={() => setStep(2)} size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2">
                  Continuer
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Delivery ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-5" style={{ fontFamily: 'Cinzel, serif' }}>
                  Adresse de livraison
                </h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Prénom *">
                      <Input value={address.firstName} onChange={set('firstName')} placeholder="ex: Zakary" className="bg-background border-border" />
                    </Field>
                    <Field label="Nom *">
                      <Input value={address.lastName} onChange={set('lastName')} placeholder="ex: Bamba" className="bg-background border-border" />
                    </Field>
                  </div>
                  <Field label="Adresse e-mail *">
                    <Input type="email" value={address.email} onChange={set('email')}
                      placeholder="ex: zakary@email.com" readOnly={!!user?.email}
                      className={`bg-background border-border ${user?.email ? 'opacity-60 cursor-default' : ''}`} />
                  </Field>
                  <Field label="Adresse complète *">
                    <Input value={address.address} onChange={set('address')} placeholder="ex: 12 rue de la Paix" className="bg-background border-border" />
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Code postal *">
                      <Input value={address.postalCode} onChange={set('postalCode')} placeholder="ex: 01 BP 1234" className="bg-background border-border" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Ville *">
                        <Input value={address.city} onChange={set('city')} placeholder="ex: Abidjan" className="bg-background border-border" />
                      </Field>
                    </div>
                  </div>
                  <Field label="Pays *">
                    <Input value={address.country} onChange={set('country')} placeholder="ex: Côte d'Ivoire" className="bg-background border-border" />
                  </Field>
                  <Field label="Téléphone *">
                    <Input type="tel" value={address.phone} onChange={set('phone')} placeholder="ex: +225 07 00 00 00" className="bg-background border-border" />
                  </Field>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                    <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                    <span className="text-sm text-muted-foreground">Sauvegarder pour mes prochaines commandes</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
                <Button onClick={continueFromAddress} size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2">
                  Continuer
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Recap ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h2 className="font-bold text-foreground">Articles ({cartCount})</h2>
                </div>
                <div className="divide-y divide-border">
                  {cartItems.map(item => (
                    <div key={String(item.id)} className="flex items-center gap-3 p-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = '/placeholder-pot.jpg' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × {fmtXOF(item.price)}</p>
                      </div>
                      <p className="font-semibold text-foreground shrink-0">{fmtXOF(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h2 className="font-bold text-foreground">Livraison</h2>
                  <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">
                    Modifier
                  </button>
                </div>
                <div className="p-5 text-sm space-y-0.5">
                  <p className="font-semibold text-foreground">{address.firstName} {address.lastName}</p>
                  <p className="text-muted-foreground">{address.address}</p>
                  <p className="text-muted-foreground">{address.postalCode} {address.city}</p>
                  <p className="text-muted-foreground">{address.country}</p>
                  <p className="text-muted-foreground pt-1">{address.phone}</p>
                  <p className="text-muted-foreground">{address.email}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium text-foreground">{fmtXOF(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  {shipping === 0
                    ? <span className="text-green-500 font-medium">Offerts</span>
                    : <span className="font-medium text-foreground">{fmtXOF(shipping)}</span>}
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Total TTC</span>
                  <span className="text-xl font-bold text-primary">{fmtXOF(total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
                <Button onClick={() => setStep(4)} size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2">
                  Confirmer et payer
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Payment ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CreditCard className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                      Paiement sécurisé
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votre commande sera traitée après confirmation du paiement
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="text-foreground">{fmtXOF(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="text-foreground">{shipping === 0 ? 'Offerte' : fmtXOF(shipping)}</span>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between font-bold">
                    <span className="text-foreground">Total à payer</span>
                    <span className="text-primary text-xl">{fmtXOF(total)}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3 space-y-0.5">
                  <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Livrer à</p>
                  <p className="font-semibold text-foreground">{address.firstName} {address.lastName}</p>
                  <p>{address.address}, {address.postalCode} {address.city}</p>
                </div>

                <Button onClick={placeOrder} disabled={isSubmitting} size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-none h-12 text-base gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Traitement en cours…
                    </>
                  ) : 'Payer avec Anka Pay'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  En confirmant, vous acceptez nos{' '}
                  <Link href="/cgv" className="underline hover:text-foreground">conditions générales de vente</Link>
                </p>
              </div>

              <div className="flex justify-start">
                <button onClick={() => setStep(3)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au récapitulatif
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  )
}
