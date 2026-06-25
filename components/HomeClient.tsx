'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import ArtisanCard from '@/components/ArtisanCard';
import type { Product } from '@/data/products';
import type { Artisan } from '@/data/artisans';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  bestsellers: Product[];
  newProducts: Product[];
  artisans: Artisan[];
}

export default function HomeClient({ bestsellers, newProducts, artisans }: Props) {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1563468069504-4bb77fa253a1"
            alt="Potier au travail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}
          >
            {t.hero.tagline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto opacity-90"
          >
            {t.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/boutique">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 border-none">
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}>
              {t.home.bestsellers}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellers.map((product, index) => (
              <ProductCard key={String(product.id)} product={product} index={index} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/boutique">
              <Button variant="outline" size="lg" className="group">
                {t.common.viewAll}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Creations Section */}
      <section className="py-24 bg-secondary text-secondary-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}>
              {t.home.newCreations}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newProducts.map((product, index) => (
              <ProductCard key={String(product.id)} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Potiers Section */}
      <section className="py-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}>
              {t.home.potiersTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.home.potiersSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {artisans.map((artisan, index) => (
              <ArtisanCard key={artisan.id} artisan={artisan} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Village Story Section */}
      <section className="py-24 bg-muted text-muted-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}>
                {t.home.storyTitle}
              </h2>
              <p className="text-lg leading-relaxed mb-6">{t.home.storyText}</p>
              <Link href="/notre-histoire">
                <Button variant="default" size="lg" className="group bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                  {t.home.discoverMore}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img
                  src="https://images.unsplash.com/photo-1685828436575-6c3b5ad01e73"
                  alt="Village de Tanou-Sakassou"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
