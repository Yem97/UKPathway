'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Application Submission ───────────────────────────────────────────────────

export interface SubmitApplicationPayload {
  serviceId:      string
  // Step 1 — personal details
  personal: {
    full_name:   string
    date_of_birth: string
    nationality: string
    phone:       string
    uk_address:  string
    visa_status: string
  }
  // Step 2 — service-specific answers
  serviceAnswers: Record<string, string>
  // Step 3 — uploaded document references
  documents: {
    file_url:  string
    file_name: string
    label:     string
  }[]
  // Additional notes from review step
  notes: string
}

export async function submitApplication(payload: SubmitApplicationPayload) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Merge all application data into the details JSONB column
  const details = {
    ...payload.personal,
    ...payload.serviceAnswers,
  }

  // 1. Create the case
  const { data: caseRow, error: caseErr } = await supabase
    .from('cases')
    .insert({
      user_id:    user.id,
      service_id: payload.serviceId,
      status:     'submitted',
      notes:      payload.notes || null,
      details,
    })
    .select('id, case_number')
    .single()

  if (caseErr) throw new Error(caseErr.message)

  // 2. Save document references
  if (payload.documents.length > 0) {
    const docRows = payload.documents.map((d) => ({
      case_id:     caseRow.id,
      file_url:    d.file_url,
      file_name:   d.file_name,
      label:       d.label,
      uploaded_by: user.id,
    }))
    const { error: docErr } = await supabase
      .from('case_documents')
      .insert(docRows)
    if (docErr) console.error('[submitApplication] doc insert error:', docErr.message)
  }

  // 3. Add timeline event
  await supabase.from('case_timeline').insert({
    case_id:          caseRow.id,
    event_type:       'submitted',
    event_description: 'Application submitted by client',
    created_by:       user.id,
  })

  // 4. Update profile with latest personal info
  await supabase.from('profiles').update({
    full_name: payload.personal.full_name,
    phone:     payload.personal.phone,
  }).eq('id', user.id)

  redirect(`/dashboard/cases/${caseRow.id}?submitted=1`)
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendClientMessage(caseId: string, message: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('case_messages').insert({
    case_id:   caseId,
    author_id: user.id,
    message:   message.trim(),
    is_internal: false,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/cases/${caseId}`)
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(fullName: string, phone: string, country: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone, country })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/profile')
}
