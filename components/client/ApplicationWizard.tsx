'use client'

import { useState, useCallback, useRef } from 'react'
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
  file:      File
  label:     string
  url?:      string
  uploading: boolean
  error?:    string
}

interface PersonalData {
  full_name:            string
  date_of_birth:        string
  nationality:          string
  phone:                string
  country_of_residence: string
  current_address:      string
  visa_status:          string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Your Details', icon: User },
  { label: 'Case Details', icon: ClipboardList },
  { label: 'Documents',    icon: FolderOpen },
  { label: 'Review',       icon: Eye },
]

const inputClass =
  'w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy bg-white rounded-none'
const labelClass = 'text-xs tracking-widest uppercase text-navy/60 block mb-2 font-medium'
const errorClass = 'text-xs text-red-600 mt-1.5 flex items-center gap-1'

// Countries — UK first, then alphabetical
const COUNTRIES = [
  'United Kingdom',
  'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus',
  'Belgium','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
  'Bulgaria','Cambodia','Cameroon','Canada','Chile','China','Colombia',
  'Congo (DRC)','Costa Rica','Croatia','Cyprus','Czech Republic','Denmark',
  'Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France',
  'Georgia','Germany','Ghana','Greece','Guatemala','Honduras','Hungary',
  'Iceland','India','Indonesia','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait',
  'Kyrgyzstan','Latvia','Lebanon','Libya','Lithuania','Luxembourg',
  'Malaysia','Mali','Malta','Mexico','Moldova','Morocco','Mozambique',
  'Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua',
  'Nigeria','North Macedonia','Norway','Oman','Pakistan','Panama',
  'Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia',
  'Sierra Leone','Singapore','Slovakia','Slovenia','Somalia','South Africa',
  'South Korea','South Sudan','Spain','Sri Lanka','Sudan','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Tunisia','Turkey','Turkmenistan','Uganda','Ukraine',
  'United Arab Emirates','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

const VISA_STATUSES = [
  'Not yet in the UK — planning to arrive',
  'UK Citizen / British Passport',
  'Indefinite Leave to Remain (ILR)',
  'Settled Status (EU Settlement Scheme)',
  'Pre-Settled Status',
  'Skilled Worker Visa',
  'Student Visa',
  'Family Visa (spouse / dependent)',
  'BNO Visa',
  'Graduate Visa',
  'Refugee / Humanitarian Protection',
  'Asylum Seeker',
  'Other — I will explain in my notes',
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

  const [step, setStep] = useState(0)

  // Step 1 — personal
  const [personal, setPersonal] = useState<PersonalData>({
    full_name:            profile?.full_name ?? '',
    date_of_birth:        '',
    nationality:          '',
    phone:                profile?.phone    ?? '',
    country_of_residence: profile?.country  ?? 'United Kingdom',
    current_address:      '',
    visa_status:          '',
  })
  const [personalErrors, setPersonalErrors] =
    useState<Partial<Record<keyof PersonalData, string>>>({})

  // Step 2 — service answers
  const [answers, setAnswers]           = useState<Record<string, string>>({})
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({})

  // Step 3 — documents
  const [uploads, setUploads]   = useState<UploadedFile[]>([])
  const [docError, setDocError] = useState('')

  // Step 4 — submit
  const [notes, setNotes]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState('')

  // Ref for the optional "extra document" file input (mobile Safari needs this)
  const extraFileRef = useRef<HTMLInputElement>(null)

  // ── Helpers ──────────────────────────────────────────────────────────────

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    // Clear error as soon as user picks something
    setAnswerErrors((prev) => ({ ...prev, [id]: '' }))
  }

  // ── Validation ───────────────────────────────────────────────────────────

  function validatePersonal(): boolean {
    const errs: Partial<Record<keyof PersonalData, string>> = {}
    if (!personal.full_name.trim())            errs.full_name            = 'Required'
    if (!personal.date_of_birth)               errs.date_of_birth        = 'Required'
    if (!personal.nationality.trim())          errs.nationality          = 'Required'
    if (!personal.phone.trim())                errs.phone                = 'Required'
    if (!personal.country_of_residence)        errs.country_of_residence = 'Required'
    if (!personal.current_address.trim())      errs.current_address      = 'Required'
    if (!personal.visa_status)                 errs.visa_status          = 'Required'
    setPersonalErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateAnswers(): boolean {
    const errs: Record<string, string> = {}
    questions.forEach((q) => {
      if (q.required && !answers[q.id]?.trim()) {
        errs[q.id] = 'Please answer this question'
      }
    })
    setAnswerErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── File upload ───────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(async (
    file:  File,
    label: string,
    index: number,
  ) => {
    setUploads((prev) => {
      const next = [...prev]
      next[index] = { file, label, uploading: true }
      return next
    })

    const supabase = createClient()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path     = `${userId}/${Date.now()}_${safeName}`

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

    setUploads((prev) => {
      const next = [...prev]
      next[index] = { file, label, uploading: false, url: publicUrl }
      return next
    })
  }, [userId])

  // ── Navigation ───────────────────────────────────────────────────────────

  function goNext() {
    if (step === 0 && !validatePersonal()) return
    if (step === 1 && !validateAnswers())  return
    if (step === 2) {
      const uploadedLabels = uploads.filter((u) => u.url).map((u) => u.label)
      const required       = service.required_documents ?? []
      const missing        = required.filter((d) => !uploadedLabels.includes(d))
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
          .map((u) => ({ file_url: u.url!, file_name: u.file.name, label: u.label })),
        notes,
      }
      await submitApplication(payload)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(msg)
      setSubmitting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          {STEPS.map((s, i) => {
            const Icon    = s.icon
            const done    = i < step
            const current = i === step
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                {/* Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 flex items-center justify-center border-2 transition-all ${
                      done    ? 'bg-navy border-navy'
                      : current ? 'bg-white border-navy'
                      : 'bg-white border-navy/20'
                    }`}
                  >
                    {done
                      ? <CheckCircle size={16} className="text-white" />
                      : <Icon size={14} className={current ? 'text-navy' : 'text-navy/25'} />
                    }
                  </div>
                  <span className={`text-[10px] tracking-wide mt-1 hidden sm:block ${
                    current ? 'text-navy font-medium' : done ? 'text-navy/50' : 'text-navy/25'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 transition-colors ${done ? 'bg-navy' : 'bg-navy/15'}`} />
                )}
              </div>
            )
          })}
        </div>
        <p className="sm:hidden text-center text-xs text-navy/60 font-medium mt-2">
          Step {step + 1} of {STEPS.length} — {STEPS[step].label}
        </p>
      </div>

      {/* ══ STEP 1 — Personal Details ══ */}
      {step === 0 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Your details</h2>
          <p className="text-sm text-navy/60 mb-8">
            We&apos;ve pre-filled what we have — please check and complete every field.
          </p>

          <div className="flex flex-col gap-5">
            {/* Full name */}
            <Field label="Full legal name" error={personalErrors.full_name}>
              <input
                className={inputClass}
                value={personal.full_name}
                onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })}
                placeholder="As it appears on your passport"
              />
            </Field>

            {/* DOB + Nationality */}
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

            {/* Phone */}
            <Field
              label="Phone number"
              error={personalErrors.phone}
              helpText="Include your country code, e.g. +234 803 000 0000"
            >
              <input
                type="tel"
                className={inputClass}
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                placeholder="+234 803 000 0000"
              />
            </Field>

            {/* Country of residence */}
            <Field label="Country of residence" error={personalErrors.country_of_residence}>
              <select
                className={`${inputClass} cursor-pointer`}
                value={personal.country_of_residence}
                onChange={(e) => setPersonal({ ...personal, country_of_residence: e.target.value })}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            {/* Current address */}
            <Field
              label="Current address"
              error={personalErrors.current_address}
              helpText="If you are not yet in the UK, enter your current home address."
            >
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={personal.current_address}
                onChange={(e) => setPersonal({ ...personal, current_address: e.target.value })}
                placeholder="House/flat number, street, city, postcode / zip"
              />
            </Field>

            {/* Visa status */}
            <Field
              label="UK immigration status"
              error={personalErrors.visa_status}
              helpText="Select 'Not yet in the UK' if you are still planning to arrive."
            >
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

      {/* ══ STEP 2 — Service Questions ══ */}
      {step === 1 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">About your case</h2>
          <p className="text-sm text-navy/60 mb-8">
            These details help our team prepare your{' '}
            <strong className="text-navy font-medium">{service.name}</strong> application.
          </p>

          {questions.length === 0 ? (
            <div className="bg-navy/5 border border-navy/10 p-6 text-center">
              <p className="text-sm text-navy/60">
                No additional questions for this service. Continue to document upload.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {questions.map((q) => (
                <Field key={q.id} label={q.label} helpText={q.helpText} error={answerErrors[q.id]}>

                  {/* Text */}
                  {q.type === 'text' && (
                    <input
                      className={inputClass}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                    />
                  )}

                  {/* Textarea */}
                  {q.type === 'textarea' && (
                    <textarea
                      rows={3}
                      className={`${inputClass} resize-none`}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                    />
                  )}

                  {/* Date */}
                  {q.type === 'date' && (
                    <input
                      type="date"
                      className={inputClass}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                    />
                  )}

                  {/* Select */}
                  {q.type === 'select' && (
                    <select
                      className={`${inputClass} cursor-pointer`}
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                    >
                      <option value="">— Select an option —</option>
                      {q.options?.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  )}

                  {/* Radio — each option is a <button> for reliable touch */}
                  {q.type === 'radio' && (
                    <div className="flex flex-col gap-2 mt-1">
                      {q.options?.map((o) => {
                        const selected = answers[q.id] === o
                        return (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setAnswer(q.id, o)}
                            className={`w-full flex items-center gap-3 px-4 py-3 border text-left transition-colors active:scale-[0.99] ${
                              selected
                                ? 'border-navy bg-navy/5'
                                : 'border-navy/20 hover:border-navy/50'
                            }`}
                          >
                            {/* Radio dot */}
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                selected ? 'border-navy' : 'border-navy/30'
                              }`}
                            >
                              {selected && (
                                <span className="w-2 h-2 rounded-full bg-navy block" />
                              )}
                            </span>
                            <span className={`text-sm ${selected ? 'text-navy font-medium' : 'text-navy/70'}`}>
                              {o}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Yes / No — large touch-friendly buttons */}
                  {q.type === 'yesno' && (
                    <div className="flex gap-3 mt-1">
                      {['Yes', 'No'].map((o) => {
                        const selected = answers[q.id] === o
                        return (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setAnswer(q.id, o)}
                            className={`flex-1 py-4 text-sm font-medium border transition-colors active:scale-[0.98] ${
                              selected
                                ? 'bg-navy text-white border-navy'
                                : 'bg-white text-navy/60 border-navy/20 hover:border-navy/60 hover:text-navy'
                            }`}
                          >
                            {o}
                          </button>
                        )
                      })}
                    </div>
                  )}

                </Field>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ STEP 3 — Document Upload ══ */}
      {step === 2 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Upload your documents</h2>
          <p className="text-sm text-navy/60 mb-2">
            Clear, legible copies only. Accepted formats: PDF, JPG, PNG (max 10 MB each).
          </p>
          <p className="text-xs text-navy/40 mb-6">
            You can photograph documents with your phone camera — just make sure all text
            is clear and the full document is in frame.
          </p>

          {docError && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {docError}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-6">
            {(service.required_documents ?? []).map((docLabel) => {
              const uploaded = uploads.find((u) => u.label === docLabel)
              return (
                <DocumentSlot
                  key={docLabel}
                  label={docLabel}
                  uploaded={uploaded}
                  onSelect={(file) => {
                    const existingIdx = uploads.findIndex((u) => u.label === docLabel)
                    const targetIdx   = existingIdx === -1 ? uploads.length : existingIdx
                    handleFileSelect(file, docLabel, targetIdx)
                  }}
                  onRemove={() =>
                    setUploads((prev) => prev.filter((u) => u.label !== docLabel))
                  }
                />
              )
            })}
          </div>

          {/* Optional extras */}
          <div className="border-t border-navy/10 pt-4">
            <p className="text-xs tracking-widest uppercase text-navy/40 mb-3">
              Additional documents (optional)
            </p>
            {/* button + ref pattern — avoids mobile Safari sr-only tap issue */}
            <button
              type="button"
              onClick={() => extraFileRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 border border-dashed border-navy/25 text-navy/50 hover:border-navy/60 hover:text-navy transition-all text-sm active:scale-[0.99]"
            >
              <Upload size={16} />
              Upload any other supporting document
            </button>
            <input
              ref={extraFileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file, 'Additional document', uploads.length)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      )}

      {/* ══ STEP 4 — Review & Submit ══ */}
      {step === 3 && (
        <div>
          <h2 className="font-serif text-2xl text-navy mb-1">Review your application</h2>
          <p className="text-sm text-navy/60 mb-8">
            Check everything below before submitting. You can go back to make changes.
          </p>

          {/* Service */}
          <ReviewSection title="Service Applied For">
            <ReviewRow label="Service"   value={service.name} />
            {service.price    && <ReviewRow label="Quoted fee"  value={`£${service.price.toFixed(2)}`} />}
            {service.timeline && <ReviewRow label="Timeline"    value={service.timeline} />}
          </ReviewSection>

          {/* Personal */}
          <ReviewSection title="Your Details">
            <ReviewRow label="Full name"    value={personal.full_name} />
            <ReviewRow label="Date of birth" value={personal.date_of_birth} />
            <ReviewRow label="Nationality"  value={personal.nationality} />
            <ReviewRow label="Phone"        value={personal.phone} />
            <ReviewRow label="Country"      value={personal.country_of_residence} />
            <ReviewRow label="Address"      value={personal.current_address} />
            <ReviewRow label="UK status"    value={personal.visa_status} />
          </ReviewSection>

          {/* Service answers */}
          {Object.keys(answers).filter((k) => answers[k]).length > 0 && (
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
              <p className="text-sm text-navy/40 italic px-4 py-3">No documents uploaded</p>
            ) : (
              uploads.filter((u) => u.url).map((u) => (
                <div key={u.url} className="flex items-center gap-3 px-4 py-3 border-b border-navy/5 last:border-0">
                  <FileText size={14} className="text-navy/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy truncate">{u.file.name}</p>
                    <p className="text-xs text-navy/40">{u.label}</p>
                  </div>
                  <CheckCircle size={14} className="text-green-600 shrink-0" />
                </div>
              ))
            )}
          </ReviewSection>

          {/* Notes */}
          <div className="mb-6">
            <label className={labelClass}>Additional notes (optional)</label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else our team should know about your situation…"
            />
          </div>

          {/* Declaration */}
          <div className="bg-navy/[0.03] border border-navy/10 px-5 py-4 mb-6 text-xs text-navy/60 leading-relaxed">
            By submitting this application I confirm that all information provided is accurate and
            that I am authorised to share the documents included. I understand that UK Pathway Services
            will review my application and contact me within 1–2 business days.
            <strong className="text-navy/80 block mt-1">
              No payment will be requested until my documents have been reviewed and I have agreed to proceed.
            </strong>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex gap-3 mt-10 pt-6 border-t border-navy/10">
        {step > 0 && (
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 border border-navy/20 text-navy text-sm hover:bg-navy/5 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="ml-auto flex items-center gap-2 px-8 py-3 bg-navy text-white text-sm hover:bg-navy/90 transition-all active:scale-[0.98]"
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="ml-auto flex items-center gap-2 px-8 py-3 bg-navy text-white text-sm hover:bg-navy/90 transition-all disabled:opacity-60 active:scale-[0.98]"
          >
            {submitting
              ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              : <><CheckCircle size={16} /> Submit Application</>
            }
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label, helpText, error, children,
}: {
  label: string; helpText?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {helpText && !error && <p className="text-xs text-navy/45 mt-1.5">{helpText}</p>}
      {error && <p className={errorClass}><AlertCircle size={11} />{error}</p>}
    </div>
  )
}

function DocumentSlot({
  label, uploaded, onSelect, onRemove,
}: {
  label:     string
  uploaded?: UploadedFile
  onSelect:  (file: File) => void
  onRemove:  () => void
}) {
  // useRef per slot — avoids mobile Safari sr-only tap issue
  const fileRef = useRef<HTMLInputElement>(null)

  const isUploading = uploaded?.uploading
  const isUploaded  = !!uploaded?.url
  const hasError    = !!uploaded?.error

  return (
    <div className={`border p-4 transition-all ${
      isUploaded ? 'border-green-300 bg-green-50'
      : hasError  ? 'border-red-300 bg-red-50'
      : 'border-navy/15 bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`shrink-0 ${isUploaded ? 'text-green-600' : 'text-navy/30'}`}>
          {isUploaded ? <CheckCircle size={20} /> : <FileText size={20} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-navy font-medium">{label}</p>
          {uploaded && !isUploading && (
            <p className="text-xs text-navy/50 truncate mt-0.5">
              {uploaded.file.name} · {(uploaded.file.size / 1024).toFixed(0)} KB
            </p>
          )}
          {hasError && <p className="text-xs text-red-600 mt-0.5">{uploaded!.error}</p>}
        </div>

        {/* Action */}
        {isUploading ? (
          <Loader2 size={20} className="animate-spin text-navy/40 shrink-0" />
        ) : isUploaded ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 p-1 text-navy/30 hover:text-red-500 transition-colors"
            title="Remove"
          >
            <X size={20} />
          </button>
        ) : (
          <>
            {/* button triggers the hidden input — works on mobile Safari */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 border border-navy/20 text-navy text-xs font-medium hover:bg-navy hover:text-white active:scale-[0.97] transition-all"
            >
              <Upload size={14} />
              {hasError ? 'Retry' : 'Upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onSelect(file)
                e.target.value = ''
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs tracking-widest uppercase text-navy/40 mb-2 font-medium">{title}</h3>
      <div className="border border-navy/10 divide-y divide-navy/5">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-xs text-navy/45 w-28 shrink-0 pt-0.5 leading-relaxed">{label}</span>
      <span className="text-sm text-navy flex-1 break-words">{value || '—'}</span>
    </div>
  )
}
