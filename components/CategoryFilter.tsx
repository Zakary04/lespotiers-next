'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryOption {
  slug: string;
  label: string;
}

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  categories: CategoryOption[];
}

export default function CategoryFilter({ selected, onSelect, categories }: CategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <button
        onClick={() => onSelect('all')}
        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
          selected === 'all'
            ? 'bg-primary text-primary-foreground font-medium'
            : 'bg-muted text-foreground hover:bg-muted/80'
        }`}
      >
        {t.shop.allCategories}
      </button>
      {categories.map(({ slug, label }) => (
        <button
          key={slug}
          onClick={() => onSelect(slug)}
          className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
            selected === slug
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
