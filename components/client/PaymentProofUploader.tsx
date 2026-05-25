'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitPaymentProof } from '@/app/actions/client'
import { Upload, CheckCircle, Loader2, AlertCircle, CreditCard, Image as ImageIcon } from 'lucide-react'

interface PaymentDetails {
  amount:         number
  account_name:   string
  bank_name:      string
  sort_code:      string
  account_number: string
  payment_method: string
  instructions:   string
}

interface Props {
  caseId:         string
  caseNumber:     string
  userId:         string
  paymentDetails: PaymentDetails | null
}

export function PaymentProofUploader({ caseId, caseNumber, userId, paymentDetails }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [file,      setFile]      = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setUploadErr('')
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
    e.target.value = ''
  }

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    setUploadErr('')

    try {
      const supabase = createClient()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path     = `${userId}/payment_${Date.now()}_${safeName}`

      const { data, error } = await supabase.storage
        .from('case-documents')
        .upload(path, file, { upsert: false })

      if (error) throw new Error(`Storage error: ${error.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('case-documents')
        .getPublicUrl(data.path)

      // Call directly (not inside startTransition) so errors propagate
      // to the catch block instead of crashing the page
      await submitPaymentProof(caseId, publicUrl)

    } catch (err: unknown) {
      // Re-throw Next.js redirect so navigation works after success
      if (
        err !== null &&
        typeof err === 'object' &&
        'digest' in err &&
        String((err as { digest: unknown }).digest).startsWith('NEXT_REDIRECT')
      ) {
        throw err
      }
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setUploadErr(msg)
      setUploading(false)
    }
  }

  const busy = uploading

  return (
    <div className="bg-amber-50 border border-amber-300 flex flex-col gap-0">

      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-amber-200">
        <CreditCard size={20} className="text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Payment Required</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Transfer the deposit to our account, then upload your payment screenshot below.
          </p>
        </div>
      </div>

      {/* Payment details sent by admin */}
      {paymentDetails ? (
        <div className="px-5 py-4 border-b border-amber-200">
          {/* Amount */}
          <div className="bg-white border border-amber-200 px-4 py-3 mb-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl text-amber-900">
              £{Number(paymentDetails.amount).toFixed(2)}
            </span>
            <span className="text-xs text-amber-600">deposit required · {paymentDetails.payment_method}</span>
          </div>

          {/* Bank details grid */}
          <div className="bg-white border border-amber-200 px-4 py-3 text-xs font-mono text-amber-900 grid grid-cols-2 gap-x-6 gap-y-1.5">
            {paymentDetails.account_name && (
              <>
                <span className="text-amber-600 font-sans font-medium not-italic">Account name</span>
                <span>{paymentDetails.account_name}</span>
              </>
            )}
            {paymentDetails.bank_name && (
              <>
                <span className="text-amber-600 font-sans font-medium not-italic">Bank</span>
                <span>{paymentDetails.bank_name}</span>
              </>
            )}
            {paymentDetails.sort_code && (
              <>
                <span className="text-amber-600 font-sans font-medium not-italic">Sort code</span>
                <span>{paymentDetails.sort_code}</span>
              </>
            )}
            {paymentDetails.account_number && (
              <>
                <span className="text-amber-600 font-sans font-medium not-italic">Account No.</span>
                <span>{paymentDetails.account_number}</span>
              </>
            )}
            <span className="text-amber-600 font-sans font-medium not-italic">Reference</span>
            <span className="font-bold">{caseNumber}</span>
          </div>

          {paymentDetails.instructions && (
            <p className="text-xs text-amber-800 mt-2 leading-relaxed">
              ℹ️ {paymentDetails.instructions}
            </p>
          )}
        </div>
      ) : (
        <div className="px-5 py-4 border-b border-amber-200">
          <p className="text-xs text-amber-800 leading-relaxed">
            Our team is preparing your payment details. You will see them here shortly —
            please check back or send us a message if you have any questions.
          </p>
        </div>
      )}

      {/* Upload section — only show if admin has sent details */}
      {paymentDetails && (
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-amber-900 mb-3 uppercase tracking-wider">
            Step 2 — Upload your payment screenshot
          </p>

          {/* Image preview */}
          {preview && (
            <div className="mb-3 border border-amber-200 bg-white p-2">
              <img src={preview} alt="Payment screenshot" className="max-h-48 w-full object-contain" />
              <p className="text-xs text-amber-600 mt-1 text-center truncate">{file?.name}</p>
            </div>
          )}
          {file && !preview && (
            <div className="mb-3 flex items-center gap-2 border border-amber-200 bg-white px-4 py-3">
              <ImageIcon size={16} className="text-amber-600 shrink-0" />
              <span className="text-xs text-amber-900 truncate">{file.name}</span>
            </div>
          )}

          {/* File picker */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-amber-400 text-amber-800 text-sm hover:bg-amber-100 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <Upload size={16} />
            {file ? 'Change screenshot' : 'Choose screenshot or photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-amber-600 mt-1.5">
            Accepted: screenshots, photos (JPG/PNG), or PDF receipts
          </p>

          {uploadErr && (
            <p className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 mt-3">
              <AlertCircle size={13} /> {uploadErr}
            </p>
          )}

          {file && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {busy
                ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                : <><CheckCircle size={16} /> Submit Payment Proof</>
              }
            </button>
          )}
        </div>
      )}
    </div>
  )
}
