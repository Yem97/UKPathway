import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { FolderOpen, Plus } from 'lucide-react'
import type { CaseStatus } from '@/types'

export default async function ClientCasesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cases } = await supabase
    .from('cases')
    .select('*, services(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-1">Client Portal</p>
          <h1 className="font-serif text-3xl text-navy">My Cases</h1>
        </div>
        <Link href="/dashboard/apply" className="btn-primary text-xs flex items-center gap-2">
          <Plus size={14} /> New Application
        </Link>
      </div>

      {!cases?.length ? (
        <div className="bg-white border border-navy/10 p-16 text-center">
          <FolderOpen size={32} className="mx-auto text-navy/20 mb-4" />
          <p className="font-serif text-xl text-navy mb-2">No cases yet</p>
          <p className="text-sm text-navy/50 mb-6">Submit your first application to get started.</p>
          <Link href="/dashboard/apply" className="btn-primary text-xs">
            Start Application
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-navy/10 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.02]">
                {['Case #', 'Service', 'Status', 'Submitted', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-navy/50 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-navy/[0.02] transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-xs font-mono text-navy">{c.case_number}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-navy">
                      {(c.services as { name?: string })?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={c.status as CaseStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-navy">{formatDate(c.created_at)}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="text-xs tracking-widest uppercase text-navy hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
