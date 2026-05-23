'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import FadeUp from '@/components/animations/FadeUp'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Phone, Mail, MessageCircle, Facebook } from 'lucide-react'
import { EMAIL_ADDRESS, PHONE_NUMBER, WHATSAPP_NUMBER, FACEBOOK_URL } from '@/lib/utils'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSending(false)
    setSent(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <p className="eyebrow text-white/50 mb-4">Get In Touch</p>
            <h1 className="font-serif text-5xl md:text-6xl text-white text-balance">
              We&apos;re here to help
            </h1>
          </FadeUp>
        </div>
      </section>

      {/* Contact content */}
      <section className="section-padding bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact form */}
            <div>
              <FadeUp>
                <h2 className="font-serif text-2xl text-navy mb-8">Send us a message</h2>
              </FadeUp>

              {sent ? (
                <div className="bg-navy/[0.03] border border-navy/10 p-8 text-center">
                  <p className="font-serif text-xl text-navy mb-2">Message received</p>
                  <p className="text-sm text-navy font-light">
                    Thank you for reaching out. We will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Input label="Full Name" placeholder="John Smith" required />
                  <Input label="Email Address" type="email" placeholder="john@example.com" required />
                  <Input label="Phone Number" type="tel" placeholder="+44 7700 000000" />
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-navy mb-2">
                      Your Message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      required
                      className="input-field resize-none"
                    />
                  </div>
                  <Button type="submit" loading={sending} className="self-start">
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <FadeUp delay={0.2}>
              <h2 className="font-serif text-2xl text-navy mb-8">Other ways to reach us</h2>
              <div className="flex flex-col gap-6">
                {[
                  { icon: MessageCircle, label: 'WhatsApp', value: WHATSAPP_NUMBER, href: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}` },
                  { icon: Phone, label: 'Phone', value: PHONE_NUMBER, href: `tel:${PHONE_NUMBER}` },
                  { icon: Mail, label: 'Email', value: EMAIL_ADDRESS, href: `mailto:${EMAIL_ADDRESS}` },
                  { icon: Facebook, label: 'Facebook', value: 'UK Pathway Services', href: FACEBOOK_URL },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    className="flex items-start gap-4 p-5 border border-navy/10 hover:bg-navy hover:text-white group transition-all duration-300">
                    <div className="w-10 h-10 bg-navy/5 group-hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors duration-300">
                      <Icon size={18} className="text-navy group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-navy/40 group-hover:text-white/50 transition-colors duration-300 mb-1">{label}</p>
                      <p className="text-sm text-navy group-hover:text-white transition-colors duration-300 font-light">{value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-8 p-6 bg-navy/[0.03] border border-navy/10">
                <p className="text-xs text-navy/50 font-light leading-relaxed">
                  <span className="font-normal text-navy">Response times: </span>
                  We aim to respond to all enquiries within 24 hours during business days. WhatsApp is our fastest channel.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </>
  )
}
