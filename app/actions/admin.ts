'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { CaseStatus } from '@/types'

export async function updateCaseStatus(caseId: string, newStatus: CaseStatus) {
  const supabase = createClient()
  const { error } = await supabase
    .from('cases')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', caseId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/cases/${caseId}`)
  revalidatePath('/admin/cases')
}

export async function sendAdminMessage(caseId: string, message: string, isInternal = false) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('case_messages').insert({
    case_id: caseId,
    author_id: user?.id,
    message: message.trim(),
    is_internal: isInternal,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/cases/${caseId}`)
}

export async function saveCaseNotes(caseId: string, notes: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('cases')
    .update({ notes })
    .eq('id', caseId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/cases/${caseId}`)
}

export async function markCasePaid(caseId: string, amount: number, reference: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const caseRow = await supabase.from('cases').select('user_id').eq('id', caseId).single()
  if (caseRow.error) throw new Error(caseRow.error.message)

  const { error: payError } = await supabase.from('payments').insert({
    case_id: caseId,
    user_id: caseRow.data.user_id,
    amount,
    currency: 'GBP',
    status: 'paid',
    payment_method: 'bank_transfer',
    reference,
  })
  if (payError) throw new Error(payError.message)

  const { error: statusError } = await supabase
    .from('cases')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', caseId)
  if (statusError) throw new Error(statusError.message)

  revalidatePath(`/admin/cases/${caseId}`)
}
