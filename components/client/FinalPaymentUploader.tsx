'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle, Loader2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react'

interface FinalPaymentDetails {
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
  finalPaymentDetails: FinalPaymentDetails
}

export function FinalPaymentUploader({ caseId, caseNumber, finalPaymentDetails }: Props) {
  const router  = useRouter()
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
      const body = new FormData()
      body.append('file',   file)
      body.append('caseId', caseId)
      body.append('mode',   'final')   // tells the route handler this is a final payment

      const res  = await fetch('/api/upload-payment-proof', { method: 'POST', body })
      const json = await res.json() as { error?: string; success?: boolean }

      if (!res.ok) throw new Error(json.error ?? 'Upload failed. Please try again.')

      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setUploadErr(msg)
      setUploading(false)
    }
  }

  return (
    <div className="bg-indigo-50 border border-indigo-300 flex flex-col gap-0">

      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-indigo-200">
        <FileText size={20} className="text-indigo-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-900">Final Payment Required</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Your documents are ready! Complete the final payment below to receive them.
          </p>
        </div>
      </div>

      {/* Payment details */}
      <div className="px-5 py-4 border-b border-indigo-200">
        {/* Amount */}
        <div className="bg-white border border-indigo-200 px-4 py-3 mb-3 flex items-baseline gap-2">
          <span className="font-serif text-2xl text-indigo-900">
            £{Number(finalPaymentDetails.amount).toFixed(2)}
          </span>
          <span className="text-xs text-indigo-600">
            final payment · {finalPaymentDetails.payment_method}
          </span>
        </div>

        {/* Bank details grid */}
        <div className="bg-white border border-indigo-200 px-4 py-3 text-xs font-mono text-indigo-900 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {finalPaymentDetails.account_name && (
            <>
              <span className="text-indigo-600 font-sans font-medium not-italic">Account name</span>
              <span>{finalPaymentDetails.account_name}</span>
            </>
          )}
          {finalPaymentDetails.bank_name && (
            <>
              <span className="text-indigo-600 font-sans font-medium not-italic">Bank</span>
              <span>{finalPaymentDetails.bank_name}</span>
            </>
          )}
          {finalPaymentDetails.sort_code && (
            <>
              <span className="text-indigo-600 font-sans font-medium not-italic">Sort code</span>
              <span>{finalPaymentDetails.sort_code}</span>
            </>
          )}
          {finalPaymentDetails.account_number && (
            <>
              <span className="text-indigo-600 font-sans font-medium not-italic">Account No.</span>
              <span>{finalPaymentDetails.account_number}</span>
            </>
          )}
          <span className="text-indigo-600 font-sans font-medium not-italic">Reference</span>
          <span className="font-bold">{caseNumber}</span>
        </div>

        {finalPaymentDetails.instructions && (
          <p className="text-xs text-indigo-800 mt-2 leading-relaxed">
            ℹ️ {finalPaymentDetails.instructions}
          </p>
        )}
      </div>

      {/* Upload section */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-indigo-900 mb-3 uppercase tracking-wider">
          Step 2 — Upload your payment screenshot
        </p>

        {preview && (
          <div className="mb-3 border border-indigo-200 bg-white p-2">
            <img src={preview} alt="Payment screenshot" className="max-h-48 w-full object-contain" />
            <p className="text-xs text-indigo-600 mt-1 text-center truncate">{file?.name}</p>
          </div>
        )}
        {file && !preview && (
          <div className="mb-3 flex items-center gap-2 border border-indigo-200 bg-white px-4 py-3">
            <ImageIcon size={16} className="text-indigo-600 shrink-0" />
            <span className="text-xs text-indigo-900 truncate">{file.name}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-indigo-400 text-indigo-800 text-sm hover:bg-indigo-100 active:scale-[0.99] transition-all disabled:opacity-50"
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
        <p className="text-xs text-indigo-600 mt-1.5">
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
            disabled={uploading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-800 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {uploading
              ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              : <><CheckCircle size={16} /> Submit Final Payment Proof</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
