'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Shield, Clock, Users, Star } from 'lucide-react'
import FadeUp from '@/components/animations/FadeUp'
import StaggerContainer, { itemVariants } from '@/components/animations/StaggerContainer'
import AnimatedCounter from '@/components/animations/AnimatedCounter'
import { DISCLAIMER } from '@/lib/utils'

const services = [
  { number: '01', title: 'Driving Licence Conversion', description: 'Convert your existing licence to a full UK driving licence through the DVLA with expert end-to-end guidance.', slug: 'driving-licence-conversion' },
  { number: '02', title: 'Theory Test Booking', description: 'Booking assistance combined with curated study materials — arrive prepared and confident.', slug: 'theory-test-booking' },
  { number: '03', title: 'Practical Test Assistance', description: 'DVSA instructor referrals and practical test slot booking support.', slug: 'practical-test-booking' },
  { number: '04', title: 'NI Number Application', description: 'End-to-end support for your National Insurance number application — done right, first time.', slug: 'ni-number-application' },
  { number: '05', title: 'BRP / eVisa Guidance', description: 'Biometric Residence Permit and eVisa support from people who know the system inside out.', slug: 'brp-evisa-guidance' },
  { number: '06', title: 'Address Proof Setup', description: 'Establish verifiable UK address documentation — essential for banking, DVLA, and government applications.', slug: 'address-proof-setup' },
  { number: '07', title: 'UK Bank Account Setup', description: 'High-street and digital bank account guidance for international clients navigating UK requirements.', slug: 'uk-bank-account-setup' },
]

const stats = [
  { value: 500, suffix: '+', label: 'Cases Handled' },
  { value: 98, suffix: '%', label: 'Success Rate' },
  { value: 7, suffix: '', label: 'Core Services' },
  { value: 24, suffix: 'h', label: 'Avg. Response Time' },
]

const steps = [
  { step: '01', title: 'Submit Your Application', description: 'Create your account and submit your application in minutes. Tell us which service you need and upload any initial documents.' },
  { step: '02', title: 'Expert Review', description: 'Our team reviews your case within 24 hours. We may request additional documents to ensure everything is in order.' },
  { step: '03', title: 'We Handle It', description: 'We guide you through every step — liaising with the relevant authorities and keeping you informed throughout.' },
  { step: '04', title: 'Documents Delivered', description: 'Once complete, your documents and confirmation are delivered. Your case is archived in your secure portal.' },
]

const testimonials = [
  { quote: 'UK Pathway made my driving licence conversion completely stress-free. They knew exactly what the DVLA needed and guided me every step of the way.', name: 'Amara O.', detail: 'Driving Licence Conversion' },
  { quote: 'I was struggling to get my NI number sorted for months. UK Pathway sorted it in two weeks. Truly professional service.', name: 'Jean-Pierre M.', detail: 'NI Number Application' },
  { quote: 'The team is incredibly knowledgeable. My BRP application was handled with care and precision. Highly recommended.', name: 'Fatima K.', detail: 'BRP / eVisa Guidance' },
]

