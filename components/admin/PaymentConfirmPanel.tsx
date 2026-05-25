'use client'

import { useTransition, useState } from 'react'
import { confirmPayment, rejectPaymentProof } from '@/app/actions/admin'
import { CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from 'lucide-react'

interface Props {
  caseId:       string
  proofUrl:     string
  clientName:   string
  servicePrice: number | null
}

export function PaymentConfirmPanel({ caseId, proofUrl, clientName, servicePrice }: Props) {
  const [confirmPending, startConfirm] = useTransition()
  const [rejectPending,  startReject]  = useTransition()
  const [error, setError] = useState('')

  function handleConfirm() {
    setError('')
    startConfirm(async () => {
      try {
        await confirmPayment(caseId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to confirm payment')
      }
    })
  }

  function handleReject() {
    setError('')
    startReject(async () => {
      try {
        await rejectPaymentProof(caseId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to reject proof')
      }
    })
  }

  const busy = confirmPending || rejectPending

  return (
    <div className="bg-teal-50 border border-teal-300 p-5">
      <p className="text-xs tracking-widest uppercase text-teal-700 font-medium mb-4">
        Payment Proof Received
      </p>

      <p className="text-sm text-teal-900 mb-3">
        <strong>{clientName}</strong> has submitted proof of payment
        {servicePrice ? ` for £${servicePrice.toFixed(2)}` : ''}.
        Review the screenshot below before confirming.
      </p>

      {/* Screenshot */}
      <div className="border border-teal-200 bg-white p-2 mb-4">
        {proofUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
          <img
            src={proofUrl}
            alt="Payment proof screenshot"
            className="w-full max-h-64 object-contain"
          />
        ) : (
          <div className="flex items-center justify-center py-8 text-sm text-teal-700">
            Non-image file submitted
          </div>
        )}
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 mt-2 transition-colors"
        >
          <ExternalLink size={12} /> Open full screenshot
        </a>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 mb-3">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {confirmPending
            ? <><Loader2 size={15} className="animate-spin" /> Confirming…</>
            : <><CheckCircle size={15} /> Confirm Payment</>
          }
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-700 text-sm hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {rejectPending
            ? <><Loader2 size={15} className="animate-spin" /> Rejecting…</>
            : <><XCircle size={15} /> Reject &amp; Ask Again</>
          }
        </button>
      </div>

      <p className="text-xs text-teal-600 mt-3 leading-relaxed">
        <strong>Confirm</strong> moves the case to Processing and notifies the client.
        <br />
        <strong>Reject</strong> clears the screenshot and sends the client back to the payment step.
      </p>
    </div>
  )
}
