'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'

export default function ComptePage() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    document.title = 'Mon compte - Les Potiers de Tanou-Sakassou'
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion?redirectTo=/compte')
    }
  }, [isLoading, user])

  const displayName =
    profile?.first_name
      ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
      : user?.email ?? ''

  const initials =
    profile?.first_name
      ? `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ''}`.toUpperCase()
      : (user?.email?.[0] ?? '?').toUpperCase()

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  const menuItems = [
    { icon: ShoppingBag, label: 'Mes commandes', description: 'Historique de vos achats', href: '/compte/commandes' },
    { icon: Heart, label: 'Mes favoris', description: 'Pièces sauvegardées', href: '/compte/favoris' },
    { icon: User, label: 'Mon profil', description: 'Informations personnelles', href: '/compte/profil' },
    { icon: Settings, label: 'Paramètres', description: 'Préférences et sécurité', href: '/compte/parametres' },
  ]

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary" style={{ fontFamily: 'Cinzel, serif' }}>
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                {displayName}
              </h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              {profile?.role && profile.role !== 'client' && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary capitalize">
                  {profile.role}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map(({ icon: Icon, label, description, href }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex items-center gap-4 p-6 bg-card border border-border rounded-2xl hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
              >
                <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>

          {profile?.role === 'admin' && (
            <div className="mt-6 p-6 bg-card border border-primary/30 rounded-2xl">
              <p className="font-semibold text-foreground mb-3">Administration</p>
              <Button
                onClick={() => router.push('/admin')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Tableau de bord admin
              </Button>
            </div>
          )}

          {profile?.role === 'artisan' && (
            <div className="mt-6 p-6 bg-card border border-primary/30 rounded-2xl">
              <p className="font-semibold text-foreground mb-3">Espace artisan</p>
              <Button
                onClick={() => router.push('/artisan/tableau-de-bord')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Mon tableau de bord
              </Button>
            </div>
          )}

          <div className="mt-8">
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive gap-2"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
