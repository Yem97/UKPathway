import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { StatusUpdater } from '@/components/admin/StatusUpdater'
import { StatusActionButton } from '@/components/admin/StatusActionButton'
import { MessageComposer } from '@/components/admin/MessageComposer'
import { PaymentPanel } from '@/components/admin/PaymentPanel'
import { PaymentConfirmPanel } from '@/components/admin/PaymentConfirmPanel'
import { NotesEditor } from '@/components/admin/NotesEditor'
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils'
import type { CaseStatus } from '@/types'
import { FileText, MessageSquare, Clock, AlertCircle, Download, User } from 'lucide-react'

export default async function AdminCaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select(`
      *,
      profiles(id, full_name, phone, country, created_at),
      services(name, slug, price, timeline)
    `)
    .eq('id', params.id)
    .single()

  if (!caseData) notFound()

  const { data: { user: adminUser } } = await supabase.auth.getUser()

  // Use admin client for messages so client replies are visible
  // (session-client RLS only returns messages the admin authored)
  const admin = createAdminClient()

  const [{ data: messages }, { data: documents }, { data: timeline }, { data: payments }] =
    await Promise.all([
      admin
        .from('case_messages')
        .select('*, profiles(full_name)')
        .eq('case_id', params.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', params.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_timeline')
        .select('*, profiles(full_name)')
        .eq('case_id', params.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .eq('case_id', params.id)
        .order('created_at', { ascending: false }),
    ])

  const client = caseData.profiles as { id?: string; full_name?: string; phone?: string; country?: string; created_at?: string } | null
  const service = caseData.services as { name?: string; slug?: string; price?: number; timeline?: string } | null
  const isPaid = !!payments?.length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/cases" className="text-xs tracking-widest uppercase text-navy/60 hover:text-navy mb-4 inline-flex items-center gap-1">
          ← All Cases
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <p className="eyebrow mb-1">Case {caseData.case_number}</p>
            <h1 className="font-serif text-3xl text-navy">{client?.full_name || 'Unknown Client'}</h1>
            <p className="text-sm text-navy/60 mt-1">{service?.name || '—'}</p>
          </div>
          <StatusBadge status={caseData.status as CaseStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left column ─── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Status updater */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4">Update Status</h2>
            <StatusUpdater caseId={params.id} current={caseData.status as CaseStatus} />
          </div>

          {/* Timeline */}
          {!!timeline?.length && (
            <div className="bg-white border border-navy/10 p-6">
              <h2 className="font-serif text-lg text-navy mb-5 flex items-center gap-2">
                <Clock size={16} /> Timeline
              </h2>
              <div className="flex flex-col gap-0">
                {timeline.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-navy mt-1.5 shrink-0" />
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-navy/10 my-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-navy">{entry.event_description}</p>
                      <p className="text-xs text-navy/50 mt-0.5">
                        {formatDateTime(entry.created_at)}
                        {(entry.profiles as { full_name?: string })?.full_name
                          ? ` · ${(entry.profiles as { full_name?: string }).full_name}`
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message thread */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Messages
              {!!messages?.length && (
                <span className="text-xs font-mono text-navy/50 ml-auto">{messages.length}</span>
              )}
            </h2>

            {messages?.length ? (
              <div className="flex flex-col gap-3 mb-4 max-h-96 overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const authorName  = (msg.profiles as { full_name?: string })?.full_name || 'Unknown'
                  // Use admin user ID for reliable detection — avoids null client?.id issue
                  const isMine      = msg.author_id === adminUser?.id
                  const isInternal  = msg.is_internal

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 text-sm rounded-sm ${
                        isInternal
                          ? 'bg-yellow-50 border border-yellow-200 text-navy/70 italic'
                          : isMine
                          ? 'bg-navy text-white'
                          : 'bg-navy/[0.06] text-navy'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1.5 ${isMine && !isInternal ? 'text-white/60' : 'text-navy/50'}`}>
                          {isMine ? 'You' : authorName} · {formatDateTime(msg.created_at)}
                          {isInternal && ' · Internal note'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-navy/40 mb-4">No messages yet.</p>
            )}

            <MessageComposer caseId={params.id} />
          </div>

          {/* Documents */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4 flex items-center gap-2">
              <FileText size={16} /> Documents
              {!!documents?.length && (
                <span className="text-xs font-mono text-navy/50 ml-auto">{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
              )}
            </h2>
            {documents?.length ? (
              <div className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border border-navy/10 px-4 py-3">
                    <div>
                      <p className="text-sm text-navy">{doc.label || doc.file_name || 'Untitled'}</p>
                      <p className="text-xs text-navy/50 mt-0.5">{formatDate(doc.created_at)}</p>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-widest uppercase text-navy hover:underline flex items-center gap-1"
                    >
                      <Download size={12} /> View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy/40">No documents uploaded yet.</p>
            )}
          </div>

          {/* Internal notes */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4 flex items-center gap-2">
              <FileText size={16} /> Internal Notes
            </h2>
            <NotesEditor caseId={params.id} initialNotes={caseData.notes || ''} />
          </div>
        </div>

        {/* ─── Right sidebar ─── */}
        <div className="flex flex-col gap-5">

          {/* Client info */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4 flex items-center gap-2">
              <User size={16} /> Client
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-navy">{client?.full_name || '—'}</p>
              </div>
              {client?.phone && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Phone</p>
                  <a
                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy hover:underline"
                  >
                    {client.phone} →
                  </a>
                </div>
              )}
              {client?.country && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Country</p>
                  <p className="text-navy">{client.country}</p>
                </div>
              )}
              {client?.created_at && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Member since</p>
                  <p className="text-navy">{formatDate(client.created_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Case details */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4">Case Details</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Case Number</p>
                <p className="text-navy font-mono">{caseData.case_number}</p>
              </div>
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Service</p>
                <p className="text-navy">{service?.name || '—'}</p>
              </div>
              {service?.timeline && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Timeline</p>
                  <p className="text-navy">{service.timeline}</p>
                </div>
              )}
              {service?.price && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Service Fee</p>
                  <p className="text-navy font-medium">{formatCurrency(service.price)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Submitted</p>
                <p className="text-navy">{formatDate(caseData.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Last Updated</p>
                <p className="text-navy">{formatDate(caseData.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Payment proof confirmation */}
          {caseData.status === 'payment_submitted' && caseData.payment_proof_url && (
            <PaymentConfirmPanel
              caseId={params.id}
              proofUrl={caseData.payment_proof_url}
              clientName={client?.full_name || 'Client'}
              servicePrice={service?.price ?? null}
            />
          )}

          {/* Payment details form — shown when awaiting payment */}
          {(caseData.status === 'awaiting_payment' || caseData.payment_details) && (
            <PaymentPanel
              caseId={params.id}
              status={caseData.status}
              servicePrice={service?.price ?? null}
              savedDetails={caseData.payment_details as import('@/app/actions/admin').CasePaymentDetails | null}
            />
          )}

          {/* Payment history */}
          {!!payments?.length && (
            <div className="bg-white border border-navy/10 p-6">
              <h2 className="font-serif text-lg text-navy mb-3">Payment History</h2>
              {payments.map((p) => (
                <div key={p.id} className="text-sm border-b border-navy/5 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-navy font-medium">{formatCurrency(p.amount || 0)}</span>
                    <span className="text-green-700 text-xs uppercase tracking-wider">{p.status}</span>
                  </div>
                  <p className="text-xs text-navy/50 mt-0.5">{p.reference} · {formatDate(p.created_at)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <StatusActionButton caseId={params.id} status="under_review" label="→ Move to Under Review" />
              <StatusActionButton caseId={params.id} status="documents_requested" label="→ Request Documents" />
              <StatusActionButton caseId={params.id} status="awaiting_payment" label="→ Request Payment" />
              <StatusActionButton caseId={params.id} status="payment_submitted" label="→ Mark Payment Submitted" />
              <StatusActionButton caseId={params.id} status="processing" label="→ Mark as Processing" />
              <StatusActionButton caseId={params.id} status="completed" label="✓ Mark Completed" />
            </div>
          </div>

          {/* Danger zone */}
          <div className="border border-red-200 p-6">
            <h2 className="font-serif text-lg text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Danger Zone
            </h2>
            <StatusActionButton caseId={params.id} status="rejected" label="Reject Case" variant="danger" />
          </div>
        </div>
      </div>
    </div>
  )
}
