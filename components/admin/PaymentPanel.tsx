'use client'

import { useState, useTransition } from 'react'
import { markCasePaid } from '@/app/actions/admin'

export function PaymentPanel({ caseId, isPaid }: { caseId: string; isPaid: boolean }) {
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(isPaid)

  const handleMark = () => {
    const num = parseFloat(amount)
    if (isNaN(num) || !reference.trim()) return
    startTransition(async () => {
      await markCasePaid(caseId, num, reference.trim())
      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="bg-green-700 text-white p-6">
        <p className="font-serif text-lg mb-1">Payment Recorded</p>
        <p className="text-xs text-white/70">Case moved to Processing status.</p>
      </div>
    )
  }

  return (
    <div className="bg-navy text-white p-6">
      <h2 className="font-serif text-lg mb-4">Payment</h2>
      <p className="text-xs text-white/60 mb-4">
        Manual payment — mark as paid once bank transfer is confirmed.
      </p>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        placeholder="Amount (£)"
        className="w-full bg-white/10 border border-white/20 px-3 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white mb-3"
      />
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Payment reference / method"
        className="w-full bg-white/10 border border-white/20 px-3 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white mb-4"
      />
      <button
        onClick={handleMark}
        disabled={pending || !amount || !reference.trim()}
        className="w-full bg-white text-navy text-xs tracking-widest uppercase py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Mark as Paid'}
      </button>
      <p className="text-[10px] text-white/30 mt-3 text-center">
        Stripe integration available as next phase
      </p>
    </div>
  )
}
