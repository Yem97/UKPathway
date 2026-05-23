'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import FadeUp from '@/components/animations/FadeUp'
import { ArrowRight, FileText, Search, Cog, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Create Your Account & Apply',
    description:
      'Sign up in minutes and choose the service you need. Complete the application form and upload any initial documents securely to your portal.',
    details: [
      'Free account creation',
      'Secure document upload',
      'Instant case number assigned',
      'Application confirmation emailed',
    ],
  },
  {
    number: '02',
    icon: Search,
    title: 'Expert Review Within 24 Hours',
    description:
      'Our team reviews every application personally. We assess your documents, check eligibility, and identify anything that needs attention before submission.',
    details: [
      'Personal case handler assigned',
      'Document completeness check',
      'Additional documents requested if needed',
      'Status updated in your portal',
    ],
  },
  {
    number: '03',
    icon: Cog,
    title: 'We Handle the Process',
    description:
      'Once your documents are in order, we guide you through every step — liaising with the relevant UK authorities and keeping you informed at each milestone.',
    details: [
      'Direct engagement with DVLA / HMRC / UKVI',
      'Real-time status updates',
      'Secure messaging with your case handler',
      'Transparent timeline tracking',
    ],
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Documents Delivered',
    description:
      'When your case is complete, you receive confirmation and all relevant documentation. Your case is archived securely in your portal for future reference.',
    details: [
      'Completion notification by email',
      'Documents accessible in your portal',
      'Case archived securely',
      'Ongoing support available',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <p className="eyebrow text-white/50 mb-4">The Process</p>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6 text-balance">
              Simple. Guided.
              <br />
              <em className="not-italic text-white/60">Certain.</em>
            </h1>
            <p className="text-lg text-white/50 font-light max-w-xl">
              Four clear steps — from application to completion. We handle the complexity so you don&apos;t have to.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-white">
        <div className="container-narrow">
          <div className="flex flex-col gap-0">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isEven = i % 2 === 1
              return (
                <FadeUp key={step.number} delay={i * 0.1}>
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${i < steps.length - 1 ? 'border-b border-navy/10' : ''}`}>
                    {/* Number + icon */}
                    <div className={`flex flex-col justify-center p-10 lg:p-16 bg-navy/[0.02] ${isEven ? 'lg:order-2' : ''}`}>
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-navy flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-white" />
                        </div>
                        <div>
                          <span className="block font-serif text-5xl text-navy/10 mb-2">{step.number}</span>
                          <h2 className="font-serif text-2xl text-navy mb-4">{step.title}</h2>
                          <p className="text-sm text-navy leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className={`flex flex-col justify-center p-10 lg:p-16 ${isEven ? 'lg:order-1' : ''}`}>
                      <ul className="flex flex-col gap-4">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-navy rounded-full mt-2 shrink-0" />
                            <span className="text-sm text-navy">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy text-center">
        <div className="container-narrow">
          <FadeUp>
            <h2 className="font-serif text-4xl text-white mb-6">Ready to begin?</h2>
            <p className="text-white/50 font-light mb-8">
              Create your account and submit your first application today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 bg-white text-navy px-8 py-4 text-sm tracking-widest uppercase hover:bg-white/90 transition-colors"
            >
              Start Application <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
