import { supabase } from '@/lib/supabase'
import type { Artisan } from '@/data/artisans'

interface DbArtisan {
  id: number
  slug: string
  name: string
  title: string
  experience: string | null
  years_experience: number | null
  short_bio: string | null
  biography: string[]
  philosophy: string
  techniques: string
  portrait_image: string
  quote: string | null
  specialties: string[]
  location: string | null
}

function toArtisan(row: DbArtisan): Artisan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    experience: row.experience ?? undefined,
    yearsExperience: row.years_experience ?? undefined,
    shortBio: row.short_bio ?? undefined,
    biography: row.biography,
    philosophy: row.philosophy,
    techniques: row.techniques,
    portraitImage: row.portrait_image,
    quote: row.quote ?? undefined,
    specialties: row.specialties,
    productIds: [],
    location: row.location ?? undefined,
  }
}

export async function getArtisans(): Promise<Artisan[]> {
  try {
    const { data, error } = await supabase
      .from('artisans')
      .select('*')
      .order('name')
    if (error) throw error
    return (data ?? []).map(toArtisan)
  } catch {
    return []
  }
}

export async function getArtisanBySlug(slug: string): Promise<Artisan | null> {
  try {
    const { data: bySlug } = await supabase
      .from('artisans')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (bySlug) return toArtisan(bySlug)

    const numId = parseInt(slug, 10)
    if (!isNaN(numId)) {
      const { data: byId } = await supabase
        .from('artisans')
        .select('*')
        .eq('id', numId)
        .maybeSingle()
      if (byId) return toArtisan(byId)
    }

    return null
  } catch {
    return null
  }
}
