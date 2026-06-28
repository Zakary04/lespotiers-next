'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/data/products';
import type { Artisan } from '@/data/artisans';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { fmtXOF } from '@/lib/utils/currency';

interface Props {
  product: Product;
  artisan: Artisan | null;
  relatedProducts: Product[];
}

export default function ProductPageClient({ product, artisan, relatedProducts }: Props) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const description = product.description?.[language] ?? product.description?.fr;
  const stock = product.stock;
  const outOfStock = stock === 0;

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/boutique">
          <Button variant="ghost" className="mb-6 group text-foreground hover:bg-muted min-h-[44px]">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            {t.product.backToShop}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-12 md:mb-20">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-border mb-3 bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${outOfStock ? 'grayscale' : ''}`}
              />
              {stock !== undefined && stock <= 5 && (
                stock === 0 ? (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[hsl(var(--muted-foreground))]">
                    Épuisé
                  </div>
                ) : stock === 1 ? (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: '#C0392B' }}>
                    Dernière pièce !
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: '#E07B39' }}>
                    Presque épuisé
                  </div>
                )
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden transition-all duration-200 border min-h-[64px] ${
                      selectedImage === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border opacity-60 hover:opacity-100 hover:border-foreground/30'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover bg-muted"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-start lg:justify-center"
          >
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground"
              style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}
            >
              {product.name}
            </h1>

            {artisan && (
              <Link href={`/potiers/${artisan.slug}`}>
                <p className="text-base text-primary hover:underline mb-5 font-medium">
                  {t.product.by} {product.artisan}
                </p>
              </Link>
            )}

            <p className="text-3xl md:text-4xl font-bold text-primary mb-6">{fmtXOF(product.price)}</p>

            <div className="mb-6">
              <h2 className="text-base font-semibold mb-3 text-foreground">{t.product.description}</h2>
              <p className="text-base leading-relaxed text-foreground mb-3">{description?.poetic}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{description?.technical}</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 mb-6 p-4 bg-muted border border-border rounded-xl text-sm">
              <div>
                <span className="font-semibold text-foreground">{t.product.dimensions}: </span>
                <span className="text-muted-foreground">{product.dimensions}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">{t.product.materials}: </span>
                <span className="text-muted-foreground">{product.materials}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">{t.product.techniques}: </span>
                <span className="text-muted-foreground">{product.techniques}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className={`flex items-center border border-border rounded-xl overflow-hidden bg-muted shrink-0 ${outOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-14 flex items-center justify-center text-foreground hover:bg-background transition-colors duration-200"
                  aria-label="Diminuer"
                  disabled={outOfStock}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 h-14 flex items-center justify-center text-foreground font-semibold border-x border-border text-base">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-14 flex items-center justify-center text-foreground hover:bg-background transition-colors duration-200"
                  aria-label="Augmenter"
                  disabled={outOfStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                onClick={() => addToCart(product, quantity)}
                disabled={outOfStock}
                className="flex-1 h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {outOfStock ? 'Indisponible' : t.product.addToCart}
              </Button>
            </div>
          </motion.div>
        </div>

        {artisan && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12 md:mb-20 p-6 md:p-8 bg-card border border-border rounded-2xl"
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={artisan.portraitImage || artisan.image}
                alt={artisan.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-1">Artisan</p>
                <h3
                  className="text-xl font-bold text-foreground mb-1"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {artisan.name}
                </h3>
                <p className="text-sm text-primary font-medium mb-3">{artisan.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {artisan.shortBio || artisan.bio}
                </p>
                <Link
                  href={`/potiers/${artisan.slug}`}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline font-medium"
                >
                  Voir tous ses travaux →
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold mb-8 text-foreground"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {t.product.otherWorks}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
              {relatedProducts.map((p, index) => (
                <ProductCard key={String(p.id)} product={p} index={index} />
              ))}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}
