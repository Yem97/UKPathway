'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/actions/client'

interface Props {
  initialFullName: string
  initialPhone: string
  initialCountry: string
}

export function ProfileForm({ initialFullName, initialPhone, initialCountry }: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [country, setCountry] = useState(initialCountry)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      await updateProfile(fullName, phone, country)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  const field = 'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-xs text-navy/50 uppercase tracking-wider block mb-2">Full Name</label>
        <input
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setSaved(false) }}
          placeholder="Your full name"
          className={field}
        />
      </div>
      <div>
        <label className="text-xs text-navy/50 uppercase tracking-wider block mb-2">Phone / WhatsApp</label>
        <input
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setSaved(false) }}
          placeholder="+44 7xxx xxxxxx"
          className={field}
        />
      </div>
      <div>
        <label className="text-xs text-navy/50 uppercase tracking-wider block mb-2">Country of Residence</label>
        <input
          value={country}
          onChange={(e) => { setCountry(e.target.value); setSaved(false) }}
          placeholder="e.g. Nigeria, Ghana, France…"
          className={field}
        />
      </div>
      <div>
        <button
          onClick={handleSave}
          disabled={pending}
          className={`btn-primary text-xs py-3 px-8 disabled:opacity-50 transition-colors ${saved ? 'bg-green-700 border-green-700' : ''}`}
        >
          {pending ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
