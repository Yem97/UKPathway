'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

// All countries — UK first, then alphabetical
const COUNTRIES = [
  'United Kingdom',
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus',
  'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia',
  'Congo (DRC)', 'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark',
  'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kosovo', 'Kuwait',
  'Kyrgyzstan', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Mali', 'Malta', 'Mexico', 'Moldova', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
  'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe',
]

const schema = z.object({
  full_name:        z.string().min(2, 'Please enter your full name'),
  email:            z.string().email('Please enter a valid email address'),
  phone:            z.string().min(5, 'Please enter a valid phone number'),
  country:          z.string().min(1, 'Please select your country'),
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

const inputClass =
  'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white'
const labelClass = 'text-xs tracking-widest uppercase text-navy/50 block mb-2'

export default function SignupPage() {
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'United Kingdom' },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const supabase = createClient()
    const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uk-pathway.vercel.app'

    const { error: signUpError } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone:     data.phone,
          country:   data.country,
        },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('network')) {
        setError('Connection failed — please check your internet and try again.')
      } else if (signUpError.message.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else {
        setError(signUpError.message)
      }
      return
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
          We&apos;ve sent a confirmation link to your email address. Click it to activate your account.
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

        {/* Phone + Country side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+44 7700 000000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {/* Country dropdown */}
          <div>
            <label className={labelClass}>Country</label>
            <select
              {...register('country')}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && (
              <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>
            )}
          </div>
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
          <Link href="/terms" className="text-navy underline underline-offset-2">Terms</Link>{' '}and{' '}
          <Link href="/privacy" className="text-navy underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  )
}
