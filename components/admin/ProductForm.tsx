'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'vases', label: 'Vases' },
  { value: 'bowls', label: 'Bols' },
  { value: 'jars', label: 'Jarres' },
  { value: 'decorative', label: 'Décoratifs' },
]

interface ArtisanOpt { id: number; name: string }

interface RawProduct {
  id: string
  name: string
  artisan_id: number | null
  artisan_name: string
  category: string
  price: number
  stock: number
  is_new: boolean
  images: string[]
  description_fr_poetic: string | null
  description_fr_technical: string | null
  description_en_poetic: string | null
  description_en_technical: string | null
  dimensions: string | null
  materials: string | null
  techniques: string | null
}

interface Props {
  product?: RawProduct
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function makeId(name: string, artisanName: string) {
  return `${normalize(name)}-${normalize(artisanName.split(/\s+/)[0])}`
}

async function uploadImage(file: File, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return null
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!product

  const [artisans, setArtisans] = useState<ArtisanOpt[]>([])
  const [images, setImages] = useState<(File | string)[]>(product?.images ?? [])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    artisanId: String(product?.artisan_id ?? ''),
    category: product?.category ?? 'vases',
    price: String(product?.price ?? ''),
    stock: String(product?.stock ?? '1'),
    isNew: product?.is_new ?? false,
    descFrPoetic: product?.description_fr_poetic ?? '',
    descFrTechnical: product?.description_fr_technical ?? '',
    descEnPoetic: product?.description_en_poetic ?? '',
    descEnTechnical: product?.description_en_technical ?? '',
    dimensions: product?.dimensions ?? '',
    materials: product?.materials ?? '',
    techniques: product?.techniques ?? '',
  })

  useEffect(() => {
    supabase.from('artisans').select('id, name').order('name').then(({ data }) => {
      setArtisans(data ?? [])
    })
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.artisanId || !form.price) {
      toast.error('Nom, artisan et prix sont requis.')
      return
    }

    setSaving(true)

    // Upload new images
    const imageUrls: string[] = []
    let uploadFailed = false
    for (const img of images) {
      if (typeof img === 'string') {
        imageUrls.push(img)
      } else {
        const url = await uploadImage(img, supabase)
        if (url) {
          imageUrls.push(url)
        } else {
          uploadFailed = true
          toast.error('Échec upload d\'une image. Vérifiez le bucket Supabase "product-images".')
          break
        }
      }
    }

    if (uploadFailed) { setSaving(false); return }

    const artisan = artisans.find(a => a.id === Number(form.artisanId))
    const payload = {
      name: form.name.trim(),
      artisan_id: Number(form.artisanId),
      artisan_name: artisan?.name ?? '',
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10) || 0,
      is_new: form.isNew,
      images: imageUrls,
      description_fr_poetic: form.descFrPoetic || null,
      description_fr_technical: form.descFrTechnical || null,
      description_en_poetic: form.descEnPoetic || null,
      description_en_technical: form.descEnTechnical || null,
      dimensions: form.dimensions || null,
      materials: form.materials || null,
      techniques: form.techniques || null,
    }

    if (isEdit) {
      const { error } = await supabase.from('products').update(payload).eq('id', product!.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Produit mis à jour')
    } else {
      const baseId = makeId(form.name, artisan?.name ?? 'artisan')
      const { data: existing } = await supabase.from('products').select('id').eq('id', baseId).maybeSingle()
      const id = existing ? `${baseId}-${Date.now().toString(36)}` : baseId
      const { error } = await supabase.from('products').insert({ id, slug: id, ...payload, is_archived: false })
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Produit créé')
    }

    router.push('/admin/produits')
  }

  const field = (label: string, key: keyof typeof form, type: 'input' | 'textarea' = 'input', placeholder = '') => (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-foreground">{label}</label>
      {type === 'textarea' ? (
        <Textarea
          value={form[key] as string}
          onChange={set(key)}
          placeholder={placeholder}
          rows={3}
          className="bg-background border-border focus-visible:ring-primary resize-none"
        />
      ) : (
        <Input
          type="text"
          value={form[key] as string}
          onChange={set(key)}
          placeholder={placeholder}
          className="bg-background border-border focus-visible:ring-primary"
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">

      {/* General */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Informations générales</h2>

        {field('Nom du produit *', 'name', 'input', 'Vase Totem...')}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Artisan *</label>
            <select
              value={form.artisanId}
              onChange={set('artisanId')}
              required
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner un artisan</option>
              {artisans.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Catégorie *</label>
            <select
              value={form.category}
              onChange={set('category')}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Prix (€) *</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              placeholder="185.00"
              required
              className="bg-background border-border focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Stock</label>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={set('stock')}
              placeholder="1"
              className="bg-background border-border focus-visible:ring-primary"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={e => setForm(p => ({ ...p, isNew: e.target.checked }))}
            className="w-4 h-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-medium text-foreground">Marquer comme "Nouveau"</span>
        </label>
      </section>

      {/* Descriptions FR */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Descriptions — Français</h2>
        {field('Description poétique', 'descFrPoetic', 'textarea', 'Texte évocateur...')}
        {field('Description technique', 'descFrTechnical', 'textarea', 'Fiche technique...')}
      </section>

      {/* Descriptions EN */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Descriptions — English</h2>
        {field('Poetic description', 'descEnPoetic', 'textarea', 'Evocative text...')}
        {field('Technical description', 'descEnTechnical', 'textarea', 'Technical details...')}
      </section>

      {/* Details */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Détails techniques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {field('Dimensions', 'dimensions', 'input', '35 cm H × 12 cm Ø')}
          {field('Matériaux', 'materials', 'input', 'Céramique noire...')}
          {field('Techniques', 'techniques', 'input', 'Tournage à la main...')}
        </div>
      </section>

      {/* Images */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Photos du produit</h2>
        <p className="text-xs text-muted-foreground">
          Nécessite le bucket Supabase Storage <code className="bg-muted px-1 rounded">product-images</code> (public).
        </p>
        <ImageUpload value={images} onChange={setImages} max={5} />
      </section>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/produits')}
          className="text-muted-foreground"
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
