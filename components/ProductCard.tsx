'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Product } from '@/data/products';
import { fmtXOF } from '@/lib/utils/currency';

interface ProductCardProps {
  product: Product;
  index?: number;
}

function StockIndicator({ stock }: { stock: number | undefined }) {
  if (stock === undefined || stock > 5) return null
  if (stock === 0) return (
    <p className="text-xs font-medium text-muted-foreground mt-1.5">Épuisé</p>
  )
  if (stock === 1) return (
    <p className="text-xs font-semibold mt-1.5 flex items-center gap-1 text-primary">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      Dernière pièce disponible !
    </p>
  )
  return (
    <p className="text-xs font-medium mt-1.5 text-accent">Plus que quelques pièces</p>
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
          {product.isNew && !outOfStock && (
            <div className="absolute top-4 right-4 z-10 bg-accent text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
              {t.home.newBadge}
            </div>
          )}
          {outOfStock && (
            <div className="absolute top-4 right-4 z-10 bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium tracking-wide">
              Épuisé
            </div>
          )}
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
            <StockIndicator stock={product.stock} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
