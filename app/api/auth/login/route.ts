import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin
  const formData = await request.formData()
  const email    = (formData.get('email')    as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return NextResponse.redirect(
      new URL('/login?error=Email+and+password+are+required', origin),
      { status: 303 }
    )
  }

  // Collect every Set-Cookie and response header Supabase wants to write
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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase().includes('email not confirmed')
      ? 'Please confirm your email before signing in.'
      : error.message.toLowerCase().includes('invalid login')
      ? 'Incorrect email or password.'
      : error.message
    console.error('[login] signInWithPassword error:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, origin),
      { status: 303 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const dest = profile?.role === 'admin' ? '/admin' : '/dashboard/apply'
  console.log(`[login] ${data.user.email} → ${dest} (${pending.length} cookies)`)

  // Build a 303 redirect — browser will follow it as a GET
  const response = NextResponse.redirect(new URL(dest, origin), { status: 303 })

  // Attach every Supabase session cookie onto the redirect response
  for (const { name, value, options } of pending) {
    response.cookies.set(name, value, options)
  }

  // Attach any cache-control headers Supabase wants us to set
  for (const [key, value] of Object.entries(pendingHeaders)) {
    response.headers.set(key, value)
  }

  return response
}
