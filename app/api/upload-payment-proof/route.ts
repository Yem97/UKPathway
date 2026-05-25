import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify session ──────────────────────────────────────────────────
    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // ── 2. Parse form data ─────────────────────────────────────────────────
    const formData = await req.formData()
    const file     = formData.get('file')   as File   | null
    const caseId   = formData.get('caseId') as string | null

    if (!file)   return NextResponse.json({ error: 'No file provided' },   { status: 400 })
    if (!caseId) return NextResponse.json({ error: 'No case ID provided' }, { status: 400 })

    const admin = createAdminClient()

    // ── 3. Ownership check (manual RLS equivalent) ─────────────────────────
    const { data: existing } = await admin
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Case not found or access denied' }, { status: 403 })
    }

    // ── 4. Upload file via admin client (bypasses storage RLS) ─────────────
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path     = `${user.id}/payment_${Date.now()}_${safeName}`
    const bytes    = await file.arrayBuffer()

    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('case-documents')
      .upload(path, bytes, { contentType: file.type, upsert: false })

    if (uploadErr) {
      return NextResponse.json(
        { error: `Storage error: ${uploadErr.message}` },
        { status: 500 },
      )
    }

    const { data: { publicUrl } } = admin.storage
      .from('case-documents')
      .getPublicUrl(uploadData.path)

    // ── 5. Update case record ──────────────────────────────────────────────
    const { error: updateErr } = await admin
      .from('cases')
      .update({
        payment_proof_url: publicUrl,
        status:            'payment_submitted',
        updated_at:        new Date().toISOString(),
      })
      .eq('id', caseId)

    if (updateErr) {
      return NextResponse.json(
        { error: `Database error: ${updateErr.message}` },
        { status: 500 },
      )
    }

    // ── 6. Timeline event ──────────────────────────────────────────────────
    await admin.from('case_timeline').insert({
      case_id:           caseId,
      event_type:        'payment_submitted',
      event_description: 'Payment proof uploaded — awaiting admin confirmation',
      created_by:        user.id,
    })

    // ── 7. Revalidate cached pages ─────────────────────────────────────────
    revalidatePath(`/dashboard/cases/${caseId}`)
    revalidatePath('/dashboard')

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
