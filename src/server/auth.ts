'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function signInWithGoogle(next: string): Promise<void> {
  const supabase = await createSupabaseServer()
  const h = await headers()
  const origin = h.get('origin') ?? `https://${h.get('host')}`
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  })
  if (error || !data.url) throw new Error(error?.message ?? 'Google sign-in unavailable')
  redirect(data.url)
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  redirect('/')
}
