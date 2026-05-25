'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { CaseStatus } from '@/types'

// ── Shared helper — verifies admin session, returns user id ──────────────────
async function requireAdmin(): Promise<string> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user.id
}

// ─── Case status ──────────────────────────────────────────────────────────────

export async function updateCaseStatus(caseId: string, newStatus: CaseStatus) {
  const adminId = await requireAdmin()
  const admin   = createAdminClient()

  const { error } = await admin
    .from('cases')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', caseId)

  if (error) throw new Error(error.message)

  await admin.from('case_timeline').insert({
    case_id:           caseId,
    event_type:        newStatus,
    event_description: `Status updated to ${newStatus.replace(/_/g, ' ')}`,
    created_by:        adminId,
  })

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath('/admin/cases')
  revalidatePath(`/dashboard/cases/${caseId}`)
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendAdminMessage(caseId: string, message: string, isInternal = false) {
  const adminId = await requireAdmin()
  const admin   = createAdminClient()

  const { error } = await admin.from('case_messages').insert({
    case_id:     caseId,
    author_id:   adminId,
    message:     message.trim(),
    is_internal: isInternal,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath(`/dashboard/cases/${caseId}`)
}

// ─── Case notes ───────────────────────────────────────────────────────────────

export async function saveCaseNotes(caseId: string, notes: string) {
  await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('cases')
    .update({ notes })
    .eq('id', caseId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/cases/${caseId}`)
}

// ─── Payment details ──────────────────────────────────────────────────────────

export interface CasePaymentDetails {
  amount:         number
  account_name:   string
  bank_name:      string
  sort_code:      string
  account_number: string
  payment_method: string
  instructions:   string
}

export async function savePaymentDetails(caseId: string, details: CasePaymentDetails) {
  const adminId = await requireAdmin()
  const admin   = createAdminClient()

  const { error } = await admin
    .from('cases')
    .update({
      payment_details: details,
      status:          'awaiting_payment',
      updated_at:      new Date().toISOString(),
    })
    .eq('id', caseId)

  if (error) throw new Error(error.message)

  // Log to timeline so client knows payment details were sent
  await admin.from('case_timeline').insert({
    case_id:           caseId,
    event_type:        'awaiting_payment',
    event_description: 'Payment details sent — awaiting client payment',
    created_by:        adminId,
  })

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath(`/dashboard/cases/${caseId}`)
  revalidatePath('/dashboard')
}

// ─── Confirm payment ──────────────────────────────────────────────────────────

export async function confirmPayment(caseId: string) {
  const adminId = await requireAdmin()
  const admin   = createAdminClient()

  // Fetch case to get the service price and client id
  const { data: caseRow, error: fetchErr } = await admin
    .from('cases')
    .select('user_id, services(price)')
    .eq('id', caseId)
    .single()

  if (fetchErr || !caseRow) throw new Error('Case not found')

  const price = (caseRow.services as { price?: number } | null)?.price ?? 0

  // Record the payment
  await admin.from('payments').insert({
    case_id:        caseId,
    user_id:        caseRow.user_id,
    amount:         price,
    currency:       'GBP',
    status:         'paid',
    payment_method: 'bank_transfer',
    reference:      'Confirmed via payment screenshot',
  })

  // Advance to processing
  const { error: updateErr } = await admin
    .from('cases')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', caseId)

  if (updateErr) throw new Error(updateErr.message)

  // Timeline — visible to client
  await admin.from('case_timeline').insert({
    case_id:           caseId,
    event_type:        'payment_confirmed',
    event_description: 'Payment confirmed — your case is now being processed',
    created_by:        adminId,
  })

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath(`/dashboard/cases/${caseId}`)
  revalidatePath('/dashboard')
}

// ─── Reject payment proof ─────────────────────────────────────────────────────

export async function rejectPaymentProof(caseId: string) {
  const adminId = await requireAdmin()
  const admin   = createAdminClient()

  // Clear proof and send client back to payment step
  const { error } = await admin
    .from('cases')
    .update({
      payment_proof_url: null,
      status:            'awaiting_payment',
      updated_at:        new Date().toISOString(),
    })
    .eq('id', caseId)

  if (error) throw new Error(error.message)

  await admin.from('case_timeline').insert({
    case_id:           caseId,
    event_type:        'payment_rejected',
    event_description: 'Payment proof could not be verified — please upload a clearer screenshot',
    created_by:        adminId,
  })

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath(`/dashboard/cases/${caseId}`)
  revalidatePath('/dashboard')
}

// ─── Mark case paid (manual, legacy) ─────────────────────────────────────────

export async function markCasePaid(caseId: string, amount: number, reference: string) {
  const adminId = await requireAdmin()
  const admin   = createAdminClient()

  const { data: caseRow, error: fetchErr } = await admin
    .from('cases')
    .select('user_id')
    .eq('id', caseId)
    .single()

  if (fetchErr || !caseRow) throw new Error('Case not found')

  const { error: payError } = await admin.from('payments').insert({
    case_id:        caseId,
    user_id:        caseRow.user_id,
    amount,
    currency:       'GBP',
    status:         'paid',
    payment_method: 'bank_transfer',
    reference,
  })
  if (payError) throw new Error(payError.message)

  const { error: statusError } = await admin
    .from('cases')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', caseId)
  if (statusError) throw new Error(statusError.message)

  await admin.from('case_timeline').insert({
    case_id:           caseId,
    event_type:        'payment_confirmed',
    event_description: `Manual payment recorded — £${amount} (${reference})`,
    created_by:        adminId,
  })

  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath('/admin/cases')
}
