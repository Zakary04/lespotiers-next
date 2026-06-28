'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { fmtXOF, toXOF } from '@/lib/utils/currency';

const SHIPPING_THRESHOLD_EUR = 150
const SHIPPING_COST_EUR = 12.9

function QuantityControl({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
      <button
        onClick={onDecrement}
        className="px-3 py-2 hover:bg-muted transition-colors text-foreground disabled:opacity-40"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-4 py-2 text-sm font-semibold text-foreground min-w-[3rem] text-center border-x border-border">
        {value}
      </span>
      <button
        onClick={onIncrement}
        className="px-3 py-2 hover:bg-muted transition-colors text-foreground"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function PanierPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, isLoadingCart } = useCart();
  const router = useRouter();

  const shippingCost = cartTotal >= SHIPPING_THRESHOLD_EUR ? 0 : SHIPPING_COST_EUR;
  const total = cartTotal + shippingCost;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-4 mb-10">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuer mes achats
            </Link>
            <Separator orientation="vertical" className="h-4 bg-border" />
            <h1
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Mon panier
              {cartCount > 0 && (
                <span className="ml-3 text-base font-normal text-muted-foreground">
                  ({cartCount} article{cartCount > 1 ? 's' : ''})
                </span>
              )}
            </h1>
          </div>

          {isLoadingCart ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Votre panier est vide
              </h2>
              <p className="text-muted-foreground max-w-sm mb-8">
                Découvrez nos créations artisanales uniques et ajoutez vos coups de cœur.
              </p>
              <Link href="/boutique">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2">
                  <Package className="h-4 w-4" />
                  Découvrir la boutique
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => (
                  <div
                    key={String(item.id)}
                    className="flex gap-4 sm:gap-6 bg-card border border-border rounded-2xl p-4 sm:p-6"
                  >
                    <Link href={`/produit/${item.slug ?? item.id}`} className="shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted border border-border">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={e => { (e.target as HTMLImageElement).src = '/placeholder-pot.jpg'; }}
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/produit/${item.slug ?? item.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.artisan}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {fmtXOF(item.price)} / pièce
                          </p>
                        </div>

                        <div className="hidden sm:block text-right shrink-0">
                          <p className="font-bold text-foreground text-lg">
                            {fmtXOF(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                        <QuantityControl
                          value={item.quantity}
                          onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                          onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                        />

                        <div className="flex items-center gap-4">
                          <span className="sm:hidden font-bold text-foreground">
                            {fmtXOF(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                            aria-label="Retirer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Link
                  href="/boutique"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continuer mes achats
                </Link>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
                  <h2
                    className="text-xl font-bold text-foreground mb-6"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    Récapitulatif
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Sous-total ({cartCount} article{cartCount > 1 ? 's' : ''})
                      </span>
                      <span className="text-foreground font-medium">{fmtXOF(cartTotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison</span>
                      {shippingCost === 0 ? (
                        <span className="text-green-500 font-medium">Offerte</span>
                      ) : (
                        <span className="text-foreground font-medium">{fmtXOF(shippingCost)}</span>
                      )}
                    </div>

                    {shippingCost > 0 && (
                      <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                        Livraison offerte dès{' '}
                        <span className="font-semibold text-foreground">{fmtXOF(SHIPPING_THRESHOLD_EUR)}</span>
                        {' — '}il vous reste{' '}
                        <span className="font-semibold text-primary">
                          {fmtXOF(SHIPPING_THRESHOLD_EUR - cartTotal)}
                        </span>
                      </p>
                    )}
                  </div>

                  <Separator className="my-5 bg-border" />

                  <div className="flex justify-between items-baseline mb-6">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">{fmtXOF(total)}</span>
                  </div>

                  <Button
                    onClick={() => router.push('/checkout')}
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-none text-base"
                  >
                    Procéder au paiement
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Paiement sécurisé · Livraison suivie
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
