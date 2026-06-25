'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ArtisanForm from '@/components/admin/ArtisanForm'
import { createClient } from '@/lib/supabase/client'

export default function EditArtisanPage({ params }: { params: { id: string } }) {
  const [artisan, setArtisan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('artisans')
      .select('*')
      .eq('id', Number(params.id))
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true)
        else setArtisan(data)
        setLoading(false)
      })
  }, [params.id])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/artisans" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Retour aux artisans
        </Link>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Modifier l'artisan
        </h1>
        {artisan && <p className="text-sm text-muted-foreground mt-1">{artisan.name}</p>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notFound ? (
        <p className="text-muted-foreground">Artisan introuvable.</p>
      ) : (
        <ArtisanForm artisan={artisan} />
      )}
    </div>
  )
}
