'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const supabase = createClient()

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email address before signing in. Check your inbox.')
      } else if (signInError.message.toLowerCase().includes('invalid login')) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError(signInError.message)
      }
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    // Hard redirect so browser sends fresh session cookies to the server
    if (profile?.role === 'admin') {
      window.location.href = '/admin'
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end mt-2">
          <Link href="/reset-password" className="text-xs text-navy/70 hover:text-navy underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3">{error}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full mt-2">
        Sign In
      </Button>
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
