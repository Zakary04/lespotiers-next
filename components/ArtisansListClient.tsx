'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ArtisanCard from '@/components/ArtisanCard';
import type { Artisan } from '@/data/artisans';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  artisans: Artisan[];
  productCounts: Record<number, number>;
}

export default function ArtisansListClient({ artisans, productCounts }: Props) {
  const { t } = useLanguage();

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-background transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}
          >
            {t.potiers.title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.potiers.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          {artisans.map((artisan, index) => (
            <ArtisanCard
              key={artisan.id}
              artisan={artisan}
              index={index}
              productCount={productCounts[artisan.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
