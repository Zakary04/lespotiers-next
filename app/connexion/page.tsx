'use client'

import React, { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

function ConnexionForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/compte'
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Email ou mot de passe incorrect.')
      setIsLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    toast.success('Connexion réussie !')

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else if (profile?.role === 'artisan') {
      router.push('/artisan/tableau-de-bord')
    } else {
      router.push(redirectTo)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <LogIn className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
          Connexion
        </h1>
        <p className="text-muted-foreground mt-2">Accédez à votre espace personnel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2 text-foreground">
            Adresse email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="ex: zakary@email.com"
            className="bg-background border-border focus-visible:ring-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Mot de passe
            </label>
            <Link href="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-background border-border focus-visible:ring-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-none mt-2"
        >
          {isLoading ? 'Connexion en cours…' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="text-primary font-semibold hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

export default function ConnexionPage() {
  useEffect(() => {
    document.title = 'Connexion - Les Potiers de Tanou-Sakassou'
  }, [])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-32 pb-24 flex items-center">
        <div className="w-full max-w-md mx-auto px-4">
          <Suspense>
            <ConnexionForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  )
}
