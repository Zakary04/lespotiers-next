'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, KeyRound, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function ParametresPage() {
  const { user, signOut } = useAuth()
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    document.title = 'Paramètres - Les Potiers de Tanou-Sakassou'
  }, [])

  const handlePasswordReset = async () => {
    if (!user?.email) return
    setIsSendingReset(true)

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/compte/parametres`,
    })

    if (error) {
      toast.error("Erreur lors de l'envoi du lien.")
    } else {
      toast.success('Lien de réinitialisation envoyé par email.')
    }
    setIsSendingReset(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') {
      toast.error('Tapez SUPPRIMER pour confirmer.')
      return
    }
    toast.error("La suppression de compte nécessite une confirmation de l'administrateur.")
    setDeleteConfirm('')
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/compte"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Mon compte
          </Link>

          <h1
            className="text-3xl font-bold text-foreground mb-10"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Paramètres
          </h1>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-muted">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Mot de passe</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Recevez un lien de réinitialisation par email.
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                variant="outline"
                className="border-border"
              >
                {isSendingReset ? 'Envoi en cours…' : 'Changer le mot de passe'}
              </Button>
            </div>

            <div className="bg-card border border-destructive/30 rounded-2xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Supprimer le compte</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Cette action est irréversible. Tapez{' '}
                    <span className="font-mono font-semibold text-foreground">SUPPRIMER</span>{' '}
                    pour confirmer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="max-w-[200px] bg-background border-border focus-visible:ring-destructive font-mono"
                />
                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
