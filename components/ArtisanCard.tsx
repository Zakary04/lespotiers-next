'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Artisan } from '@/data/artisans';

interface ArtisanCardProps {
  artisan: Artisan;
  index?: number;
  productCount?: number;
}

export default function ArtisanCard({ artisan, index = 0, productCount }: ArtisanCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.08 }}
    >
      <Link href={`/potiers/${artisan.slug || artisan.id}`} className="group block">
        <div className="text-center">
          <div className="relative mb-5 mx-auto w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
            <img
              src={artisan.portraitImage}
              alt={artisan.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {productCount !== undefined && productCount > 0 && (
              <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {productCount} œuvre{productCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <h3
            className="text-xl md:text-2xl font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-200"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {artisan.name}
          </h3>
          <p className="text-sm text-primary font-medium mb-2">{artisan.title}</p>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto leading-relaxed line-clamp-2">
            {artisan.shortBio}
          </p>
          <div className="inline-flex items-center gap-1.5 text-sm text-primary font-medium group-hover:gap-3 transition-all duration-200">
            {t.potiers.readMore}
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
