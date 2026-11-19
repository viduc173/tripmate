import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/** Google OAuth returns here with ?code=…; exchange it for a session, then go to ?next (same-site paths only). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'
  if (code) {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/?auth_error=1`)
}
