import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function AdminClientsPage() {
  const supabase = createClient()

  const { data: clients } = await supabase
    .from('profiles')
    .select('*, cases(id)')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-1">Admin</p>
          <h1 className="font-serif text-3xl text-navy">Clients</h1>
        </div>
        <div className="text-sm text-navy/60">{clients?.length || 0} registered</div>
      </div>

      <div className="bg-white border border-navy/10 overflow-x-auto">
        {!clients?.length ? (
          <div className="p-16 text-center">
            <Users size={32} className="mx-auto text-navy/20 mb-4" />
            <p className="font-serif text-xl text-navy mb-2">No clients yet</p>
            <p className="text-sm text-navy/60">Clients will appear here once they sign up.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.02]">
                {['Name', 'Country', 'Cases', 'Joined', 'Contact'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-navy/50 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-navy/[0.02] transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-sm text-navy font-medium">{client.full_name || '—'}</p>
                    <p className="text-xs text-navy/60 mt-0.5 font-mono">{client.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-navy">{client.country || '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-navy text-white text-xs font-mono">
                      {Array.isArray(client.cases) ? client.cases.length : 0}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-navy">{formatDate(client.created_at)}</span>
                  </td>
                  <td className="px-4 py-4">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase text-navy hover:underline"
                      >
                        WhatsApp →
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
