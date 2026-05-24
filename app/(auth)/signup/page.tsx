'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please enter your country'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          country: data.country,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uk-pathway.vercel.app'}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Update profile with phone and country
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        phone: data.phone,
        country: data.country,
      }).eq('id', user.id)
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-navy/5 flex items-center justify-center mx-auto mb-6">
          <span className="font-serif text-2xl text-navy">&#10003;</span>
        </div>
        <h2 className="font-serif text-2xl text-navy mb-3">Check your email</h2>
        <p className="text-sm text-navy/60 font-light leading-relaxed">
          We&apos;ve sent a confirmation link to your email address. Click it to activate your account and access your portal.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy mb-2">Create your account</h1>
      <p className="text-sm text-navy mb-10">
        Already have an account?{' '}
        <Link href="/login" className="text-navy underline underline-offset-4 font-medium">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Full Name"
          placeholder="John Smith"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+44 7700 000000"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Country"
            placeholder="Nigeria"
            error={errors.country?.message}
            {...register('country')}
          />
        </div>
        <Input
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3">{error}</p>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full mt-2">
          Create Account
        </Button>

        <p className="text-xs text-navy/70 text-center leading-relaxed">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-navy underline underline-offset-2">Terms</Link> and{' '}
          <Link href="/privacy" className="text-navy underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  )
}
