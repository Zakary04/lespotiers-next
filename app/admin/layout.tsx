import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export const metadata: Metadata = {
  title: 'Administration — Les Potiers de Tanou-Sakassou',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion?redirectTo=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/compte')

  const name = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user.email ?? ''

  return (
    <AdminShell userName={name} userEmail={user.email ?? ''}>
      {children}
    </AdminShell>
  )
}
