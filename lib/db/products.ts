import { supabase } from '@/lib/supabase'
import type { Product } from '@/data/products'

interface DbProduct {
  id: string
  slug: string | null
  name: string
  artisan_name: string
  artisan_id: number | null
  category: string
  price: number
  images: string[]
  description_fr_poetic: string | null
  description_fr_technical: string | null
  description_en_poetic: string | null
  description_en_technical: string | null
  dimensions: string | null
  materials: string | null
  techniques: string | null
  is_new: boolean
  is_archived: boolean
  stock: number
  features: string[] | null
}

function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: row.name,
    artisan: row.artisan_name,
    artisanId: row.artisan_id ?? 0,
    category: row.category,
    price: row.price,
    images: row.images,
    description: {
      fr: {
        poetic: row.description_fr_poetic ?? '',
        technical: row.description_fr_technical ?? '',
      },
      en: {
        poetic: row.description_en_poetic ?? '',
        technical: row.description_en_technical ?? '',
      },
    },
    dimensions: row.dimensions ?? '',
    materials: row.materials ?? '',
    techniques: row.techniques ?? '',
    isNew: row.is_new,
    stock: row.stock,
    features: row.features ?? undefined,
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toProduct)
  } catch {
    return []
  }
}

export async function getProductsBestsellers(limit = 6): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    return (data ?? []).map(toProduct)
  } catch {
    return []
  }
}

export async function getNewProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .eq('is_archived', false)
    if (error) throw error
    return (data ?? []).map(toProduct)
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data: bySlug } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_archived', false)
      .maybeSingle()
    if (bySlug) return toProduct(bySlug)

    const { data: byId } = await supabase
      .from('products')
      .select('*')
      .eq('id', slug)
      .eq('is_archived', false)
      .maybeSingle()
    return byId ? toProduct(byId) : null
  } catch {
    return null
  }
}

export async function getProductsByArtisanId(artisanId: number): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('artisan_id', artisanId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toProduct)
  } catch {
    return []
  }
}
