'use client'

import Link from 'next/link'
import FadeUp from '@/components/animations/FadeUp'
import StaggerContainer, { itemVariants } from '@/components/animations/StaggerContainer'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Users, Globe, Award } from 'lucide-react'

const values = [
  { icon: Shield, title: 'Legitimacy First', desc: 'Every service we provide goes through official UK government channels. No shortcuts, no grey areas.' },
  { icon: Users, title: 'Client-Centred', desc: 'We take on a limited number of cases at a time to ensure every client receives the attention they deserve.' },
  { icon: Globe, title: 'Internationally Minded', desc: 'We understand the challenges international clients face navigating an unfamiliar system. We bridge that gap.' },
  { icon: Award, title: 'Insiders\' Knowledge', desc: 'Our team has professional relationships and deep institutional knowledge of UK government processes.' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <p className="eyebrow text-white/50 mb-4">About Us</p>
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6 text-balance">
              Insiders who truly
              <br />
              <em className="not-italic text-white/60">know the process</em>
            </h1>
          </FadeUp>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeUp>
              <p className="eyebrow mb-4">Our Story</p>
              <h2 className="font-serif text-3xl text-navy mb-6">
                Born from a need we understood personally
              </h2>
              <div className="divider mb-8" />
              <div className="flex flex-col gap-5 text-sm text-navy leading-relaxed">
                <p>
                  UK Pathway Services was founded by a team of professionals operating from within the United Kingdom, with direct experience navigating the documentation systems that so many international clients find daunting.
                </p>
                <p>
                  We have developed strong professional relationships across the DVLA and other governmental departments responsible for issuing essential documents. This insider knowledge is what sets us apart.
                </p>
                <p>
                  We bridge the gap between international clients and the UK system — offering expert guidance, end-to-end support, and the peace of mind that comes from working with people who truly know the process.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="bg-navy p-10">
                <p className="font-serif text-2xl text-white mb-6 leading-relaxed">
                  &ldquo;We believe navigating UK documentation should not be an obstacle. It should be a clear, guided journey.&rdquo;
                </p>
                <div className="w-10 h-px bg-white/30 mb-4" />
                <p className="text-xs tracking-widest uppercase text-white/40">UK Pathway Services</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-navy/[0.03]">
        <div className="container-narrow">
          <FadeUp className="mb-14">
            <p className="eyebrow mb-4">What We Stand For</p>
            <h2 className="font-serif text-3xl text-navy">Our values</h2>
          </FadeUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={itemVariants} className="bg-white p-8 border border-navy/10">
                <div className="w-10 h-10 bg-navy flex items-center justify-center mb-5">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="font-serif text-xl text-navy mb-3">{title}</h3>
                <p className="text-sm text-navy leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy text-center">
        <div className="container-narrow">
          <FadeUp>
            <h2 className="font-serif text-4xl text-white mb-6">Work with us</h2>
            <p className="text-white/50 font-light mb-8 max-w-md mx-auto">
              Whether you have a question or are ready to submit your first application — we are here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-white text-navy px-8 py-4 text-sm tracking-widest uppercase hover:bg-white/90 transition-colors">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-3 border border-white/30 text-white px-8 py-4 text-sm tracking-widest uppercase hover:border-white/60 transition-colors">
                Contact Us
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
