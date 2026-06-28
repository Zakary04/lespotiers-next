'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Product } from '@/data/products';
import { fmtXOF } from '@/lib/utils/currency';

interface ProductCardProps {
  product: Product;
  index?: number;
}

function StockBadge({ stock }: { stock: number | undefined }) {
  if (stock === undefined || stock > 5) return null
  if (stock === 0) return (
    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-[hsl(var(--muted-foreground))]">
      Épuisé
    </div>
  )
  if (stock === 1) return (
    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: '#C0392B' }}>
      Dernière pièce !
    </div>
  )
  return (
    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: '#E07B39' }}>
      Presque épuisé
    </div>
  )
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useLanguage();
  const outOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/produit/${product.id}`}>
        <div className={`group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${outOfStock ? 'opacity-70' : ''}`}>
          {product.isNew && (
            <div className="absolute top-3 left-3 z-10 bg-accent text-white px-2.5 py-1 rounded-full text-xs font-medium tracking-wide">
              {t.home.newBadge}
            </div>
          )}
          <StockBadge stock={product.stock} />
          <div className="product-image-container aspect-square">
            <img
              src={product.images[0]}
              alt={product.name}
              className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 ${outOfStock ? 'grayscale' : ''}`}
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2 text-foreground" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t.product.by} {product.artisan}
            </p>
            <p className="text-2xl font-bold text-primary">{fmtXOF(product.price)}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
