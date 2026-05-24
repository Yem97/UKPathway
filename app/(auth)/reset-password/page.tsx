'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass =
    'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white'
  const labelClass = 'text-xs tracking-widest uppercase text-navy/50 block mb-2'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uk-pathway.vercel.app'}/auth/update-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-navy/5 flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-2xl text-navy">✓</span>
        </div>
        <h2 className="font-serif text-2xl text-navy mb-3">Check your inbox</h2>
        <p className="text-sm text-navy/60 font-light leading-relaxed mb-6">
          If an account exists for <strong>{email}</strong>, you will receive a
          password-reset link shortly.
        </p>
        <Link href="/login" className="text-sm text-navy underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy mb-2">Reset your password</h1>
      <p className="text-sm text-navy/60 mb-10">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 mt-2 disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-sm text-navy/60 mt-6 text-center">
        Remembered it?{' '}
        <Link href="/login" className="text-navy underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
