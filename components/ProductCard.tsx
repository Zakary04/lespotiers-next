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

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/produit/${product.id}`}>
        <div className="group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          {product.isNew && (
            <div className="absolute top-4 right-4 z-10 bg-accent text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
              {t.home.newBadge}
            </div>
          )}
          <div className="product-image-container aspect-square">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
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
