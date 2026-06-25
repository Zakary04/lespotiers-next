'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'

export default function NouveauProduitPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Nouveau produit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ajouter une nouvelle création au catalogue</p>
      </div>
      <ProductForm />
    </div>
  )
}
