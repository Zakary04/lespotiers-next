'use client'

import React, { useEffect, useState } from 'react'
import { Save, Home, BookOpen, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

type Tab = 'accueil' | 'histoire' | 'contact'

type HomeForm  = { titleFr: string; titleEn: string; subtitleFr: string; subtitleEn: string; storyFr: string; storyEn: string }
type AboutForm = { titleFr: string; titleEn: string; textFr: string; textEn: string }
type ContactForm = { address: string; email: string; phone: string }

async function uploadSiteImage(file: File, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return null
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

function resolveImage(imgs: (File | string)[]): { file: File | null; url: string } {
  if (!imgs.length) return { file: null, url: '' }
  return imgs[0] instanceof File ? { file: imgs[0], url: '' } : { file: null, url: imgs[0] as string }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'accueil',  label: 'Accueil',        icon: Home },
  { id: 'histoire', label: 'Notre Histoire',  icon: BookOpen },
  { id: 'contact',  label: 'Contact',         icon: Phone },
]

const HERO_FALLBACK  = 'https://images.unsplash.com/photo-1563468069504-4bb77fa253a1'
const COVER_FALLBACK = 'https://images.unsplash.com/photo-1685828436575-6c3b5ad01e73'

export default function AdminContenuPage() {
  const supabase = createClient()
  const [tab,    setTab]    = useState<Tab>('accueil')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const [homeForm,    setHomeForm]    = useState<HomeForm>({ titleFr: '', titleEn: '', subtitleFr: '', subtitleEn: '', storyFr: '', storyEn: '' })
  const [heroImages,  setHeroImages]  = useState<(File | string)[]>([])
  const [aboutForm,   setAboutForm]   = useState<AboutForm>({ titleFr: '', titleEn: '', textFr: '', textEn: '' })
  const [coverImages, setCoverImages] = useState<(File | string)[]>([])
  const [contactForm, setContactForm] = useState<ContactForm>({ address: '', email: '', phone: '' })

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      const m: Record<string, string> = {}
      for (const row of data ?? []) if (row.value) m[row.key] = row.value

      setHomeForm({
        titleFr:    m.home_hero_title_fr    ?? '',
        titleEn:    m.home_hero_title_en    ?? '',
        subtitleFr: m.home_hero_subtitle_fr ?? '',
        subtitleEn: m.home_hero_subtitle_en ?? '',
        storyFr:    m.home_story_text_fr    ?? '',
        storyEn:    m.home_story_text_en    ?? '',
      })
      if (m.home_hero_bg_image) setHeroImages([m.home_hero_bg_image])

      setAboutForm({
        titleFr: m.about_title_fr ?? '',
        titleEn: m.about_title_en ?? '',
        textFr:  m.about_text_fr  ?? '',
        textEn:  m.about_text_en  ?? '',
      })
      if (m.about_cover_image) setCoverImages([m.about_cover_image])

      setContactForm({
        address: m.contact_address ?? '',
        email:   m.contact_email   ?? '',
        phone:   m.contact_phone   ?? '',
      })
      setLoaded(true)
    })
  }, [])

  const upsert = (entries: Record<string, string>) =>
    supabase.from('site_settings').upsert(
      Object.entries(entries).map(([key, value]) => ({ key, value })),
      { onConflict: 'key' }
    )

  const saveHome = async () => {
    setSaving(true)
    const { file, url } = resolveImage(heroImages)
    let bgUrl = url || HERO_FALLBACK
    if (file) {
      const uploaded = await uploadSiteImage(file, supabase)
      if (!uploaded) { toast.error("Erreur lors de l'upload"); setSaving(false); return }
      bgUrl = uploaded
      setHeroImages([uploaded])
    }
    await upsert({
      home_hero_title_fr:    homeForm.titleFr,
      home_hero_title_en:    homeForm.titleEn,
      home_hero_subtitle_fr: homeForm.subtitleFr,
      home_hero_subtitle_en: homeForm.subtitleEn,
      home_hero_bg_image:    bgUrl,
      home_story_text_fr:    homeForm.storyFr,
      home_story_text_en:    homeForm.storyEn,
    })
    toast.success("Page d'accueil mise à jour")
    setSaving(false)
  }

  const saveAbout = async () => {
    setSaving(true)
    const { file, url } = resolveImage(coverImages)
    let coverUrl = url || COVER_FALLBACK
    if (file) {
      const uploaded = await uploadSiteImage(file, supabase)
      if (!uploaded) { toast.error("Erreur lors de l'upload"); setSaving(false); return }
      coverUrl = uploaded
      setCoverImages([uploaded])
    }
    await upsert({
      about_title_fr:    aboutForm.titleFr,
      about_title_en:    aboutForm.titleEn,
      about_text_fr:     aboutForm.textFr,
      about_text_en:     aboutForm.textEn,
      about_cover_image: coverUrl,
    })
    toast.success('Page Notre Histoire mise à jour')
    setSaving(false)
  }

  const saveContact = async () => {
    setSaving(true)
    await upsert({
      contact_address: contactForm.address,
      contact_email:   contactForm.email,
      contact_phone:   contactForm.phone,
    })
    toast.success('Informations de contact mises à jour')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Contenu du site
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Modifiez les textes et images des pages publiques</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {!loaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── ACCUEIL ── */}
          {tab === 'accueil' && (
            <div className="space-y-5">
              <Card title="Hero — Titre">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Titre — Français">
                    <Input value={homeForm.titleFr} onChange={e => setHomeForm(f => ({ ...f, titleFr: e.target.value }))} className="bg-background border-border" placeholder="L'art de la terre…" />
                  </Field>
                  <Field label="Title — English">
                    <Input value={homeForm.titleEn} onChange={e => setHomeForm(f => ({ ...f, titleEn: e.target.value }))} className="bg-background border-border" placeholder="The art of earth…" />
                  </Field>
                </div>
              </Card>

              <Card title="Hero — Sous-titre">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Sous-titre — Français">
                    <Textarea value={homeForm.subtitleFr} onChange={e => setHomeForm(f => ({ ...f, subtitleFr: e.target.value }))} rows={3} className="bg-background border-border resize-none" />
                  </Field>
                  <Field label="Subtitle — English">
                    <Textarea value={homeForm.subtitleEn} onChange={e => setHomeForm(f => ({ ...f, subtitleEn: e.target.value }))} rows={3} className="bg-background border-border resize-none" />
                  </Field>
                </div>
              </Card>

              <Card title="Hero — Image de fond">
                <ImageUpload value={heroImages} onChange={setHeroImages} max={1} />
                <p className="text-xs text-muted-foreground mt-2">Recommandé : ≥ 1920 × 1080 px</p>
              </Card>

              <Card title='Section "Notre Histoire" (accueil)'>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Texte — Français">
                    <Textarea value={homeForm.storyFr} onChange={e => setHomeForm(f => ({ ...f, storyFr: e.target.value }))} rows={5} className="bg-background border-border resize-none" placeholder="Au cœur de la Côte d'Ivoire…" />
                  </Field>
                  <Field label="Text — English">
                    <Textarea value={homeForm.storyEn} onChange={e => setHomeForm(f => ({ ...f, storyEn: e.target.value }))} rows={5} className="bg-background border-border resize-none" placeholder="At the heart of Côte d'Ivoire…" />
                  </Field>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveHome} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-1.5">
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement…' : "Enregistrer l'accueil"}
                </Button>
              </div>
            </div>
          )}

          {/* ── NOTRE HISTOIRE ── */}
          {tab === 'histoire' && (
            <div className="space-y-5">
              <Card title="Titre principal">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Titre — Français">
                    <Input value={aboutForm.titleFr} onChange={e => setAboutForm(f => ({ ...f, titleFr: e.target.value }))} className="bg-background border-border" placeholder="Notre Histoire" />
                  </Field>
                  <Field label="Title — English">
                    <Input value={aboutForm.titleEn} onChange={e => setAboutForm(f => ({ ...f, titleEn: e.target.value }))} className="bg-background border-border" placeholder="Our Story" />
                  </Field>
                </div>
              </Card>

              <Card title="Texte principal">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Texte — Français">
                    <Textarea value={aboutForm.textFr} onChange={e => setAboutForm(f => ({ ...f, textFr: e.target.value }))} rows={8} className="bg-background border-border resize-none" />
                  </Field>
                  <Field label="Text — English">
                    <Textarea value={aboutForm.textEn} onChange={e => setAboutForm(f => ({ ...f, textEn: e.target.value }))} rows={8} className="bg-background border-border resize-none" />
                  </Field>
                </div>
              </Card>

              <Card title="Image de couverture">
                <ImageUpload value={coverImages} onChange={setCoverImages} max={1} />
                <p className="text-xs text-muted-foreground mt-2">Recommandé : ≥ 1200 × 800 px</p>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveAbout} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-1.5">
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement…' : 'Enregistrer Notre Histoire'}
                </Button>
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {tab === 'contact' && (
            <div className="space-y-5">
              <Card title="Informations de contact">
                <Field label="Adresse">
                  <Input value={contactForm.address} onChange={e => setContactForm(f => ({ ...f, address: e.target.value }))} className="bg-background border-border" placeholder="Tanou-Sakassou, Côte d'Ivoire" />
                </Field>
                <Field label="Adresse e-mail">
                  <Input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} className="bg-background border-border" placeholder="contact@lespotiers.ci" />
                </Field>
                <Field label="Téléphone">
                  <Input type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} className="bg-background border-border" placeholder="+225 00 00 00 00" />
                </Field>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveContact} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-1.5">
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement…' : 'Enregistrer le contact'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
