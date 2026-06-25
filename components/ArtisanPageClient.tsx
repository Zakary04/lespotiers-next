'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import type { Artisan } from '@/data/artisans';
import type { Product } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  artisan: Artisan;
  products: Product[];
}

export default function ArtisanPageClient({ artisan, products }: Props) {
  const { t } = useLanguage();

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/potiers">
          <Button variant="ghost" className="mb-6 group text-foreground min-h-[44px]">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            {t.potiers.backToPotiers}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl aspect-square lg:aspect-auto">
            <img src={artisan.portraitImage || artisan.image} alt={artisan.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground" style={{ fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.02em' }}>
              {artisan.name}
            </h1>
            <p className="text-lg text-primary font-medium mb-2">{artisan.title}</p>
            <p className="text-base text-muted-foreground mb-6">
              {artisan.experience || `${artisan.yearsExperience} ans d'expérience`}
            </p>
            <p className="text-base leading-relaxed text-foreground">{artisan.shortBio || artisan.bio}</p>
          </div>
        </motion.div>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-foreground" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {t.potiers.biography}
          </h2>
          <div className="space-y-6 max-w-4xl">
            {artisan.biography?.map((paragraph, index) => (
              <p key={index} className="text-lg leading-relaxed text-foreground">{paragraph}</p>
            ))}
          </div>
        </section>

        {artisan.quote && (
          <section className="mb-20">
            <div className="bg-secondary text-secondary-foreground p-12 rounded-2xl max-w-4xl mx-auto relative shadow-sm">
              <Quote className="absolute top-8 left-8 h-12 w-12 opacity-20" />
              <p className="text-2xl leading-relaxed italic relative z-10" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {artisan.quote}
              </p>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {artisan.philosophy && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {t.potiers.philosophy}
              </h2>
              <p className="text-lg leading-relaxed text-foreground">{artisan.philosophy}</p>
            </div>
          )}
          {artisan.techniques && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {t.potiers.techniques}
              </h2>
              <p className="text-lg leading-relaxed text-foreground">{artisan.techniques}</p>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-12 text-foreground" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {t.potiers.works}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <ProductCard key={String(product.id)} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
