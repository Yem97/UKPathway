'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitApplication(serviceId: string, notes: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('cases')
    .insert({ user_id: user.id, service_id: serviceId, status: 'submitted', notes: notes || null })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  redirect(`/dashboard/cases/${data.id}`)
}

export async function sendClientMessage(caseId: string, message: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('case_messages').insert({
    case_id: caseId,
    author_id: user.id,
    message: message.trim(),
    is_internal: false,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/cases/${caseId}`)
}

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
