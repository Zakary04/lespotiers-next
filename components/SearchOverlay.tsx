'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { products } from '@/data/products';
import { artisans } from '@/data/artisans';

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Lock body scroll and focus input on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, []);

  // Escape key closes overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const productResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.artisan.toLowerCase().includes(q) ||
      p.description.fr.poetic.toLowerCase().includes(q) ||
      p.description.fr.technical.toLowerCase().includes(q) ||
      p.description.en.poetic.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const artisanResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return artisans.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      (a.shortBio || '').toLowerCase().includes(q)
    ).slice(0, 3);
  }, [query]);

  // Flat list for keyboard navigation
  const allResults = [
    ...productResults.map(p => ({ type: 'product' as const, item: p, href: `/produit/${p.id}` })),
    ...artisanResults.map(a => ({ type: 'artisan' as const, item: a, href: `/potiers/${a.slug || a.id}` })),
  ];

  // Reset focused item whenever query changes
  useEffect(() => setFocusedIndex(-1), [query]);

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, -1));
      if (focusedIndex === 0) inputRef.current?.focus();
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      navigate(allResults[focusedIndex].href);
    }
  };

  const hasResults = productResults.length > 0 || artisanResults.length > 0;
  const showEmpty = query.trim().length >= 2 && !hasResults;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="mx-auto mt-16 md:mt-24 px-4 max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">

          {/* Input row */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher produits, artisans…"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none min-w-0"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150 shrink-0"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="shrink-0 ml-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 font-mono transition-colors duration-150"
              aria-label="Fermer"
            >
              Esc
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">

            {query.trim().length < 2 && (
              <p className="text-center text-sm text-muted-foreground py-10">
                Commencez à taper pour rechercher…
              </p>
            )}

            {showEmpty && (
              <p className="text-center text-sm text-muted-foreground py-10">
                Aucun résultat pour{' '}
                <span className="text-foreground font-medium">«&nbsp;{query.trim()}&nbsp;»</span>
              </p>
            )}

            {productResults.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2 px-2">
                  Produits
                </p>
                {productResults.map((product, i) => {
                  const idx = i;
                  return (
                    <button
                      key={String(product.id)}
                      onClick={() => navigate(`/produit/${product.id}`)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-colors duration-100 ${
                        focusedIndex === idx ? 'bg-muted' : 'hover:bg-muted/60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.artisan}</p>
                      </div>
                      <p className="text-sm font-bold text-primary shrink-0">€{product.price}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {artisanResults.length > 0 && (
              <div className={`p-3 ${productResults.length > 0 ? 'border-t border-border' : ''}`}>
                <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2 px-2">
                  Artisans
                </p>
                {artisanResults.map((artisan, i) => {
                  const idx = productResults.length + i;
                  return (
                    <button
                      key={artisan.id}
                      onClick={() => navigate(`/potiers/${artisan.slug || artisan.id}`)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-colors duration-100 ${
                        focusedIndex === idx ? 'bg-muted' : 'hover:bg-muted/60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                        <img
                          src={artisan.portraitImage}
                          alt={artisan.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{artisan.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{artisan.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
