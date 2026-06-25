'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Row {
  id: number
  slug: string
  name: string
  title: string
  specialties: string[]
  portrait_image: string
  years_experience: number | null
  location: string | null
}

export default function AdminArtisansPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('artisans')
      .select('id, slug, name, title, specialties, portrait_image, years_experience, location')
      .order('name')
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>Artisans</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.length} artisan{rows.length !== 1 ? 's' : ''} enregistré{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/artisans/nouveau">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvel artisan
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <Hammer className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Aucun artisan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5 flex gap-4 hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                {r.portrait_image && (
                  <img src={r.portrait_image} alt={r.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.title}</p>
                    {r.location && <p className="text-xs text-muted-foreground mt-0.5">{r.location}</p>}
                  </div>
                  <Link href={`/admin/artisans/${r.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
                {r.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
