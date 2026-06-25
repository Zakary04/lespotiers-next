'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ArtisanForm from '@/components/admin/ArtisanForm'

export default function NouvelArtisanPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/artisans" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" />
          Retour aux artisans
        </Link>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Nouvel artisan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ajouter un artisan au collectif</p>
      </div>
      <ArtisanForm />
    </div>
  )
}