export default function HomePage() {
  return (
    <>
      {/* ── HERO (navy bg → white text) ── */}
      <section className="relative min-h-screen bg-gradient-navy flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

        <div className="container-narrow relative z-10 pt-32 pb-24">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-xs tracking-[0.25em] uppercase text-white/50 mb-6">
            UK Document Consultancy
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }} className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] mb-6 text-balance">
            Your trusted bridge
            <br />
            <em className="not-italic text-white/70">to UK documentation</em>
          </motion.h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.0, delay: 0.9 }} style={{ transformOrigin: 'left' }} className="w-20 h-px bg-white/40 mb-8" />

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }} className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mb-12">
            We operate from within the United Kingdom, with strong professional relationships across the DVLA and other governmental departments. Expert guidance. End-to-end support. Peace of mind.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3 }} className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-white text-navy px-8 py-4 text-xs tracking-widest uppercase font-normal hover:bg-white/90 transition-all duration-300">
              Start Your Application <ArrowRight size={14} />
            </Link>
            <Link href="/services" className="inline-flex items-center justify-center gap-3 border border-white/40 text-white px-8 py-4 text-xs tracking-widest uppercase font-normal hover:border-white hover:bg-white/5 transition-all duration-300">
              View Services
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS (navy bg → white text) ── */}
      <section className="bg-navy border-t border-white/10">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <div key={i} className="px-8 py-12 text-center">
                <div className="font-serif text-4xl md:text-5xl text-white mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs tracking-widest uppercase text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES (white bg → navy text) ── */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
            <FadeUp>
              <p className="eyebrow mb-3">What We Do</p>
              <h2 className="font-serif text-4xl md:text-5xl text-navy text-balance">
                Seven services.<br />One trusted partner.
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Link href="/services" className="inline-flex items-center gap-2 text-navy text-xs tracking-widest uppercase hover:opacity-60 transition-opacity group">
                View all services <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeUp>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-navy/10">
            {services.map((service) => (
              <motion.div key={service.slug} variants={itemVariants} className="bg-white p-8 group hover:bg-navy transition-all duration-500 cursor-pointer">
                <Link href={`/services/${service.slug}`} className="block h-full">
                  {/* Decorative number — intentionally faint */}
                  <span className="block font-serif text-3xl text-navy/15 group-hover:text-white/15 transition-colors duration-500 mb-6">
                    {service.number}
                  </span>
                  {/* Title — full navy on white, full white on navy */}
                  <h3 className="font-serif text-xl text-navy group-hover:text-white transition-colors duration-500 mb-3">
                    {service.title}
                  </h3>
                  {/* Description — navy on white, white/80 on navy */}
                  <p className="text-sm text-navy group-hover:text-white/80 leading-relaxed transition-colors duration-500 mb-6">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-navy/60 group-hover:text-white/70 transition-colors duration-500">
                    Learn more <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── WHY US (light bg → navy text) ── */}
      <section className="section-padding bg-navy/[0.04]">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="eyebrow mb-4">Why UK Pathway</p>
              <h2 className="font-serif text-4xl md:text-5xl text-navy mb-6 text-balance">
                Insiders who truly know the process
              </h2>
              <div className="divider mb-8" />
              <p className="text-base text-navy leading-relaxed mb-6">
                UK Pathway Services operates from within the United Kingdom, with strong professional
                relationships across the DVLA and other governmental departments responsible for
                issuing essential documents.
              </p>
              <p className="text-base text-navy leading-relaxed mb-10">
                We bridge the gap between international clients and the UK system — offering expert guidance,
                end-to-end support, and the peace of mind that comes from working with people who truly know
                what they are doing.
              </p>
              <Link href="/about" className="btn-secondary">About Us</Link>
            </FadeUp>

            <StaggerContainer className="flex flex-col gap-5" staggerDelay={0.1}>
              {[
                { icon: Shield, title: 'Fully Legitimate', desc: 'All applications submitted through official UK government channels. No shortcuts, no grey areas.' },
                { icon: Users, title: 'UK-Based Team', desc: 'Our team operates from within the UK with direct knowledge of every process.' },
                { icon: Clock, title: 'Fast Turnaround', desc: 'Most applications reviewed within 24 hours. We keep you updated at every step.' },
                { icon: CheckCircle, title: 'End-to-End Support', desc: 'From initial document check to final confirmation — we handle the entire journey.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={itemVariants} className="flex gap-4 p-6 bg-white border border-navy/10 shadow-card">
                  <div className="shrink-0 w-10 h-10 bg-navy flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-navy mb-1">{title}</h3>
                    <p className="text-sm text-navy leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ── PROCESS (navy bg → white text) ── */}
      <section className="section-padding bg-navy">
        <div className="container-wide">
          <FadeUp className="text-center mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-white/50 mb-4">The Process</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white">Simple. Guided. Certain.</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {steps.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1} className="bg-navy p-8">
                <span className="block font-serif text-5xl text-white/10 mb-6">{step.step}</span>
                <h3 className="font-serif text-xl text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{step.description}</p>
              </FadeUp>
            ))}
          </div>

          <FadeUp className="text-center mt-12">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 text-xs tracking-widest uppercase hover:bg-white hover:text-navy transition-all duration-300">
              See Full Process
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── TESTIMONIALS (white bg → navy text) ── */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <FadeUp className="text-center mb-16">
            <p className="eyebrow mb-4">Client Stories</p>
            <h2 className="font-serif text-4xl md:text-5xl text-navy">Trusted by hundreds</h2>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={itemVariants} className="card p-8 flex flex-col">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-navy text-navy" />
                  ))}
                </div>
                {/* Quote — solid navy */}
                <p className="text-base text-navy leading-relaxed mb-8 flex-1 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-serif text-navy text-lg">{t.name}</p>
                  <p className="text-xs tracking-widest uppercase text-navy/60 mt-1">{t.detail}</p>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── CTA (navy bg → white text) ── */}
      <section className="section-padding bg-gradient-navy text-center">
        <div className="container-narrow">
          <FadeUp>
            <p className="text-xs tracking-[0.25em] uppercase text-white/50 mb-6">Ready to Begin?</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 text-balance">
              Start your application today
            </h2>
            <div className="divider-light mx-auto mb-8" />
            <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto">
              Create your secure account, choose your service, and let our team handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-white text-navy px-8 py-4 text-xs tracking-widest uppercase hover:bg-white/90 transition-all duration-300">
                Create Free Account <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-3 border border-white/40 text-white px-8 py-4 text-xs tracking-widest uppercase hover:border-white transition-all duration-300">
                Talk to Us First
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
