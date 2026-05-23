import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { ClientMessageComposer } from '@/components/client/ClientMessageComposer'
import { formatDate, formatDateTime } from '@/lib/utils'
import { STATUS_LABELS } from '@/types'
import type { CaseStatus } from '@/types'
import { Clock, FileText, MessageSquare } from 'lucide-react'

export default async function ClientCaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: caseData } = await supabase
    .from('cases')
    .select('*, services(name, timeline, required_documents, price)')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!caseData) notFound()

  const [{ data: messages }, { data: documents }, { data: timeline }] = await Promise.all([
    supabase
      .from('case_messages')
      .select('*, profiles(full_name)')
      .eq('case_id', params.id)
      .eq('is_internal', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('case_documents')
      .select('*')
      .eq('case_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('case_timeline')
      .select('*')
      .eq('case_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  const service = caseData.services as {
    name?: string
    timeline?: string
    required_documents?: string[]
    price?: number
  } | null

  const statusOrder: CaseStatus[] = [
    'submitted', 'under_review', 'documents_requested',
    'awaiting_payment', 'processing', 'completed',
  ]
  const currentIdx = statusOrder.indexOf(caseData.status as CaseStatus)

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/cases" className="text-xs tracking-widest uppercase text-navy/60 hover:text-navy mb-4 inline-flex items-center gap-1">
          ← My Cases
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <p className="eyebrow mb-1">{caseData.case_number}</p>
            <h1 className="font-serif text-3xl text-navy">{service?.name || 'Your Case'}</h1>
            <p className="text-sm text-navy/60 mt-1">Submitted {formatDate(caseData.created_at)}</p>
          </div>
          <StatusBadge status={caseData.status as CaseStatus} />
        </div>
      </div>

      {/* Progress tracker */}
      {caseData.status !== 'rejected' && (
        <div className="bg-white border border-navy/10 p-6 mb-6">
          <h2 className="font-serif text-lg text-navy mb-5">Application Progress</h2>
          <div className="flex items-center gap-0 overflow-x-auto">
            {statusOrder.map((s, i) => {
              const done = i < currentIdx
              const active = i === currentIdx
              return (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        done ? 'bg-navy text-white' : active ? 'bg-navy text-white ring-4 ring-navy/20' : 'bg-navy/10 text-navy/40'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <p className={`text-[10px] tracking-wider uppercase mt-2 text-center leading-tight ${active ? 'text-navy font-medium' : 'text-navy/40'}`}>
                      {STATUS_LABELS[s]}
                    </p>
                  </div>
                  {i < statusOrder.length - 1 && (
                    <div className={`h-px flex-1 mx-1 mb-5 ${i < currentIdx ? 'bg-navy' : 'bg-navy/10'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {caseData.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 p-5 mb-6">
          <p className="text-sm text-red-700 font-medium">This case has been rejected.</p>
          <p className="text-sm text-red-600 mt-1">Please contact us to discuss next steps.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Messages */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Messages
            </h2>

            {messages?.length ? (
              <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const isAdmin = msg.author_id !== user!.id
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 text-sm ${
                        isAdmin
                          ? 'bg-navy/5 text-navy mr-8'
                          : 'bg-navy text-white self-end ml-8'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isAdmin ? 'text-navy/50' : 'text-white/60'}`}>
                        {isAdmin ? 'UK Pathway Team' : 'You'} · {formatDateTime(msg.created_at)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-navy/40 mb-4">No messages yet. Send a message to your case manager.</p>
            )}

            <ClientMessageComposer caseId={params.id} />
          </div>

          {/* Timeline */}
          {!!timeline?.length && (
            <div className="bg-white border border-navy/10 p-6">
              <h2 className="font-serif text-lg text-navy mb-5 flex items-center gap-2">
                <Clock size={16} /> Activity
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
                      <p className="text-xs text-navy/50 mt-0.5">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">

          {/* Case info */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4">Case Info</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Reference</p>
                <p className="text-navy font-mono">{caseData.case_number}</p>
              </div>
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Status</p>
                <p className="text-navy">{STATUS_LABELS[caseData.status as CaseStatus]}</p>
              </div>
              {service?.timeline && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Estimated Timeline</p>
                  <p className="text-navy">{service.timeline}</p>
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

          {/* Awaiting payment notice */}
          {caseData.status === 'awaiting_payment' && service?.price && (
            <div className="bg-navy text-white p-6">
              <p className="font-serif text-lg mb-1">Payment Required</p>
              <p className="font-serif text-2xl mb-3">£{service.price.toFixed(2)}</p>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Please arrange a bank transfer and contact us with your payment reference.
              </p>
              <a
                href="mailto:admin@ukpathwayservices.com?subject=Payment Reference - Case {caseData.case_number}"
                className="block w-full text-center bg-white text-navy text-xs tracking-widest uppercase py-2.5 hover:bg-white/90 transition-colors"
              >
                Send Payment Reference
              </a>
            </div>
          )}

          {/* Documents requested notice */}
          {caseData.status === 'documents_requested' && service?.required_documents?.length && (
            <div className="bg-white border border-orange-200 p-6">
              <p className="font-serif text-lg text-navy mb-3">Documents Required</p>
              <ul className="flex flex-col gap-1">
                {service.required_documents.map((doc) => (
                  <li key={doc} className="text-xs text-navy flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span> {doc}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-navy/50 mt-4">Please email your documents to admin@ukpathwayservices.com with your case number.</p>
            </div>
          )}

          {/* Uploaded documents */}
          {!!documents?.length && (
            <div className="bg-white border border-navy/10 p-6">
              <h2 className="font-serif text-lg text-navy mb-3 flex items-center gap-2">
                <FileText size={16} /> Documents
              </h2>
              <div className="flex flex-col gap-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border border-navy/5 px-3 py-2">
                    <p className="text-xs text-navy truncate">{doc.label || doc.file_name || 'File'}</p>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-navy/50 hover:text-navy ml-2 shrink-0"
                    >
                      View →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Need help */}
          <div className="border border-navy/10 p-6">
            <p className="font-serif text-lg text-navy mb-2">Need Help?</p>
            <p className="text-xs text-navy/60 mb-4">Our team is available to answer your questions.</p>
            <a
              href="https://wa.me/44XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center btn-primary text-xs py-2.5"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
