'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Product } from '@/data/products';
import type { Artisan } from '@/data/artisans';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORIES = ['vases', 'bowls', 'jars', 'decorative'];

interface Props {
  products: Product[];
  artisans: Artisan[];
}

export default function ShopClient({ products, artisans }: Props) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtisan, setSelectedArtisan] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter(product => {
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      const artisanMatch = selectedArtisan === 'all' || product.artisan === selectedArtisan;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      const searchMatch = !q ||
        product.name.toLowerCase().includes(q) ||
        product.artisan.toLowerCase().includes(q) ||
        product.description.fr.poetic.toLowerCase().includes(q) ||
        product.description.en.poetic.toLowerCase().includes(q) ||
        product.description.fr.technical.toLowerCase().includes(q);
      return categoryMatch && artisanMatch && priceMatch && searchMatch;
    });
  }, [products, selectedCategory, selectedArtisan, priceRange, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedArtisan('all');
    setPriceRange([0, 500]);
    setSearchQuery('');
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedArtisan !== 'all' ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 500 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const gridKey = `${selectedCategory}-${selectedArtisan}-${priceRange[0]}-${priceRange[1]}-${searchQuery}`;

  const filterPanelContent = (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs font-semibold mb-3 text-muted-foreground tracking-widest uppercase">Recherche</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Nom, artisan, description…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm bg-muted border border-transparent focus:border-border focus:outline-none text-foreground placeholder:text-muted-foreground min-h-[44px] transition-colors duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label="Effacer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold mb-3 text-muted-foreground tracking-widest uppercase">Catégorie</h4>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} categories={CATEGORIES} />
      </div>

      <div>
        <h4 className="text-xs font-semibold mb-3 text-muted-foreground tracking-widest uppercase">Artisan</h4>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedArtisan('all')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 min-h-[44px] ${
              selectedArtisan === 'all'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {t.shop.allArtisans}
          </button>
          {artisans.map(artisan => (
            <button
              key={artisan.id}
              onClick={() => setSelectedArtisan(artisan.name)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 min-h-[44px] ${
                selectedArtisan === artisan.name
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {artisan.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold mb-4 text-muted-foreground tracking-widest uppercase">{t.shop.priceRange}</h4>
        <PriceRangeSlider min={0} max={500} value={priceRange} onChange={setPriceRange} />
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full min-h-[44px] text-foreground border-border hover:bg-muted"
          onClick={resetFilters}
        >
          {t.shop.resetFilters}
        </Button>
      )}
    </div>
  );

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-background min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 md:mb-10">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '-0.02em' }}
          >
            {t.shop.title}
          </h1>
        </div>

        {/* ── Mobile sticky bar (unchanged) ── */}
        <div className="lg:hidden sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 min-h-[44px] border-border text-foreground hover:bg-muted shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t.shop.filters}
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto bg-background border-border">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                    {t.shop.filters}
                  </SheetTitle>
                </SheetHeader>
                {filterPanelContent}
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground flex-1">
              {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
            </p>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline min-h-[44px] shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Effacer
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans la boutique…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm bg-muted border border-transparent focus:border-border focus:outline-none text-foreground placeholder:text-muted-foreground min-h-[44px] transition-colors duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden lg:flex">

          {/*
           * Sidebar: animated width + marginRight grow together so the gap
           * between sidebar and grid never "pops" — they expand in sync.
           * overflow: clip (not hidden) clips the panel during the animation
           * without creating a scroll-container, so position: sticky still
           * anchors to the viewport scroll.
           */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.aside
                key="desktop-sidebar"
                initial={{ width: 0, marginRight: 0, opacity: 0 }}
                animate={{ width: 256, marginRight: 48, opacity: 1 }}
                exit={{ width: 0, marginRight: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'clip', flexShrink: 0 }}
              >
                <div className="w-64 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pr-2 pb-8 pt-1">
                  {filterPanelContent}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product grid column — expands to fill remaining width */}
          <div className="flex-1 min-w-0">

            {/* Desktop top bar: Filtres toggle + result count */}
            <div className="flex items-center gap-4 pt-4 pb-6">
              <Button
                variant="outline"
                onClick={() => setSidebarOpen(o => !o)}
                className="flex items-center gap-2 min-h-[44px] border-border text-foreground hover:bg-muted"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t.shop.filters}
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <span className="text-sm text-muted-foreground flex-1">
                {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
              </span>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <X className="h-3.5 w-3.5" />
                  Effacer
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div
                  key={gridKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-7"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={String(product.id)}
                      product={product}
                      index={Math.min(index, 8)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-24"
                >
                  <p className="text-xl text-muted-foreground mb-6">{t.shop.noProducts}</p>
                  <Button
                    variant="outline"
                    className="min-h-[44px] text-foreground border-border hover:bg-muted"
                    onClick={resetFilters}
                  >
                    {t.shop.resetFilters}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* ── Mobile product grid (below the sticky bar) ── */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <motion.div
                key={gridKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={String(product.id)}
                    product={product}
                    index={Math.min(index, 8)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center py-24"
              >
                <p className="text-xl text-muted-foreground mb-6">{t.shop.noProducts}</p>
                <Button
                  variant="outline"
                  className="min-h-[44px] text-foreground border-border hover:bg-muted"
                  onClick={resetFilters}
                >
                  {t.shop.resetFilters}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
