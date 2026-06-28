import { supabase } from '@/lib/supabase'

export interface Category {
  id: number
  slug: string
  label_fr: string
  label_en: string
  created_at: string
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('label_fr')
    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}
