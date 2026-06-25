'use client'

import React, { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
}

const ROLES = ['client', 'artisan', 'admin']

const ROLE_STYLE: Record<string, string> = {
  admin:   'bg-red-500/10 text-red-500',
  artisan: 'bg-primary/10 text-primary',
  client:  'bg-muted text-muted-foreground',
}

export default function AdminUtilisateursPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setProfiles(data ?? []); setLoading(false) })
  }, [])

  const changeRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p))
    toast.success('Rôle mis à jour')
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  const displayName = (p: Profile) =>
    p.first_name ? `${p.first_name} ${p.last_name ?? ''}`.trim() : p.email ?? p.id.slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">{profiles.length} compte{profiles.length !== 1 ? 's' : ''} enregistré{profiles.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">Aucun utilisateur</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscription</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {displayName(p)[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="font-medium text-foreground">{displayName(p)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.email ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.role}
                        onChange={e => changeRole(p.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${ROLE_STYLE[p.role] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {ROLES.map(r => <option key={r} value={r} className="bg-card text-foreground">{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {profiles.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {displayName(p)[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{displayName(p)}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email ?? '—'}</p>
                </div>
                <select
                  value={p.role}
                  onChange={e => changeRole(p.id, e.target.value)}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none shrink-0 ${ROLE_STYLE[p.role] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {ROLES.map(r => <option key={r} value={r} className="bg-card text-foreground">{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
