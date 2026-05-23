import type { Metadata } from 'next'
import Link from 'next/link'
import FadeUp from '@/components/animations/FadeUp'
import { ArrowRight, Clock } from 'lucide-react'
import type { Service } from '@/types'
import { DISCLAIMER } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Seven specialist UK document services — driving licence conversion, NI numbers, BRP, eVisa, banking and more.',
}

const STATIC_SERVICES: Service[] = [
  { id: '1', name: 'Driving Licence Conversion', slug: 'driving-licence-conversion', short_description: 'Convert your existing foreign driving licence to a full UK licence through the DVLA with expert end-to-end guidance.', full_description: null, timeline: '4–8 weeks', required_documents: null, price: 149, is_active: true, display_order: 1 },
  { id: '2', name: 'Theory Test Booking & Study Support', slug: 'theory-test-booking', short_description: 'Booking assistance plus curated study materials — arrive fully prepared and confident.', full_description: null, timeline: '1–2 weeks', required_documents: null, price: 89, is_active: true, display_order: 2 },
  { id: '3', name: 'Practical Test Booking Assistance', slug: 'practical-test-booking', short_description: 'DVSA-approved instructor referrals and practical driving test slot booking support.', full_description: null, timeline: '2–6 weeks', required_documents: null, price: 99, is_active: true, display_order: 3 },
  { id: '4', name: 'NI Number Application Support', slug: 'ni-number-application', short_description: 'End-to-end support for your National Insurance number application — done right, first time.', full_description: null, timeline: '2–4 weeks', required_documents: null, price: 129, is_active: true, display_order: 4 },
  { id: '5', name: 'BRP / eVisa Guidance', slug: 'brp-evisa-guidance', short_description: 'Biometric Residence Permit and eVisa support from people who know the system inside out.', full_description: null, timeline: '1–3 weeks', required_documents: null, price: 119, is_active: true, display_order: 5 },
  { id: '6', name: 'Address Proof Setup', slug: 'address-proof-setup', short_description: 'Establish verifiable UK address documentation — essential for banking, DVLA, and government applications.', full_description: null, timeline: '1–2 weeks', required_documents: null, price: 79, is_active: true, display_order: 6 },
  { id: '7', name: 'UK Bank Account Setup Guidance', slug: 'uk-bank-account-setup', short_description: 'High-street and digital bank account guidance for international clients navigating UK requirements.', full_description: null, timeline: '1–3 weeks', required_documents: null, price: 89, is_active: true, display_order: 7 },
]

export default async function ServicesPage() {
  let services: Service[] = STATIC_SERVICES
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data } = await supabase.from('services').select('*').eq('is_active', true).order('display_order', { ascending: true })
    if (data && data.length > 0) services = data
  } catch {
    // use static fallback when Supabase is not configured
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <p className="eyebrow text-white/50 mb-4">What We Offer</p>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6 text-balance">
              Seven services.
              <br />
              <em className="not-italic text-white/60">One trusted partner.</em>
            </h1>
          </FadeUp>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-navy/10">
            {services?.map((service: Service, i: number) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="bg-white p-10 group hover:bg-navy transition-all duration-500 flex flex-col"
              >
                <span className="font-serif text-4xl text-navy/15 group-hover:text-white/15 transition-colors duration-500 mb-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="font-serif text-2xl text-navy group-hover:text-white transition-colors duration-500 mb-3">
                  {service.name}
                </h2>
                <p className="text-sm text-navy/60 group-hover:text-white/60 font-light leading-relaxed flex-1 mb-6 transition-colors duration-500">
                  {service.short_description}
                </p>
                <div className="flex items-center justify-between">
                  {service.timeline && (
                    <span className="flex items-center gap-1.5 text-xs text-navy/40 group-hover:text-white/40 transition-colors duration-500">
                      <Clock size={12} />
                      {service.timeline}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-navy/40 group-hover:text-white/60 transition-colors duration-500 ml-auto">
                    Learn more <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-navy/[0.03] border-t border-navy/10">
        <div className="container-narrow">
          <p className="text-xs text-navy/50 font-light leading-relaxed">
            <span className="font-normal text-navy/70">Important: </span>
            {DISCLAIMER}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy text-white text-center">
        <div className="container-narrow">
          <FadeUp>
            <h2 className="font-serif text-4xl text-white mb-6">Ready to get started?</h2>
            <p className="text-white/60 font-light mb-8">Create your account and submit your first application today.</p>
            <Link href="/signup" className="inline-flex items-center gap-3 bg-white text-navy px-8 py-4 text-sm tracking-widest uppercase hover:bg-white/90 transition-colors">
              Start Application <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
