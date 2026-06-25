'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/client'

export default function EditProduitPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true)
        else setProduct(data)
        setLoading(false)
      })
  }, [params.id])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Modifier le produit
        </h1>
        {product && <p className="text-sm text-muted-foreground mt-1">{product.name}</p>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notFound ? (
        <p className="text-muted-foreground">Produit introuvable.</p>
      ) : (
        <ProductForm product={product} />
      )}
    </div>
  )
}
