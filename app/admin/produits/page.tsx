'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Plus, Search, Pencil, Archive, ArchiveRestore, Package, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { fmtXOF, toXOF } from '@/lib/utils/currency'

interface Row {
  id: string
  name: string
  artisan_name: string
  category: string
  price: number
  stock: number
  is_new: boolean
  is_archived: boolean
  images: string[]
  created_at: string
}

type CatMap = Record<string, string>

function storagePathFromUrl(url: string): string | null {
  const marker = '/product-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export default function AdminProduitsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [catMap, setCatMap] = useState<CatMap>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [confirmRow, setConfirmRow] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const [{ data: products }, { data: cats }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, artisan_name, category, price, stock, is_new, is_archived, images, created_at')
        .order('name'),
      supabase.from('categories').select('slug, label_fr'),
    ])
    setRows(products ?? [])
    const map: CatMap = {}
    for (const c of cats ?? []) map[c.slug] = c.label_fr
    setCatMap(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleArchive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_archived: !current }).eq('id', id)
    toast.success(current ? 'Produit restauré' : 'Produit archivé')
    setRows(prev => prev.map(r => r.id === id ? { ...r, is_archived: !current } : r))
  }

  const handleDelete = async () => {
    if (!confirmRow) return
    setDeleting(true)

    const paths = confirmRow.images.map(storagePathFromUrl).filter(Boolean) as string[]
    if (paths.length > 0) {
      const { error } = await supabase.storage.from('product-images').remove(paths)
      if (error) console.error('[deleteProduct] storage error:', error)
    }

    const { error } = await supabase.from('products').delete().eq('id', confirmRow.id)
    if (error) {
      toast.error(error.message)
      setDeleting(false)
      return
    }

    toast.success('Produit supprimé définitivement')
    setRows(prev => prev.filter(r => r.id !== confirmRow.id))
    setConfirmRow(null)
    setDeleting(false)
  }

  const exportProduits = () => {
    const exportRows = rows.map(r => ({
      'Nom du produit':  r.name,
      'Prix (FCFA)':     toXOF(r.price),
      'Stock':           r.stock ?? 0,
      'Catégorie':       catMap[r.category] ?? r.category,
      'Artisan':         r.artisan_name,
      'Nouveau':         r.is_new ? 'Oui' : 'Non',
      'Statut':          r.is_archived ? 'Archivé' : 'Actif',
      "Date d'ajout":    r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '',
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), 'Produits')
    XLSX.writeFile(wb, `produits-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const visible = rows.filter(r => {
    if (!showArchived && r.is_archived) return false
    const q = search.toLowerCase()
    return !q || r.name.toLowerCase().includes(q) || r.artisan_name.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">

      {/* Confirmation dialog */}
      {confirmRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-destructive/10 p-2.5 shrink-0">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-base">Supprimer définitivement</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement{' '}
                  <span className="font-medium text-foreground">«&nbsp;{confirmRow.name}&nbsp;»</span> ?
                  Cette action est irréversible.
                </p>
                {confirmRow.images.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {confirmRow.images.length} image{confirmRow.images.length > 1 ? 's' : ''} sera également supprimée{confirmRow.images.length > 1 ? 's' : ''} du stockage.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                className="border-border"
                onClick={() => setConfirmRow(null)}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                className="bg-destructive text-white hover:bg-destructive/90 gap-1.5"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>Produits</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.filter(r => !r.is_archived).length} produits actifs</p>
        </div>
        <Link href="/admin/produits/nouveau">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-none gap-1.5">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-9 bg-card border-border"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowArchived(v => !v)}
          className={`border-border gap-1.5 ${showArchived ? 'bg-muted' : ''}`}
        >
          <Archive className="h-3.5 w-3.5" />
          {showArchived ? 'Masquer archivés' : 'Voir archivés'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-border gap-1.5"
          onClick={exportProduits}
          disabled={rows.length === 0}
        >
          <Download className="h-3.5 w-3.5" />
          Exporter Excel
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Artisan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Catégorie</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Prix</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map(r => (
                  <tr key={r.id} className={`hover:bg-muted/30 transition-colors ${r.is_archived ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                          {r.images?.[0] && <img src={r.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{r.name}</p>
                          {r.is_new && <span className="text-[10px] font-bold text-primary">NOUVEAU</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.artisan_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {catMap[r.category] ?? r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{fmtXOF(r.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${(r.stock ?? 1) === 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {r.stock ?? 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.is_archived ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-500'}`}>
                        {r.is_archived ? 'Archivé' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/produits/${r.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${r.is_archived ? 'text-muted-foreground hover:text-green-500' : 'text-muted-foreground hover:text-destructive'}`}
                          onClick={() => toggleArchive(r.id, r.is_archived)}
                        >
                          {r.is_archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmRow(r)}
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {visible.map(r => (
              <div key={r.id} className={`flex gap-3 p-4 ${r.is_archived ? 'opacity-50' : ''}`}>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                  {r.images?.[0] && <img src={r.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.artisan_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-foreground">{fmtXOF(r.price)}</span>
                    <span className="text-xs text-muted-foreground">· Stock: {r.stock ?? 1}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/admin/produits/${r.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleArchive(r.id, r.is_archived)}>
                    {r.is_archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmRow(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
