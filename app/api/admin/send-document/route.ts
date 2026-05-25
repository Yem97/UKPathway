import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify admin session ────────────────────────────────────────────
    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // ── 2. Parse form data ─────────────────────────────────────────────────
    const formData = await req.formData()
    const file   = formData.get('file')   as File   | null
    const caseId = formData.get('caseId') as string | null
    const label  = ((formData.get('label') as string | null) ?? '').trim() || 'Document'

    if (!file)   return NextResponse.json({ error: 'No file provided' },   { status: 400 })
    if (!caseId) return NextResponse.json({ error: 'No case ID provided' }, { status: 400 })

    const admin = createAdminClient()

    // ── 3. Verify case exists ──────────────────────────────────────────────
    const { data: caseRow } = await admin
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .single()

    if (!caseRow) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // ── 4. Upload file ─────────────────────────────────────────────────────
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path     = `${caseRow.user_id}/deliverables/${Date.now()}_${safeName}`
    const bytes    = await file.arrayBuffer()

    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('case-documents')
      .upload(path, bytes, { contentType: file.type, upsert: false })

    if (uploadErr) {
      return NextResponse.json({ error: `Storage error: ${uploadErr.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = admin.storage
      .from('case-documents')
      .getPublicUrl(uploadData.path)

    // ── 5. Save document record (is_admin_sent = true) ─────────────────────
    const { error: dbErr } = await admin.from('case_documents').insert({
      case_id:       caseId,
      file_url:      publicUrl,
      file_name:     file.name,
      label,
      uploaded_by:   user.id,
      is_admin_sent: true,
    })

    if (dbErr) {
      return NextResponse.json({ error: `Database error: ${dbErr.message}` }, { status: 500 })
    }

    // ── 6. Timeline event ──────────────────────────────────────────────────
    await admin.from('case_timeline').insert({
      case_id:           caseId,
      event_type:        'document_sent',
      event_description: `Document sent to client: ${label}`,
      created_by:        user.id,
    })

    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/dashboard/cases/${caseId}`)

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
