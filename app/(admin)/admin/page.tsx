import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { count: totalCases },
    { count: activeCases },
    { count: totalClients },
    { data: recentCases },
  ] = await Promise.all([
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('*', { count: 'exact', head: true })
      .not('status', 'in', '("completed","rejected")'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('cases')
      .select('*, profiles(full_name), services(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div>
      <div className="mb-10">
        <p className="eyebrow mb-2">Admin Portal</p>
        <h1 className="font-serif text-3xl md:text-4xl text-navy">Overview</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Cases', value: totalCases ?? 0, href: '/admin/cases' },
          { label: 'Active Cases', value: activeCases ?? 0, href: '/admin/cases?status=active' },
          { label: 'Total Clients', value: totalClients ?? 0, href: '/admin/clients' },
        ].map(({ label, value, href }) => (
          <Link key={label} href={href} className="bg-white border border-navy/10 p-6 hover:shadow-card-hover transition-shadow">
            <p className="font-serif text-3xl text-navy mb-1">{value}</p>
            <p className="text-xs tracking-widest uppercase text-navy/40">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent cases */}
      <div className="bg-white border border-navy/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
          <h2 className="font-serif text-lg text-navy">Recent Cases</h2>
          <Link href="/admin/cases" className="text-xs tracking-widest uppercase text-navy/40 hover:text-navy flex items-center gap-1">
            All cases <ArrowRight size={12} />
          </Link>
        </div>

        {!recentCases?.length ? (
          <div className="p-12 text-center">
            <Clock size={32} className="mx-auto text-navy/20 mb-4" />
            <p className="text-navy/40 text-sm">No cases yet</p>
          </div>
        ) : (
          <div className="divide-y divide-navy/5">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cases/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-navy/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm text-navy">{(c.profiles as { full_name?: string })?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-navy/40 mt-0.5">
                    {(c.services as { name?: string })?.name} · {c.case_number} · {formatDate(c.created_at)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
