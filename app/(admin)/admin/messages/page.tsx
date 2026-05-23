import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

export default async function AdminMessagesPage() {
  const supabase = createClient()

  // Get all cases that have messages, with the latest message
  const { data: threads } = await supabase
    .from('cases')
    .select(`
      id,
      case_number,
      profiles(full_name),
      services(name),
      case_messages(message, created_at, is_internal, profiles(full_name))
    `)
    .order('created_at', { ascending: false })

  // Only show cases with messages
  const withMessages = threads?.filter(
    (t) => Array.isArray(t.case_messages) && t.case_messages.length > 0
  ) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-1">Admin</p>
          <h1 className="font-serif text-3xl text-navy">Messages</h1>
        </div>
        <div className="text-sm text-navy/60">{withMessages.length} active thread{withMessages.length !== 1 ? 's' : ''}</div>
      </div>

      {!withMessages.length ? (
        <div className="bg-white border border-navy/10 p-16 text-center">
          <MessageSquare size={32} className="mx-auto text-navy/20 mb-4" />
          <p className="font-serif text-xl text-navy mb-2">No messages yet</p>
          <p className="text-sm text-navy/60">Client messages will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {withMessages.map((thread) => {
            const messages = Array.isArray(thread.case_messages) ? thread.case_messages : []
            const latest = messages[messages.length - 1]
            const clientName = (thread.profiles as { full_name?: string })?.full_name || 'Unknown'
            const serviceName = (thread.services as { name?: string })?.name || '—'

            return (
              <Link
                key={thread.id}
                href={`/admin/cases/${thread.id}`}
                className="bg-white border border-navy/10 p-5 hover:shadow-card-hover transition-shadow flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-serif text-lg text-navy">{clientName}</p>
                    <span className="text-xs font-mono text-navy/50">{thread.case_number}</span>
                    <span className="text-xs text-navy/50">· {serviceName}</span>
                  </div>
                  <p className="text-sm text-navy truncate">
                    {latest?.message || '—'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-navy/50">
                    {latest?.created_at ? formatDateTime(latest.created_at) : ''}
                  </p>
                  <span className="text-xs tracking-widest uppercase text-navy mt-2 inline-block">
                    {messages.length} msg{messages.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
