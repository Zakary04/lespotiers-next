'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import ImageUpload from '@/components/admin/ImageUpload'
import { createClient } from '@/lib/supabase/client'

interface RawArtisan {
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

interface Props { artisan?: RawArtisan }

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function uploadPortrait(file: File, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `artisans/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return null
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

export default function ArtisanForm({ artisan }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!artisan

  const [portrait, setPortrait] = useState<(File | string)[]>(
    artisan?.portrait_image ? [artisan.portrait_image] : []
  )
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: artisan?.name ?? '',
    title: artisan?.title ?? '',
    location: artisan?.location ?? '',
    yearsExperience: String(artisan?.years_experience ?? ''),
    experience: artisan?.experience ?? '',
    shortBio: artisan?.short_bio ?? '',
    biography: (artisan?.biography ?? []).join('\n\n'),
    quote: artisan?.quote ?? '',
    philosophy: artisan?.philosophy ?? '',
    techniques: artisan?.techniques ?? '',
    specialties: (artisan?.specialties ?? []).join(', '),
  })

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Le nom est requis.'); return }

    setSaving(true)

    // Handle portrait
    let portraitUrl = artisan?.portrait_image ?? ''
    if (portrait.length > 0) {
      const img = portrait[0]
      if (img instanceof File) {
        const url = await uploadPortrait(img, supabase)
        if (!url) {
          toast.error('Échec upload photo. Vérifiez le bucket Supabase "product-images".')
          setSaving(false)
          return
        }
        portraitUrl = url
      } else {
        portraitUrl = img
      }
    }

    const slug = normalize(form.name)
    const payload = {
      slug,
      name: form.name.trim(),
      title: form.title.trim(),
      location: form.location || null,
      years_experience: form.yearsExperience ? parseInt(form.yearsExperience, 10) : null,
      experience: form.experience || null,
      short_bio: form.shortBio || null,
      biography: form.biography.split('\n\n').map(s => s.trim()).filter(Boolean),
      quote: form.quote || null,
      philosophy: form.philosophy,
      techniques: form.techniques,
      portrait_image: portraitUrl,
      specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean),
    }

    if (isEdit) {
      const { error } = await supabase.from('artisans').update(payload).eq('id', artisan!.id)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Artisan mis à jour')
    } else {
      const { error } = await supabase.from('artisans').insert(payload)
      if (error) { toast.error(error.message); setSaving(false); return }
      toast.success('Artisan créé')
    }

    router.push('/admin/artisans')
  }

  const field = (
    label: string,
    key: keyof typeof form,
    type: 'input' | 'textarea' = 'input',
    placeholder = '',
    rows = 3
  ) => (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-foreground">{label}</label>
      {type === 'textarea' ? (
        <Textarea
          value={form[key] as string}
          onChange={set(key)}
          placeholder={placeholder}
          rows={rows}
          className="bg-background border-border focus-visible:ring-primary resize-y"
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

      {/* Identity */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Identité</h2>
        {field('Nom complet *', 'name', 'input', 'Fulgence KOUASSI')}
        {field('Titre / Spécialité', 'title', 'input', 'Maître Potier')}
        <div className="grid grid-cols-2 gap-4">
          {field('Localisation', 'location', 'input', 'Tanou-Sakassou')}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Années d'expérience</label>
            <Input
              type="number"
              min="0"
              value={form.yearsExperience}
              onChange={set('yearsExperience')}
              placeholder="20"
              className="bg-background border-border focus-visible:ring-primary"
            />
          </div>
        </div>
        {field('Expérience (texte)', 'experience', 'input', '20 ans de maîtrise')}
        {field('Spécialités (séparées par virgule)', 'specialties', 'input', 'Vases, Poterie noire, Sculptures')}
      </section>

      {/* Biography */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Biographie</h2>
        {field('Résumé court', 'shortBio', 'textarea', 'En quelques mots...', 2)}
        {field('Biographie complète', 'biography', 'textarea', 'Paragraphe 1...\n\nParagraphe 2...\n\n(Séparez les paragraphes par une ligne vide)', 6)}
        {field('Citation', 'quote', 'input', '"La terre ne ment jamais..."')}
      </section>

      {/* Philosophy & techniques */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Philosophie & Techniques</h2>
        {field('Philosophie', 'philosophy', 'textarea', 'L\'argile comme langage...', 4)}
        {field('Techniques maîtrisées', 'techniques', 'textarea', 'Tournage, émaillage...', 3)}
      </section>

      {/* Portrait */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Photo de portrait</h2>
        <p className="text-xs text-muted-foreground">
          Utilise le bucket <code className="bg-muted px-1 rounded">product-images</code> (dossier artisans/).
        </p>
        <ImageUpload value={portrait} onChange={setPortrait} max={1} />
      </section>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? 'Enregistrer les modifications' : 'Créer l\'artisan'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/artisans')} className="text-muted-foreground">
          Annuler
        </Button>
      </div>
    </form>
  )
}
