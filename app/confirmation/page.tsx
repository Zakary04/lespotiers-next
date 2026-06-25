'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface OrderItem {
  product_name: string
  artisan_name: string
  quantity: number
  unit_price: number
  subtotal: number
  image: string | null
}

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
}

interface OrderData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  subtotal: number
  shipping: number
  total: number
}

function ConfirmationContent() {
  const params      = useSearchParams()
  const orderNumber = params.get('order') ?? ''
  const [order, setOrder] = useState<OrderData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('lp_last_order')
    if (stored) {
      try {
        setOrder(JSON.parse(stored))
        sessionStorage.removeItem('lp_last_order')
      } catch { /* ignore */ }
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">

      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2"
          style={{ fontFamily: 'Cinzel, serif' }}>
          Merci pour votre commande !
        </h1>
        {orderNumber && (
          <p className="text-muted-foreground">
            Numéro de commande :{' '}
            <span className="font-mono font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
              {orderNumber}
            </span>
          </p>
        )}
        {order && (
          <p className="text-sm text-muted-foreground mt-2">
            Un email de confirmation sera envoyé à{' '}
            <span className="font-medium text-foreground">{order.customerEmail}</span>
          </p>
        )}
      </div>

      {order ? (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="font-bold text-foreground">Articles commandés</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder-pot.jpg' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {item.unit_price.toFixed(2)} € — par {item.artisan_name}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground shrink-0">{item.subtotal.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="font-bold text-foreground">Adresse de livraison</h2>
            </div>
            <div className="p-5 text-sm space-y-0.5">
              <p className="font-semibold text-foreground">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.address}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              <p className="text-muted-foreground pt-1">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium text-foreground">{order.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              {order.shipping === 0
                ? <span className="text-green-500 font-medium">Offerte</span>
                : <span className="font-medium text-foreground">{order.shipping.toFixed(2)} €</span>}
            </div>
            <Separator className="bg-border" />
            <div className="flex justify-between">
              <span className="font-bold text-foreground">Total payé</span>
              <span className="text-xl font-bold text-primary">{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">Votre commande a bien été enregistrée. Les détails seront disponibles dans votre espace client.</p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link href="/boutique">
          <Button size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2">
            <ShoppingBag className="h-4 w-4" />
            Retour à la boutique
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32 pb-24">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </div>
      <Footer />
    </>
  )
}
