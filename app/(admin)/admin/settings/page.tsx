'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, AlertCircle, Building2 } from 'lucide-react'

interface BankDetails {
  account_name:    string
  bank_name:       string
  sort_code:       string
  account_number:  string
  additional_info: string
}

const defaultBank: BankDetails = {
  account_name:    '',
  bank_name:       '',
  sort_code:       '',
  account_number:  '',
  additional_info: 'Please include your case reference number as the payment reference.',
}

const inputClass =
  'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white'
const labelClass = 'text-xs tracking-widest uppercase text-navy/50 block mb-2'

export default function AdminSettingsPage() {
  const supabase = createClient()

  const [bank, setBank]       = useState<BankDetails>(defaultBank)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'bank_details')
      .single()
      .then(({ data }) => {
        if (data?.value) setBank(data.value as BankDetails)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save() {
    setError('')
    if (!bank.account_name || !bank.sort_code || !bank.account_number) {
      setError('Account name, sort code, and account number are required.')
      return
    }

    setSaving(true)
    const { error: upsertErr } = await supabase
      .from('settings')
      .upsert({ key: 'bank_details', value: bank }, { onConflict: 'key' })

    setSaving(false)
    if (upsertErr) {
      setError(upsertErr.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <p className="eyebrow mb-1">Admin</p>
          <h1 className="font-serif text-3xl text-navy">Settings</h1>
        </div>
        <p className="text-navy/40 text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-serif text-3xl text-navy">Settings</h1>
        <p className="text-sm text-navy/60 mt-1">
          Configure your business details and payment information.
        </p>
      </div>

      {/* Bank Details Card */}
      <div className="bg-white border border-navy/10 p-6 md:p-8 max-w-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-navy/10">
          <Building2 size={18} className="text-navy/50" />
          <h2 className="font-serif text-xl text-navy">Payment / Bank Details</h2>
        </div>

        <p className="text-sm text-navy/60 mb-6 leading-relaxed">
          These details are shown to clients when their case moves to{' '}
          <strong>Awaiting Payment</strong>. Keep them accurate so clients can transfer
          their deposit correctly.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Account name *</label>
            <input
              className={inputClass}
              value={bank.account_name}
              onChange={(e) => setBank({ ...bank, account_name: e.target.value })}
              placeholder="UK Pathway Services Ltd"
            />
          </div>

          <div>
            <label className={labelClass}>Bank name *</label>
            <input
              className={inputClass}
              value={bank.bank_name}
              onChange={(e) => setBank({ ...bank, bank_name: e.target.value })}
              placeholder="Barclays / Monzo / Starling etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sort code *</label>
              <input
                className={inputClass}
                value={bank.sort_code}
                onChange={(e) => setBank({ ...bank, sort_code: e.target.value })}
                placeholder="00-00-00"
                maxLength={8}
              />
            </div>
            <div>
              <label className={labelClass}>Account number *</label>
              <input
                className={inputClass}
                value={bank.account_number}
                onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
                placeholder="00000000"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Additional instructions (optional)</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={bank.additional_info}
              onChange={(e) => setBank({ ...bank, additional_info: e.target.value })}
              placeholder="e.g. Please use your case number as the payment reference"
            />
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 mt-4">
            <AlertCircle size={16} /> {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-navy text-white text-sm hover:bg-navy/90 transition-all disabled:opacity-60"
        >
          {saving
            ? 'Saving…'
            : saved
            ? <><Check size={16} /> Saved</>
            : <><Save size={16} /> Save Bank Details</>
          }
        </button>
      </div>
    </div>
  )
}
