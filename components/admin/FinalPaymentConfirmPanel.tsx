'use client'

import { useTransition, useState } from 'react'
import { confirmFinalPayment, rejectFinalPaymentProof } from '@/app/actions/admin'
import { CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from 'lucide-react'

interface Props {
  caseId:     string
  proofUrl:   string
  clientName: string
}

export function FinalPaymentConfirmPanel({ caseId, proofUrl, clientName }: Props) {
  const [confirmPending, startConfirm] = useTransition()
  const [rejectPending,  startReject]  = useTransition()
  const [error, setError] = useState('')

  function handleConfirm() {
    setError('')
    startConfirm(async () => {
      try { await confirmFinalPayment(caseId) }
      catch (e) { setError(e instanceof Error ? e.message : 'Failed to confirm payment') }
    })
  }

  function handleReject() {
    setError('')
    startReject(async () => {
      try { await rejectFinalPaymentProof(caseId) }
      catch (e) { setError(e instanceof Error ? e.message : 'Failed to reject proof') }
    })
  }

  const busy = confirmPending || rejectPending

  return (
    <div className="bg-indigo-50 border border-indigo-300 p-5">
      <p className="text-xs tracking-widest uppercase text-indigo-700 font-medium mb-4">
        Final Payment Proof Received
      </p>

      <p className="text-sm text-navy mb-3">
        <strong>{clientName}</strong> has submitted their final payment screenshot.
        Review it below before confirming — confirming will mark the case as{' '}
        <strong>Completed</strong> and release their documents.
      </p>

      {/* Screenshot */}
      <div className="border border-indigo-200 bg-white p-2 mb-4">
        {proofUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
          <img
            src={proofUrl}
            alt="Final payment proof"
            className="w-full max-h-64 object-contain"
          />
        ) : (
          <div className="flex items-center justify-center py-8 text-sm text-indigo-700">
            Non-image file submitted
          </div>
        )}
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 mt-2 transition-colors"
        >
          <ExternalLink size={12} /> Open full screenshot
        </a>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 mb-3">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {confirmPending
            ? <><Loader2 size={15} className="animate-spin" /> Confirming…</>
            : <><CheckCircle size={15} /> Confirm &amp; Complete Case</>
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

      <p className="text-xs text-indigo-600 mt-3 leading-relaxed">
        <strong>Confirm</strong> marks the case as Completed and notifies the client their documents are on the way.
        <br />
        <strong>Reject</strong> asks the client to re-upload a clearer screenshot.
      </p>
    </div>
  )
}
