'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FavorisPage() {
  useEffect(() => {
    document.title = 'Mes favoris - Les Potiers de Tanou-Sakassou'
  }, [])

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/compte"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Mon compte
          </Link>

          <h1
            className="text-3xl font-bold text-foreground mb-10"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Mes favoris
          </h1>

          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aucun favori sauvegardé
            </h2>
            <p className="text-muted-foreground max-w-xs mb-8">
              Ajoutez des pièces à vos favoris pour les retrouver facilement.
            </p>
            <Link href="/boutique">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-none">
                Découvrir nos créations
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
