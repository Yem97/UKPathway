'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { submitApplication, type SubmitApplicationPayload } from '@/app/actions/client'
import { getServiceQuestions } from '@/lib/service-questions'
import type { Service, Profile } from '@/types'
import {
  CheckCircle, Upload, X, FileText, ChevronRight, ChevronLeft,
  AlertCircle, Loader2, User, ClipboardList, FolderOpen, Eye,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
  file:     File
  label:    string      // which required document this covers
  preview?: string      // data-URL for images
  url?:     string      // Supabase public path after upload
  uploading: boolean
  error?:   string
}

interface PersonalData {
  full_name:     string
  date_of_birth: string
  nationality:   string
  phone:         string
  uk_address:    string
  visa_status:   string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Your Details',   icon: User },
  { label: 'Case Details',   icon: ClipboardList },
  { label: 'Documents',      icon: FolderOpen },
  { label: 'Review',         icon: Eye },
]

const inputClass =
  'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white rounded-none'
const labelClass = 'text-xs tracking-widest uppercase text-navy/60 block mb-2 font-medium'
const errorClass = 'text-xs text-red-600 mt-1.5 flex items-center gap-1'

const VISA_STATUSES = [
  'UK Citizen / British Passport',
  'Indefinite Leave to Remain (ILR)',
  'Settled Status (EU Settlement Scheme)',
  'Pre-Settled Status',
  'Skilled Worker Visa',
  'Student Visa',
  'Family Visa',
  'BNO Visa',
  'Graduate Visa',
  'Refugee / Humanitarian Protection',
  'Asylum Seeker',
  'Other',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  service: Service
  profile: Profile | null
  userId:  string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ApplicationWizard({ service, profile, userId }: Props) {
  const questions = getServiceQuestions(service.slug)

  // Step state
  const [step, setStep] = useState(0)

  // Step 1 — personal details
  const [personal, setPersonal] = useState<PersonalData>({
    full_name:     profile?.full_name ?? '',
    date_of_birth: '',
    nationality:   '',
    phone:         profile?.phone ?? '',
    uk_address:    '',
    visa_status:   '',
  })
  const [personalErrors, setPersonalErrors] = useState<Partial<Record<keyof PersonalData, string>>>({})

  // Step 2 — service answers
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({})

  // Step 3 — documents
  const [uploads, setUploads]   = useState<UploadedFile[]>([])
  const [docError, setDocError] = useState('')

  // Step 4 — notes + submission
  const [notes, setNotes]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Step 1 validation ────────────────────────────────────────────────────

  function validatePersonal(): boolean {
    const errs: Partial<Record<keyof PersonalData, string>> = {}
    if (!personal.full_name.trim())     errs.full_name     = 'Required'
    if (!personal.date_of_birth)        errs.date_of_birth = 'Required'
    if (!personal.nationality.trim())   errs.nationality   = 'Required'
    if (!personal.phone.trim())         errs.phone         = 'Required'
    if (!personal.uk_address.trim())    errs.uk_address    = 'Required'
    if (!personal.visa_status)          errs.visa_status   = 'Required'
    setPersonalErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 2 validation ────────────────────────────────────────────────────

  function validateAnswers(): boolean {
    const errs: Record<string, string> = {}
    questions.forEach((q) => {
      if (q.required && !answers[q.id]?.trim()) {
        errs[q.id] = 'This field is required'
      }
    })
    setAnswerErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Step 3 — file upload ─────────────────────────────────────────────────

  const handleFileSelect = useCallback(async (
    file:  File,
    label: string,
    index: number,
  ) => {
    // Add entry in uploading state
    setUploads((prev) => {
      const next = [...prev]
      next[index] = { file, label, uploading: true }
      return next
    })

    const supabase  = createClient()
    const ext       = file.name.split('.').pop()
    const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path      = `${userId}/${Date.now()}_${safeName}`

    const { data, error } = await supabase.storage
      .from('case-documents')
      .upload(path, file, { upsert: false })

    if (error) {
      setUploads((prev) => {
        const next = [...prev]
        next[index] = { file, label, uploading: false, error: error.message }
        return next
      })
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('case-documents')
      .getPublicUrl(data.path)

    // Build preview for images
    let preview: string | undefined
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file)
    }

    setUploads((prev) => {
      const next = [...prev]
      next[index] = { file, label, uploading: false, url: publicUrl, preview }
      return next
    })
  }, [userId])

  function removeUpload(index: number) {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function goNext() {
    if (step === 0 && !validatePersonal()) return
    if (step === 1 && !validateAnswers())  return
    if (step === 2) {
      // Check all required docs have at least one file
      const uploadedLabels = uploads.filter((u) => u.url).map((u) => u.label)
      const required = service.required_documents ?? []
      const missing  = required.filter((doc) => !uploadedLabels.includes(doc))
      if (missing.length > 0) {
        setDocError(`Please upload: ${missing.join(', ')}`)
        return
      }
      setDocError('')
    }
    setStep((s) => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload: SubmitApplicationPayload = {
        serviceId: service.id,
        personal,
        serviceAnswers: answers,
        documents: uploads
          .filter((u) => u.url)
          .map((u) => ({
            file_url:  u.url!,
            file_name: u.file.name,
            label:     u.label,
          })),
        notes,
      }
      await submitApplication(payload)
      // redirect happens inside server action
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(msg)
      setSubmitting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done    = i < step
            const current = i === step
            return (
              <div
                key={s.label}
                className={`flex flex-col items-center gap-1 flex-1 ${
                  i < STEPS.length - 1 ? 'relative' : ''
                }`}
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 right-0 h-px -z-0 ${
                      done ? 'bg-navy' : 'bg-navy/15'
                    }`}
                    style={{ left: '50%', right: '-50%' }}
                  />
                )}
                {/* Circle */}
                <div
                  className={`relative z-10 w-8 h-8 flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-navy border-navy'
                      : current
                      ? 'bg-white border-navy'
                      : 'bg-white border-navy/20'
                  }`}
                >
                  {done ? (
                    <CheckCircle size={16} className="text-white" />
                  ) : (
                    <Icon size={14} className={current ? 'text-navy' : 'text-navy/30'} />
                  )}
                </div>
                <span
                  className={`text-[10px] tracking-wide text-center hidden sm:block ${
                    current ? 'text-navy font-medium' : done ? 'text-navy/60' : 'text-navy/30'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
        {/* Mobile step label */}
        <p className="sm:hidden text-center text-xs text-navy/60 font-medium">
          Step {step + 1} of {STEPS.length} — {STEPS[step].label}
        </p>
      </div>

      {/* ── STEP 1: Personal Details ── */}
      {step === 0 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Your details</h2>
          <p className="text-sm text-navy/60 mb-8">
            We&apos;ve pre-filled what we have. Please check and complete all fields.
          </p>

          <div className="flex flex-col gap-5">
            <Field label="Full legal name" error={personalErrors.full_name}>
              <input
                className={inputClass}
                value={personal.full_name}
                onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })}
                placeholder="As it appears on your passport"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of birth" error={personalErrors.date_of_birth}>
                <input
                  type="date"
                  className={inputClass}
                  value={personal.date_of_birth}
                  onChange={(e) => setPersonal({ ...personal, date_of_birth: e.target.value })}
                />
              </Field>

              <Field label="Nationality" error={personalErrors.nationality}>
                <input
                  className={inputClass}
                  value={personal.nationality}
                  onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                  placeholder="e.g. Nigerian, Indian, Polish"
                />
              </Field>
            </div>

            <Field label="Phone number" error={personalErrors.phone}>
              <input
                type="tel"
                className={inputClass}
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                placeholder="+44 7700 000000"
              />
            </Field>

            <Field label="Current UK address" error={personalErrors.uk_address}>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={personal.uk_address}
                onChange={(e) => setPersonal({ ...personal, uk_address: e.target.value })}
                placeholder="House number, street, city, postcode"
              />
            </Field>

            <Field label="Current UK immigration / visa status" error={personalErrors.visa_status}>
              <select
                className={`${inputClass} cursor-pointer`}
                value={personal.visa_status}
                onChange={(e) => setPersonal({ ...personal, visa_status: e.target.value })}
              >
                <option value="">— Select your status —</option>
                {VISA_STATUSES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* ── STEP 2: Service-specific questions ── */}
      {step === 1 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">About your case</h2>
          <p className="text-sm text-navy/60 mb-8">
            These details help our team prepare your{' '}
            <span className="text-navy font-medium">{service.name}</span> application.
          </p>

          {questions.length === 0 ? (
            <div className="bg-navy/5 border border-navy/10 p-6 text-center">
              <p className="text-sm text-navy/60">
                No additional information needed for this service. Continue to document upload.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {questions.map((q) => (
                <Field key={q.id} label={q.label} helpText={q.helpText} error={answerErrors[q.id]}>
                  {q.type === 'text' && (
                    <input
                      className={inputClass}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder={q.placeholder}
                    />
                  )}
                  {q.type === 'textarea' && (
                    <textarea
                      rows={3}
                      className={`${inputClass} resize-none`}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder={q.placeholder}
                    />
                  )}
                  {q.type === 'date' && (
                    <input
                      type="date"
                      className={inputClass}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    />
                  )}
                  {q.type === 'select' && (
                    <select
                      className={`${inputClass} cursor-pointer`}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    >
                      <option value="">— Select an option —</option>
                      {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  {q.type === 'radio' && (
                    <div className="flex flex-col gap-2 mt-1">
                      {q.options?.map((o) => (
                        <label
                          key={o}
                          className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-all ${
                            answers[q.id] === o
                              ? 'border-navy bg-navy/5 text-navy'
                              : 'border-navy/15 text-navy/70 hover:border-navy/40'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              answers[q.id] === o ? 'border-navy' : 'border-navy/30'
                            }`}
                          >
                            {answers[q.id] === o && (
                              <div className="w-2 h-2 rounded-full bg-navy" />
                            )}
                          </div>
                          <span className="text-sm">{o}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'yesno' && (
                    <div className="flex gap-3 mt-1">
                      {['Yes', 'No'].map((o) => (
                        <label
                          key={o}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border cursor-pointer transition-all ${
                            answers[q.id] === o
                              ? 'border-navy bg-navy text-white'
                              : 'border-navy/20 text-navy/70 hover:border-navy/50'
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            value={o}
                            checked={answers[q.id] === o}
                            onChange={() => setAnswers({ ...answers, [q.id]: o })}
                          />
                          <span className="text-sm font-medium">{o}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </Field>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Document Upload ── */}
      {step === 2 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Upload your documents</h2>
          <p className="text-sm text-navy/60 mb-2">
            Please upload clear, legible copies. Accepted: PDF, JPG, PNG (max 10MB each).
          </p>
          {docError && (
            <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 mb-6">
              <AlertCircle size={16} /> {docError}
            </p>
          )}

          <div className="flex flex-col gap-4 mb-6">
            {(service.required_documents ?? []).map((docLabel, idx) => {
              const uploaded = uploads.find((u) => u.label === docLabel)
              return (
                <DocumentSlot
                  key={docLabel}
                  label={docLabel}
                  uploaded={uploaded}
                  onSelect={(file) => {
                    const slotIdx = uploads.findIndex((u) => u.label === docLabel)
                    const targetIdx = slotIdx === -1 ? uploads.length : slotIdx
                    handleFileSelect(file, docLabel, targetIdx)
                  }}
                  onRemove={() => {
                    setUploads((prev) => prev.filter((u) => u.label !== docLabel))
                  }}
                />
              )
            })}
          </div>

          {/* Optional extra docs */}
          <div className="border-t border-navy/10 pt-5">
            <p className="text-xs tracking-widest uppercase text-navy/40 mb-3">
              Additional documents (optional)
            </p>
            <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-navy/20 text-navy/50 hover:border-navy/50 hover:text-navy cursor-pointer transition-all text-sm">
              <Upload size={16} />
              Upload any other supporting document
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file, 'Additional document', uploads.length)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* ── STEP 4: Review ── */}
      {step === 3 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Review your application</h2>
          <p className="text-sm text-navy/60 mb-8">
            Check everything below before submitting. You can go back to make changes.
          </p>

          {/* Service summary */}
          <ReviewSection title="Service">
            <ReviewRow label="Service" value={service.name} />
            {service.price && <ReviewRow label="Quoted price" value={`£${service.price.toFixed(2)}`} />}
            {service.timeline && <ReviewRow label="Estimated timeline" value={service.timeline} />}
          </ReviewSection>

          {/* Personal details */}
          <ReviewSection title="Your Details">
            <ReviewRow label="Full name"    value={personal.full_name} />
            <ReviewRow label="Date of birth" value={personal.date_of_birth} />
            <ReviewRow label="Nationality"  value={personal.nationality} />
            <ReviewRow label="Phone"        value={personal.phone} />
            <ReviewRow label="UK address"   value={personal.uk_address} />
            <ReviewRow label="Visa status"  value={personal.visa_status} />
          </ReviewSection>

          {/* Service answers */}
          {Object.keys(answers).length > 0 && (
            <ReviewSection title="Case Details">
              {getServiceQuestions(service.slug).map((q) =>
                answers[q.id] ? (
                  <ReviewRow key={q.id} label={q.label} value={answers[q.id]} />
                ) : null
              )}
            </ReviewSection>
          )}

          {/* Documents */}
          <ReviewSection title="Documents">
            {uploads.filter((u) => u.url).length === 0 ? (
              <p className="text-sm text-navy/40 italic">No documents uploaded</p>
            ) : (
              uploads.filter((u) => u.url).map((u) => (
                <div key={u.url} className="flex items-center gap-3 py-2 border-b border-navy/5 last:border-0">
                  <FileText size={14} className="text-navy/40 shrink-0" />
                  <div>
                    <p className="text-sm text-navy">{u.file.name}</p>
                    <p className="text-xs text-navy/40">{u.label}</p>
                  </div>
                  <CheckCircle size={14} className="text-green-600 ml-auto shrink-0" />
                </div>
              ))
            )}
          </ReviewSection>

          {/* Additional notes */}
          <div className="mb-6">
            <label className={labelClass}>Additional notes (optional)</label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else our team should know about your case…"
            />
          </div>

          {/* Declaration */}
          <div className="bg-navy/[0.03] border border-navy/10 px-5 py-4 mb-6">
            <p className="text-xs text-navy/70 leading-relaxed">
              By submitting this application I confirm that all information provided is accurate
              and that I am authorised to upload the documents included. I understand that UK Pathway
              Services will review my case and contact me within 1–2 business days.
            </p>
          </div>

          {submitError && (
            <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 mb-4">
              <AlertCircle size={16} /> {submitError}
            </p>
          )}
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex gap-3 mt-10 pt-6 border-t border-navy/10">
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 border border-navy/20 text-navy text-sm hover:bg-navy/5 transition-all disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="ml-auto flex items-center gap-2 px-8 py-3 bg-navy text-white text-sm hover:bg-navy/90 transition-all"
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="ml-auto flex items-center gap-2 px-8 py-3 bg-navy text-white text-sm hover:bg-navy/90 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            ) : (
              <><CheckCircle size={16} /> Submit Application</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function Field({
  label, helpText, error, children,
}: {
  label: string; helpText?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-navy/50 mt-1.5">{helpText}</p>
      )}
      {error && (
        <p className={errorClass}><AlertCircle size={11} /> {error}</p>
      )}
    </div>
  )
}

function DocumentSlot({
  label, uploaded, onSelect, onRemove,
}: {
  label:    string
  uploaded?: UploadedFile
  onSelect: (file: File) => void
  onRemove: () => void
}) {
  const isUploading = uploaded?.uploading
  const isUploaded  = !!uploaded?.url
  const hasError    = !!uploaded?.error

  return (
    <div
      className={`border p-4 transition-all ${
        isUploaded
          ? 'border-green-300 bg-green-50'
          : hasError
          ? 'border-red-300 bg-red-50'
          : 'border-navy/15'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 shrink-0 ${isUploaded ? 'text-green-600' : 'text-navy/30'}`}>
            {isUploaded ? <CheckCircle size={18} /> : <FileText size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-navy font-medium truncate">{label}</p>
            {uploaded && !isUploading && (
              <p className="text-xs text-navy/50 truncate mt-0.5">
                {uploaded.file.name} ({(uploaded.file.size / 1024).toFixed(0)} KB)
              </p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 mt-1">{uploaded!.error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUploading ? (
            <Loader2 size={18} className="animate-spin text-navy/40" />
          ) : isUploaded ? (
            <button
              type="button"
              onClick={onRemove}
              className="text-navy/30 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <X size={18} />
            </button>
          ) : (
            <label className="flex items-center gap-1.5 px-3 py-1.5 border border-navy/20 text-navy text-xs hover:bg-navy hover:text-white transition-all cursor-pointer">
              <Upload size={13} />
              {hasError ? 'Retry' : 'Upload'}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onSelect(file)
                  e.target.value = ''
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs tracking-widest uppercase text-navy/40 mb-3 font-medium">{title}</h3>
      <div className="border border-navy/10 divide-y divide-navy/5">
        {children}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <span className="text-xs text-navy/50 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-navy flex-1">{value || '—'}</span>
    </div>
  )
}
