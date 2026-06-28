'use client'

import React, { useEffect, useState } from 'react'
import { Download, Pencil, Plus, Tag, Trash2, X, Check } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: number
  slug: string
  label_fr: string
  label_en: string
  created_at: string
  product_count?: number
}

interface FormState {
  slug: string
  label_fr: string
  label_en: string
}

const EMPTY: FormState = { slug: '', label_fr: '', label_en: '' }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY)
  const [deleting, setDeleting] = useState<number | null>(null)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data: cats } = await supabase
      .from('categories')
      .select('id, slug, label_fr, label_en, created_at')
      .order('label_fr')

    if (!cats) { setLoading(false); return }

    const { data: products } = await supabase
      .from('products')
      .select('category')

    const counts: Record<string, number> = {}
    for (const p of products ?? []) {
      counts[p.category] = (counts[p.category] ?? 0) + 1
    }

    setCategories(cats.map(c => ({ ...c, product_count: counts[c.slug] ?? 0 })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => {
        const next = { ...prev, [field]: e.target.value }
        if (field === 'label_fr' && !prev.slug) {
          next.slug = slugify(e.target.value)
        }
        return next
      })
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.slug || !form.label_fr || !form.label_en) {
      toast.error('Tous les champs sont requis')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('categories').insert({
      slug: form.slug,
      label_fr: form.label_fr,
      label_en: form.label_en,
    })
    if (error) {
      toast.error(error.message.includes('unique') ? 'Ce slug existe déjà' : error.message)
    } else {
      toast.success('Catégorie ajoutée')
      setForm(EMPTY)
      await load()
    }
    setSaving(false)
  }

  function startEdit(c: Category) {
    setEditId(c.id)
    setEditForm({ slug: c.slug, label_fr: c.label_fr, label_en: c.label_en })
  }

  function cancelEdit() {
    setEditId(null)
    setEditForm(EMPTY)
  }

  async function saveEdit(id: number) {
    if (!editForm.slug || !editForm.label_fr || !editForm.label_en) {
      toast.error('Tous les champs sont requis')
      return
    }
    const { error } = await supabase
      .from('categories')
      .update({ slug: editForm.slug, label_fr: editForm.label_fr, label_en: editForm.label_en })
      .eq('id', id)
    if (error) {
      toast.error(error.message.includes('unique') ? 'Ce slug existe déjà' : error.message)
    } else {
      toast.success('Catégorie mise à jour')
      cancelEdit()
      await load()
    }
  }

  async function handleDelete(c: Category) {
    if ((c.product_count ?? 0) > 0) {
      toast.error(`Impossible : ${c.product_count} produit(s) utilisent cette catégorie`)
      return
    }
    setDeleting(c.id)
    const { error } = await supabase.from('categories').delete().eq('id', c.id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Catégorie supprimée')
      await load()
    }
    setDeleting(null)
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        categories.map(c => ({
          'Slug':         c.slug,
          'Label FR':     c.label_fr,
          'Label EN':     c.label_en,
          'Nb produits':  c.product_count ?? 0,
          'Créé le':      new Date(c.created_at).toLocaleDateString('fr-FR'),
        }))
      ),
      'Catégories'
    )
    XLSX.writeFile(wb, `categories-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
            Catégories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-border gap-1.5 shrink-0"
          onClick={exportExcel}
          disabled={categories.length === 0}
        >
          <Download className="h-3.5 w-3.5" />
          Exporter Excel
        </Button>
      </div>

      {/* Add form */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" />
          Nouvelle catégorie
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <Input
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
              placeholder="ex: pottery-bowls"
              className="bg-background border-border text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Label FR</label>
            <Input
              value={form.label_fr}
              onChange={set('label_fr')}
              placeholder="ex: Bols"
              className="bg-background border-border text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Label EN</label>
            <Input
              value={form.label_en}
              onChange={e => setForm(prev => ({ ...prev, label_en: e.target.value }))}
              placeholder="ex: Bowls"
              className="bg-background border-border text-sm"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button
              type="submit"
              disabled={saving || !form.slug || !form.label_fr || !form.label_en}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Ajouter
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <Tag className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Aucune catégorie</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Label FR</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Label EN</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Produits</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    {editId === c.id ? (
                      <>
                        <td className="px-4 py-2">
                          <Input
                            value={editForm.slug}
                            onChange={e => setEditForm(p => ({ ...p, slug: slugify(e.target.value) }))}
                            className="h-8 text-xs bg-background border-border"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={editForm.label_fr}
                            onChange={e => setEditForm(p => ({ ...p, label_fr: e.target.value }))}
                            className="h-8 text-xs bg-background border-border"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={editForm.label_en}
                            onChange={e => setEditForm(p => ({ ...p, label_en: e.target.value }))}
                            className="h-8 text-xs bg-background border-border"
                          />
                        </td>
                        <td className="px-4 py-2 text-center text-muted-foreground text-xs">
                          {c.product_count ?? 0}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() => saveEdit(c.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={cancelEdit}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {c.slug}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{c.label_fr}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.label_en}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            (c.product_count ?? 0) > 0
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {c.product_count ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(c)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                (c.product_count ?? 0) > 0
                                  ? 'text-muted-foreground/30 cursor-not-allowed'
                                  : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              }`}
                              onClick={() => handleDelete(c)}
                              disabled={deleting === c.id || (c.product_count ?? 0) > 0}
                              title={(c.product_count ?? 0) > 0 ? `${c.product_count} produit(s) utilisent cette catégorie` : 'Supprimer'}
                            >
                              {deleting === c.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
