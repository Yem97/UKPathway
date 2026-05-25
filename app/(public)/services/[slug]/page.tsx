import { notFound } from 'next/navigation'
import Link from 'next/link'
import FadeUp from '@/components/animations/FadeUp'
import { ArrowRight, Clock, FileText, CheckCircle } from 'lucide-react'
import { DISCLAIMER } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

// Static fallback data (used if DB is unreachable)
const STATIC_SERVICES: Record<string, {
  name: string; slug: string; short_description: string; full_description: string
  timeline: string; required_documents: string[]; price: number
}> = {
  'driving-licence-conversion': {
    name: 'Driving Licence Conversion', slug: 'driving-licence-conversion',
    short_description: 'Convert your existing foreign driving licence to a full UK licence through the DVLA.',
    full_description: 'Converting a foreign driving licence to a UK licence can be a complex process depending on your country of origin. We guide you through every step — from eligibility assessment, to document preparation, to DVLA submission. Our team has handled hundreds of conversions and knows exactly what examiners look for.',
    timeline: '4–8 weeks',
    required_documents: ['Current foreign driving licence', 'Passport or national ID', 'Proof of UK address', 'DVLA D9 medical form (if required)', 'Passport-style photo'],
    price: 149,
  },
  'theory-test-booking': {
    name: 'Theory Test Booking & Study Support', slug: 'theory-test-booking',
    short_description: 'Booking assistance plus curated study materials.',
    full_description: 'We handle your theory test slot booking at a convenient test centre, and provide you with access to curated study materials tailored to the official DVSA question bank. We track your booking and send you reminders so nothing slips through.',
    timeline: '1–2 weeks to book',
    required_documents: ['Provisional UK driving licence (or we can help you get one)', 'Valid passport or photo ID'],
    price: 89,
  },
  'practical-test-booking': {
    name: 'Practical Test Booking Assistance', slug: 'practical-test-booking',
    short_description: 'DVSA-approved instructor referrals and practical test slot booking support.',
    full_description: 'Finding a qualified DVSA-approved instructor and securing a practical test slot at the right time can be frustrating. We source instructor referrals matched to your location, and handle the slot booking process on your behalf — including monitoring cancellations for earlier dates.',
    timeline: '2–6 weeks',
    required_documents: ['Provisional UK driving licence', 'Theory test pass certificate', 'Valid passport or photo ID'],
    price: 99,
  },
  'ni-number-application': {
    name: 'NI Number Application Support', slug: 'ni-number-application',
    short_description: 'End-to-end support for your National Insurance number application.',
    full_description: 'A National Insurance number is essential for working in the UK, paying tax, and accessing many services. We guide you through the full application process, prepare your documentation, and ensure everything is submitted correctly to HMRC. Our success rate is over 98%.',
    timeline: '2–4 weeks',
    required_documents: ['Passport or biometric residence permit', 'Proof of UK address', 'Evidence of right to work', 'Proof of reason for needing NI number'],
    price: 129,
  },
  'brp-evisa-guidance': {
    name: 'BRP / eVisa Guidance', slug: 'brp-evisa-guidance',
    short_description: 'Biometric Residence Permit and eVisa support.',
    full_description: 'Navigating BRP collection, eVisa setup, and UKVI correspondence can be overwhelming. We provide step-by-step guidance for BRP collection, eVisa account creation and management, and help you understand your immigration status documentation so you can live and work in the UK with confidence.',
    timeline: '1–3 weeks',
    required_documents: ['Decision letter from UKVI', 'Passport', 'Vignette visa (if applicable)', 'UK address details'],
    price: 119,
  },
  'address-proof-setup': {
    name: 'Address Proof Setup', slug: 'address-proof-setup',
    short_description: 'Establish verifiable UK address documentation.',
    full_description: 'Many UK processes require proof of a UK address. We help international clients establish the right documentation — working with legitimate and verifiable solutions that are accepted by the DVLA, banks, and other institutions. This is a common first step for newly arrived clients.',
    timeline: '1–2 weeks',
    required_documents: ['Passport', 'Current visa or immigration status document'],
    price: 79,
  },
  'uk-bank-account-setup': {
    name: 'UK Bank Account Setup Guidance', slug: 'uk-bank-account-setup',
    short_description: 'High-street and digital bank account guidance for international clients.',
    full_description: 'Opening a UK bank account as a new arrival can be surprisingly difficult. We guide you through the best options — high-street banks and digital alternatives — based on your circumstances, help you prepare the correct documentation, and accompany you through the process with ongoing support.',
    timeline: '1–3 weeks',
    required_documents: ['Passport', 'Proof of UK address', 'Proof of income or employment (if required)', 'NI number (if available)'],
    price: 89,
  },
}

