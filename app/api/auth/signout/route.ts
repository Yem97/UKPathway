import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin

  // Collect cookies Supabase clears on sign-out
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

  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/login', origin), { status: 303 })

  // Clear the session cookies on the redirect response
  for (const { name, value, options } of pending) {
    response.cookies.set(name, value, options)
  }
  for (const [key, value] of Object.entries(pendingHeaders)) {
    response.headers.set(key, value)
  }

  return response
}
