import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code    = searchParams.get('code')
  const forFlow = searchParams.get('for') // e.g. 'password-reset', 'signup'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // Collect cookies Supabase sets during code exchange
  const pending: { name: string; value: string; options: CookieOptions }[] = []
  const pendingHeaders: Record<string, string> = {}

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list, headers) {
          list.forEach((c) => pending.push(c))
          if (headers) Object.assign(pendingHeaders, headers)
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  // Route to the appropriate page after successful code exchange
  const dest = forFlow === 'password-reset'
    ? `${origin}/auth/update-password`
    : `${origin}/dashboard`

  const response = NextResponse.redirect(dest)

  // Attach session cookies and cache-control headers onto the redirect response
  for (const { name, value, options } of pending) {
    response.cookies.set(name, value, options)
  }
  for (const [key, value] of Object.entries(pendingHeaders)) {
    response.headers.set(key, value)
  }

  return response
}
