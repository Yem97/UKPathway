import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { CaseStatus } from '@/types'
import { Search } from 'lucide-react'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Docs Requested', value: 'documents_requested' },
  { label: 'Awaiting Payment', value: 'awaiting_payment' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
]

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const supabase = createClient()
  const status = searchParams.status || 'all'
  const query = searchParams.q || ''

  let dbQuery = supabase
    .from('cases')
    .select('*, profiles(full_name, email), services(name)')
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    dbQuery = dbQuery.eq('status', status as CaseStatus)
  }

  const { data: cases, error } = await dbQuery

  const filtered = cases?.filter((c) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      c.case_number?.toLowerCase().includes(q) ||
      (c.profiles as { full_name?: string })?.full_name?.toLowerCase().includes(q) ||
      (c.services as { name?: string })?.name?.toLowerCase().includes(q)
    )
  }) || []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="eyebrow mb-1">Admin</p>
          <h1 className="font-serif text-3xl text-navy">All Cases</h1>
        </div>
        <div className="text-sm text-navy/60">{filtered.length} case{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40" />
          <form>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by case number, client, or service…"
              className="w-full pl-9 pr-4 py-2.5 border border-navy/20 text-navy text-sm focus:outline-none focus:border-navy bg-white"
            />
            {status !== 'all' && <input type="hidden" name="status" value={status} />}
          </form>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/admin/cases?status=${f.value}${query ? `&q=${query}` : ''}`}
              className={`px-3 py-2 text-xs tracking-wider uppercase transition-colors ${
                status === f.value
                  ? 'bg-navy text-white'
                  : 'border border-navy/20 text-navy hover:border-navy'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-navy/10 overflow-x-auto">
        {!filtered.length ? (
          <div className="p-16 text-center">
            <p className="font-serif text-xl text-navy mb-2">No cases found</p>
            <p className="text-sm text-navy/60">
              {query || status !== 'all' ? 'Try adjusting your filters.' : 'No cases have been submitted yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.02]">
                {['Case #', 'Client', 'Service', 'Status', 'Submitted', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-navy/50 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-navy/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-navy">{c.case_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-navy">
                      {(c.profiles as { full_name?: string })?.full_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-navy">
                      {(c.services as { name?: string })?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-navy/70">{formatDate(c.created_at)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/cases/${c.id}`}
                      className="text-xs tracking-widest uppercase text-navy hover:underline"
                    >
                      Manage →
                    </Link>
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
