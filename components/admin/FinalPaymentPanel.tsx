'use client'

import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveFinalPaymentDetails, type CasePaymentDetails } from '@/app/actions/admin'
import { Send, CheckCircle, Edit2, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  caseId:       string
  servicePrice: number | null
  savedDetails: CasePaymentDetails | null
}

const inputClass =
  'w-full border border-navy/20 px-3 py-2.5 bg-white text-navy text-sm focus:outline-none focus:border-navy'
const labelClass = 'text-xs tracking-widest uppercase text-navy/50 block mb-1.5'

export function FinalPaymentPanel({ caseId, servicePrice, savedDetails }: Props) {
  const [editing, setEditing] = useState(!savedDetails)
  const [pending, startSave]  = useTransition()
  const [error,   setError]   = useState('')
  const [saved,   setSaved]   = useState(!!savedDetails)

  const [details, setDetails] = useState<CasePaymentDetails>({
    amount:         savedDetails?.amount         ?? servicePrice ?? 0,
    account_name:   savedDetails?.account_name   ?? '',
    bank_name:      savedDetails?.bank_name      ?? '',
    sort_code:      savedDetails?.sort_code      ?? '',
    account_number: savedDetails?.account_number ?? '',
    payment_method: savedDetails?.payment_method ?? 'Bank Transfer',
    instructions:   savedDetails?.instructions   ?? 'Please use your case reference number as the payment reference.',
  })

  // Pre-fill from global bank settings if no saved details
  useEffect(() => {
    if (savedDetails) return
    createClient()
      .from('settings')
      .select('value')
      .eq('key', 'bank_details')
      .single()
      .then(({ data }) => {
        if (!data?.value) return
        const b = data.value as Record<string, string>
        setDetails((prev) => ({
          ...prev,
          account_name:   b.account_name   || prev.account_name,
          bank_name:      b.bank_name      || prev.bank_name,
          sort_code:      b.sort_code      || prev.sort_code,
          account_number: b.account_number || prev.account_number,
          instructions:   b.additional_info || prev.instructions,
        }))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function set(field: keyof CasePaymentDetails, value: string | number) {
    setDetails((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    setError('')
    if (!details.account_name || !details.sort_code || !details.account_number) {
      setError('Account name, sort code and account number are required.')
      return
    }
    if (!details.amount || details.amount <= 0) {
      setError('Please enter a valid final payment amount.')
      return
    }
    startSave(async () => {
      try {
        await saveFinalPaymentDetails(caseId, details)
        setSaved(true)
        setEditing(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save.')
      }
    })
  }

  // ── Saved / read-only view ──────────────────────────────────────────────────
  if (saved && !editing) {
    return (
      <div className="bg-white border border-navy/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-navy flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Final Payment Request Sent
          </h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-navy/50 hover:text-navy flex items-center gap-1 transition-colors"
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>
        <p className="text-xs text-navy/60 mb-4 leading-relaxed">
          The client can see these details and upload their final payment screenshot.
          Once confirmed, the case will be marked as completed.
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs border border-navy/10 px-4 py-3 font-mono">
          <span className="text-navy/50 font-sans">Amount</span>
          <span className="text-navy font-bold">£{Number(details.amount).toFixed(2)}</span>
          <span className="text-navy/50 font-sans">Account name</span>
          <span className="text-navy">{details.account_name}</span>
          <span className="text-navy/50 font-sans">Bank</span>
          <span className="text-navy">{details.bank_name}</span>
          <span className="text-navy/50 font-sans">Sort code</span>
          <span className="text-navy">{details.sort_code}</span>
          <span className="text-navy/50 font-sans">Account No.</span>
          <span className="text-navy">{details.account_number}</span>
          <span className="text-navy/50 font-sans">Method</span>
          <span className="text-navy">{details.payment_method}</span>
        </div>
        {details.instructions && (
          <p className="text-xs text-navy/60 mt-3 italic leading-relaxed">{details.instructions}</p>
        )}
      </div>
    )
  }

  // ── Edit form ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-indigo-50 border border-indigo-200 p-6">
      <h2 className="font-serif text-lg text-navy mb-2">Send Final Payment Request</h2>
      <p className="text-xs text-navy/60 mb-5 leading-relaxed">
        Processing is complete. Enter the final payment amount and bank details below.
        Once you click <strong>Send to Client</strong>, the client will see a payment
        request on their case page and must pay to receive their documents.
      </p>

      <div className="flex flex-col gap-4">
        {/* Amount */}
        <div>
          <label className={labelClass}>Final payment amount (£) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={details.amount || ''}
            onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
            placeholder={servicePrice ? `${servicePrice}` : '0.00'}
          />
          {servicePrice && (
            <p className="text-xs text-navy/40 mt-1">Service fee: £{servicePrice.toFixed(2)}</p>
          )}
        </div>

        {/* Payment method */}
        <div>
          <label className={labelClass}>Payment method</label>
          <select
            className={`${inputClass} cursor-pointer`}
            value={details.payment_method}
            onChange={(e) => set('payment_method', e.target.value)}
          >
            <option>Bank Transfer</option>
            <option>PayPal</option>
            <option>Wise / TransferWise</option>
            <option>Cash (in person)</option>
            <option>Other</option>
          </select>
        </div>

        <div className="border-t border-indigo-200 pt-4">
          <p className="text-xs tracking-widest uppercase text-navy/40 mb-3">Bank / Account Details</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>Account name *</label>
              <input
                className={inputClass}
                value={details.account_name}
                onChange={(e) => set('account_name', e.target.value)}
                placeholder="UK Pathway Services Ltd"
              />
            </div>
            <div>
              <label className={labelClass}>Bank name</label>
              <input
                className={inputClass}
                value={details.bank_name}
                onChange={(e) => set('bank_name', e.target.value)}
                placeholder="Barclays / Monzo / Starling etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Sort code *</label>
                <input
                  className={inputClass}
                  value={details.sort_code}
                  onChange={(e) => set('sort_code', e.target.value)}
                  placeholder="00-00-00"
                  maxLength={8}
                />
              </div>
              <div>
                <label className={labelClass}>Account number *</label>
                <input
                  className={inputClass}
                  value={details.account_number}
                  onChange={(e) => set('account_number', e.target.value)}
                  placeholder="00000000"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Instructions to client (optional)</label>
              <textarea
                rows={2}
                className={`${inputClass} resize-none`}
                value={details.instructions}
                onChange={(e) => set('instructions', e.target.value)}
                placeholder="e.g. Please use your case number as the payment reference"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <div className="flex gap-3">
          {saved && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2.5 border border-navy/20 text-navy text-xs hover:bg-navy/5 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-700 text-white text-sm hover:bg-indigo-800 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {pending
              ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
              : <><Send size={15} /> Send to Client</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
