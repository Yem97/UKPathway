import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ArrowRight, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Case } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cases } = await supabase
    .from('cases')
    .select('*, services(name, slug)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const activeCases = cases?.filter(
    (c) => !['completed', 'rejected'].includes(c.status)
  ).length || 0

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="eyebrow mb-2">Client Portal</p>
        <h1 className="font-serif text-3xl md:text-4xl text-navy">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Cases', value: cases?.length || 0 },
          { label: 'Active Cases', value: activeCases },
          { label: 'Completed', value: cases?.filter((c) => c.status === 'completed').length || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-navy/10 p-6">
            <p className="font-serif text-3xl text-navy mb-1">{value}</p>
            <p className="text-xs tracking-widest uppercase text-navy/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div className="bg-white border border-navy/10 mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
          <h2 className="font-serif text-lg text-navy">Recent Cases</h2>
          <Link href="/dashboard/cases" className="text-xs tracking-widest uppercase text-navy/40 hover:text-navy flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {!cases?.length ? (
          <div className="p-12 text-center">
            <Clock size={32} className="mx-auto text-navy/20 mb-4" />
            <p className="font-serif text-xl text-navy mb-2">No cases yet</p>
            <p className="text-sm text-navy/50 font-light mb-6">Submit your first application to get started.</p>
            <Link href="/dashboard/apply" className="btn-primary text-xs">
              Start Application
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-navy/5">
            {cases.map((c: Case & { services?: { name: string; slug: string } }) => (
              <Link
                key={c.id}
                href={`/dashboard/cases/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-navy/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-normal text-navy">{c.services?.name}</p>
                  <p className="text-xs text-navy/40 mt-0.5">{c.case_number} · {formatDate(c.created_at)}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New application CTA */}
      <Link
        href="/dashboard/apply"
        className="flex items-center justify-between bg-navy text-white px-8 py-5 hover:bg-navy-800 transition-colors group"
      >
        <div>
          <p className="font-serif text-lg">Start a new application</p>
          <p className="text-xs text-white/50 mt-0.5">Choose from 7 available services</p>
        </div>
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">
          <Plus size={16} />
          New Case
        </div>
      </Link>
    </div>
  )
}
