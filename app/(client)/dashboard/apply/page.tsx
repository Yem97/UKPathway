import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Clock, ChevronRight, CheckCircle } from 'lucide-react'
import type { Service } from '@/types'

export default async function ApplyPage() {
  const supabase = createClient()

  const { data: services } = await supabase
    .from('services')
    .select('id, name, short_description, timeline, price, required_documents, slug, is_active')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="eyebrow mb-2">Client Portal</p>
        <h1 className="font-serif text-3xl md:text-4xl text-navy mb-3">
          Choose a Service
        </h1>
        <p className="text-sm text-navy/60 max-w-lg leading-relaxed">
          Select the service you need and we&apos;ll guide you through a simple application.
          Our team reviews every case personally and responds within 1–2 business days.
        </p>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(services as Service[])?.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-10 pt-6 border-t border-navy/10">
        <p className="text-xs text-navy/40 leading-relaxed text-center">
          All applications are reviewed by our specialist team. Fees are confirmed before
          any payment is requested. You will not be charged until your documents have been reviewed
          and you have agreed to proceed.
        </p>
      </div>
    </div>
  )
}

function ServiceCard({ service }: { service: Service }) {
  const docs = service.required_documents ?? []

  return (
    <Link
      href={`/dashboard/apply/${service.id}`}
      className="group bg-white border border-navy/10 p-6 hover:border-navy hover:shadow-sm transition-all flex flex-col"
    >
      {/* Name + arrow */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="font-serif text-xl text-navy group-hover:text-navy leading-tight">
          {service.name}
        </h2>
        <ChevronRight
          size={18}
          className="text-navy/30 group-hover:text-navy transition-colors mt-0.5 shrink-0"
        />
      </div>

      {/* Short description */}
      <p className="text-sm text-navy/60 font-light leading-relaxed mb-5 flex-1">
        {service.short_description}
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-between gap-4 mb-5">
        {service.price && (
          <div>
            <span className="text-xs tracking-widest uppercase text-navy/40 block mb-0.5">Fee</span>
            <span className="text-lg font-serif text-navy">£{service.price.toFixed(2)}</span>
          </div>
        )}
        {service.timeline && (
          <div className="text-right">
            <span className="text-xs tracking-widest uppercase text-navy/40 block mb-0.5">Timeline</span>
            <span className="text-sm text-navy flex items-center gap-1 justify-end">
              <Clock size={12} className="text-navy/40" />
              {service.timeline}
            </span>
          </div>
        )}
      </div>

      {/* Required documents preview */}
      {docs.length > 0 && (
        <div className="border-t border-navy/8 pt-4">
          <p className="text-[10px] tracking-widest uppercase text-navy/40 mb-2">
            You will need
          </p>
          <ul className="flex flex-col gap-1">
            {docs.slice(0, 3).map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-xs text-navy/60">
                <CheckCircle size={11} className="text-navy/30 mt-0.5 shrink-0" />
                {doc}
              </li>
            ))}
            {docs.length > 3 && (
              <li className="text-xs text-navy/40 pl-4">
                + {docs.length - 3} more documents
              </li>
            )}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="mt-5 pt-4 border-t border-navy/8">
        <span className="text-xs tracking-widest uppercase text-navy/50 group-hover:text-navy transition-colors flex items-center gap-1">
          Start application <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  )
}