export const revalidate = 60 // re-fetch from DB at most every 60 seconds

export function generateStaticParams() {
  return Object.keys(STATIC_SERVICES).map((slug) => ({ slug }))
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const fallback = STATIC_SERVICES[params.slug]
  if (!fallback) notFound()

  // Try to load live data (price + documents) from the database
  let service = fallback
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('services')
      .select('name, slug, short_description, full_description, timeline, required_documents, price')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (data) {
      service = {
        ...fallback,          // keep static full_description if DB has none
        ...data,
        full_description: data.full_description ?? fallback.full_description,
        required_documents:
          Array.isArray(data.required_documents) && data.required_documents.length > 0
            ? data.required_documents
            : fallback.required_documents,
      }
    }
  } catch {
    // fall through to static data
  }

  return (
    <>
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <Link href="/services" className="eyebrow text-white/40 hover:text-white/70 mb-6 inline-flex items-center gap-2 transition-colors">
              ← All Services
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 text-balance">{service.name}</h1>
            <div className="flex items-center gap-6 mt-4">
              <span className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={12} /> {service.timeline}
              </span>
              {service.price > 0 && (
                <span className="text-xs text-white/40">
                  From £{service.price} · 50% deposit upfront
                </span>
              )}
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <FadeUp>
                <p className="eyebrow mb-4">Overview</p>
                <h2 className="font-serif text-2xl text-navy mb-6">About this service</h2>
                <div className="divider mb-8" />
                <p className="text-navy leading-relaxed text-base">{service.full_description}</p>
              </FadeUp>
            </div>

            <div className="flex flex-col gap-6">
              <FadeUp delay={0.15}>
                <div className="border border-navy/10 p-6">
                  <h3 className="font-serif text-lg text-navy mb-4 flex items-center gap-2">
                    <FileText size={16} /> Documents Required
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {service.required_documents.map((doc) => (
                      <li key={doc} className="flex items-start gap-2 text-sm text-navy font-light">
                        <CheckCircle size={14} className="text-navy/30 shrink-0 mt-0.5" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>

              <FadeUp delay={0.25}>
                <div className="bg-navy p-6">
                  {service.price > 0 && (
                    <>
                      {/* Total fee */}
                      <p className="font-serif text-3xl text-white mb-1">
                        £{service.price}
                      </p>
                      <p className="text-xs text-white/40 mb-5">
                        Total consultancy fee · Government fees separate
                      </p>

                      {/* Payment split */}
                      <div className="border border-white/10 mb-5">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                          <span className="text-xs text-white/60">Deposit due upfront</span>
                          <span className="text-sm font-medium text-white">
                            £{(service.price / 2).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-xs text-white/60">Remainder on completion</span>
                          <span className="text-sm font-medium text-white">
                            £{(service.price / 2).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <Link
                    href="/signup"
                    className="block text-center bg-white text-navy px-6 py-3 text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
                  >
                    Start Application <ArrowRight size={12} className="inline ml-1" />
                  </Link>
                </div>
              </FadeUp>
            </div>
          </div>

          <div className="mt-12 p-6 bg-navy/[0.03] border border-navy/10">
            <p className="text-xs text-navy/50 font-light leading-relaxed">
              <span className="font-normal text-navy/70">Disclaimer: </span>{DISCLAIMER}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
