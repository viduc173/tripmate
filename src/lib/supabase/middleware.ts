import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'
import { supabaseEnv } from './env'

/** Refreshes the Supabase session cookie on the response that next-intl produced. */
export async function refreshSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const { url, key } = supabaseEnv()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  })
  await supabase.auth.getClaims()
  return response
}
