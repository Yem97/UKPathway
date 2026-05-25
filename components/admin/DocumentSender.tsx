'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react'

interface SentDoc {
  id:         string
  file_name:  string | null
  label:      string | null
  file_url:   string
  created_at: string
}

interface Props {
  caseId:       string
  sentDocuments: SentDoc[]
}

export function DocumentSender({ caseId, sentDocuments }: Props) {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file,      setFile]      = useState<File | null>(null)
  const [label,     setLabel]     = useState('')
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
    // Pre-fill label from filename (strip extension)
    if (!label) setLabel(f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '))
    e.target.value = ''
  }

  async function handleSend() {
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const body = new FormData()
      body.append('file',   file)
      body.append('caseId', caseId)
      body.append('label',  label.trim() || file.name)

      const res  = await fetch('/api/admin/send-document', { method: 'POST', body })
      const json = await res.json() as { error?: string }

      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      setFile(null)
      setLabel('')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-navy/10 p-6">
      <h2 className="font-serif text-lg text-navy mb-2 flex items-center gap-2">
        <FileText size={16} /> Send Documents to Client
      </h2>
      <p className="text-xs text-navy/60 mb-5 leading-relaxed">
        Upload the completed documents here. They appear instantly in the client&apos;s
        case page as downloadable files.
      </p>

      {/* Already-sent documents */}
      {sentDocuments.length > 0 && (
        <div className="mb-5">
          <p className="text-xs tracking-widest uppercase text-navy/40 mb-2">Already Sent</p>
          <div className="flex flex-col gap-2">
            {sentDocuments.map((doc) => (
              <div key={doc.id}
                className="flex items-center justify-between border border-green-200 bg-green-50 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle size={13} className="text-green-600 shrink-0" />
                  <span className="text-xs text-navy truncate">{doc.label || doc.file_name || 'Document'}</span>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-navy/50 hover:text-navy ml-3 shrink-0 transition-colors"
                >
                  <Download size={11} /> View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload form */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs tracking-widest uppercase text-navy/50 block mb-1.5">
            Label (shown to client)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Driving Licence Conversion Certificate"
            className="w-full border border-navy/20 px-3 py-2.5 bg-white text-navy text-sm focus:outline-none focus:border-navy"
          />
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-navy/30 text-navy text-sm hover:bg-navy/5 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <Upload size={15} />
          {file ? file.name : 'Choose file (PDF, image, Word…)'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <p className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
            <AlertCircle size={13} /> {error}
          </p>
        )}

        {file && (
          <button
            type="button"
            onClick={handleSend}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-700 text-white text-sm font-medium hover:bg-green-800 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {uploading
              ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
              : <><CheckCircle size={15} /> Send to Client</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
