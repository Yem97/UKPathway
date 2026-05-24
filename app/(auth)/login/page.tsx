'use client'

import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import { loginUser } from '@/app/actions/auth'

function LoginForm() {
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginUser(formData)
      if (result?.error) setError(result.error)
    })
  }

  const inputClass = 'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white'
  const labelClass = 'text-xs tracking-widest uppercase text-navy/50 block mb-2'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Email Address</label>
        <input
          name="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
        <div className="flex justify-end mt-2">
          <Link href="/reset-password" className="text-xs text-navy/70 hover:text-navy underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full btn-primary py-3 mt-2 disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-navy mb-2">Welcome back</h1>
      <p className="text-sm text-navy mb-10">
        New here?{' '}
        <Link href="/signup" className="text-navy underline underline-offset-4 font-medium">
          Create an account
        </Link>
      </p>
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-navy/40">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
