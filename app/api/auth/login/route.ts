import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  // Collect all cookies Supabase wants to set
  const cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.push(...cookies)
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
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const redirectTo = profile?.role === 'admin' ? '/admin' : '/dashboard'

  // Return JSON with redirectTo — client will do window.location.href
  const response = NextResponse.json({ redirectTo })

  // Explicitly attach every Supabase session cookie to the response
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, (options as Parameters<typeof response.cookies.set>[2]) ?? {})
  })

  return response
}
