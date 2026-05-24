import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApplicationWizard } from '@/components/client/ApplicationWizard'
import type { Service, Profile } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { serviceId: string }
}

export default async function ApplicationPage({ params }: Props) {
  const supabase = createClient()

  const [
    { data: service },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('id', params.serviceId)
      .eq('is_active', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!service || !user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/apply"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-navy/50 hover:text-navy mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> All Services
      </Link>

      {/* Service header */}
      <div className="mb-10 pb-8 border-b border-navy/10">
        <p className="eyebrow mb-2">New Application</p>
        <h1 className="font-serif text-3xl md:text-4xl text-navy mb-3">
          {service.name}
        </h1>
        <div className="flex flex-wrap gap-6 text-sm text-navy/60">
          {service.price && (
            <span>
              <span className="text-xs tracking-widest uppercase text-navy/40 mr-2">Fee</span>
              <span className="text-navy font-medium">£{service.price.toFixed(2)}</span>
            </span>
          )}
          {service.timeline && (
            <span>
              <span className="text-xs tracking-widest uppercase text-navy/40 mr-2">Timeline</span>
              {service.timeline}
            </span>
          )}
        </div>
      </div>

      <ApplicationWizard
        service={service as Service}
        profile={profile as Profile | null}
        userId={user.id}
      />
    </div>
  )
}
