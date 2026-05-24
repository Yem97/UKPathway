import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Temporary diagnostic endpoint — remove before going live
export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  const supabaseCookies = allCookies.filter((c) => c.name.includes('supabase') || c.name.startsWith('sb-'))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } }    = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  return NextResponse.json({
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https:\/\/(.{6}).*/, 'https://$1...') ?? 'NOT SET',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isPlaceholder: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ?? true,
    },
    cookies: {
      total: allCookies.length,
      supabaseCount: supabaseCookies.length,
      supabaseNames: supabaseCookies.map((c) => c.name),
    },
    session: {
      exists: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      expiresAt: session?.expires_at ?? null,
    },
    user: {
      fromGetUser: !!user,
      email: user?.email ?? null,
    },
  })
}
