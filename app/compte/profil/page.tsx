'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function ProfilPage() {
  const { user, profile } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    document.title = 'Mon profil - Les Potiers de Tanou-Sakassou'
  }, [])

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '')
      setLastName(profile.last_name ?? '')
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName.trim(), last_name: lastName.trim() })
      .eq('id', user.id)

    if (error) {
      toast.error('Erreur lors de la sauvegarde.')
    } else {
      toast.success('Profil mis à jour.')
    }
    setIsSaving(false)
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
            Mon profil
          </h1>

          <div className="bg-card border border-border rounded-2xl p-8">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold mb-2 text-foreground">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="bg-background border-border focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold mb-2 text-foreground">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    className="bg-background border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Adresse email
                </label>
                <Input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="bg-muted border-border text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {"L'email ne peut pas être modifié ici."}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-none"
                >
                  {isSaving ? 'Sauvegarde…' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
