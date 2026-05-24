import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ArrowRight, Clock, AlertCircle, CreditCard } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Case } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: cases }, { data: profile }, { data: bankDetails }] = await Promise.all([
    supabase
      .from('cases')
      .select('*, services(name, slug)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'bank_details')
      .single(),
  ])

  const allCases       = cases ?? []
  const activeCases    = allCases.filter((c) => !['completed', 'rejected'].includes(c.status))
  const pendingPayment = allCases.filter((c) => c.status === 'awaiting_payment')
  const bank           = bankDetails?.value as Record<string, string> | null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-2">Client Portal</p>
        <h1 className="font-serif text-3xl md:text-4xl text-navy">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
      </div>

      {/* ── Payment banners ── */}
      {pendingPayment.map((c: Case & { services?: { name: string } }) => (
        <div
          key={c.id}
          className="bg-amber-50 border border-amber-300 px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-start gap-4"
        >
          <CreditCard size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 mb-1">
              Deposit required — {c.services?.name}
            </p>
            <p className="text-xs text-amber-800 mb-3">
              Your documents have been reviewed. To proceed with processing your case
              please transfer the deposit using the details below and quote your reference number.
            </p>

            {bank ? (
              <div className="bg-white border border-amber-200 px-4 py-3 text-xs font-mono text-amber-900 grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-sm">
                <span className="text-amber-600 font-sans font-medium">Account name</span>
                <span>{bank.account_name}</span>
                <span className="text-amber-600 font-sans font-medium">Bank</span>
                <span>{bank.bank_name}</span>
                <span className="text-amber-600 font-sans font-medium">Sort code</span>
                <span>{bank.sort_code}</span>
                <span className="text-amber-600 font-sans font-medium">Account No.</span>
                <span>{bank.account_number}</span>
                <span className="text-amber-600 font-sans font-medium">Reference</span>
                <span className="font-bold">{c.case_number}</span>
              </div>
            ) : (
              <p className="text-xs text-amber-700">
                Our team will send you payment details shortly. Check your messages.
              </p>
            )}

            <Link
              href={`/dashboard/cases/${c.id}`}
              className="inline-block mt-3 text-xs text-amber-800 underline underline-offset-2"
            >
              View case details →
            </Link>
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total Cases',  value: allCases.length },
          { label: 'Active',       value: activeCases.length },
          { label: 'Completed',    value: allCases.filter((c) => c.status === 'completed').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-navy/10 p-4 md:p-6 text-center">
            <p className="font-serif text-2xl md:text-3xl text-navy mb-1">{value}</p>
            <p className="text-[10px] md:text-xs tracking-widest uppercase text-navy/40">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div className="bg-white border border-navy/10 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10">
          <h2 className="font-serif text-lg text-navy">My Cases</h2>
          <Link
            href="/dashboard/cases"
            className="text-xs tracking-widest uppercase text-navy/40 hover:text-navy flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {!allCases.length ? (
          <div className="p-10 text-center">
            <Clock size={28} className="mx-auto text-navy/20 mb-4" />
            <p className="font-serif text-xl text-navy mb-2">No cases yet</p>
            <p className="text-sm text-navy/50 font-light mb-6">
              Submit your first application to get started.
            </p>
            <Link href="/dashboard/apply" className="btn-primary text-xs">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-navy/5">
            {allCases.slice(0, 5).map((c: Case & { services?: { name: string } }) => (
              <Link
                key={c.id}
                href={`/dashboard/cases/${c.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-navy/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-normal text-navy">{c.services?.name}</p>
                  <p className="text-xs text-navy/40 mt-0.5">
                    {c.case_number} · {formatDate(c.created_at)}
                  </p>
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
        className="flex items-center justify-between bg-navy text-white px-6 py-5 hover:bg-navy/90 transition-colors group"
      >
        <div>
          <p className="font-serif text-lg">Start a new application</p>
          <p className="text-xs text-white/50 mt-0.5">Choose from 7 available services</p>
        </div>
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">
          <Plus size={16} /> New Case
        </div>
      </Link>
    </div>
  )
}
