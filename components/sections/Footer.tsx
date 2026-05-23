import Link from 'next/link'
import { Phone, Mail, Facebook, MessageCircle } from 'lucide-react'
import { DISCLAIMER, EMAIL_ADDRESS, PHONE_NUMBER, WHATSAPP_NUMBER, FACEBOOK_URL } from '@/lib/utils'

const serviceLinks = [
  { href: '/services/driving-licence-conversion', label: 'Driving Licence Conversion' },
  { href: '/services/theory-test-booking', label: 'Theory Test Booking' },
  { href: '/services/practical-test-booking', label: 'Practical Test Booking' },
  { href: '/services/ni-number-application', label: 'NI Number Application' },
  { href: '/services/brp-evisa-guidance', label: 'BRP / eVisa Guidance' },
  { href: '/services/address-proof-setup', label: 'Address Proof Setup' },
  { href: '/services/uk-bank-account-setup', label: 'UK Bank Account Setup' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* Main footer */}
      <div className="container-wide py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex flex-col mb-6">
              <span className="font-serif text-2xl text-white leading-tight">
                UK Pathway
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/50">
                Services
              </span>
            </Link>
            <p className="text-sm text-white/60 font-light leading-relaxed mb-6">
              Your trusted bridge to UK documentation. Expert guidance from insiders who know the process.
            </p>
            <div className="flex gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-white/50 mb-5">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-white/50 mb-5">Company</h3>
            <ul className="space-y-3">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/contact', label: 'Contact' },
                { href: '/terms', label: 'Terms & Disclaimer' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/dashboard', label: 'Client Portal' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-white/50 mb-5">Get In Touch</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors font-light"
                >
                  <Phone size={14} className="shrink-0" />
                  {PHONE_NUMBER}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL_ADDRESS}`}
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors font-light"
                >
                  <Mail size={14} className="shrink-0" />
                  {EMAIL_ADDRESS}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors font-light"
                >
                  <MessageCircle size={14} className="shrink-0" />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-white/10">
        <div className="container-wide py-6">
          <p className="text-xs text-white/40 font-light leading-relaxed max-w-4xl">
            <span className="text-white/60 font-normal">Disclaimer: </span>
            {DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30 font-light">
            &copy; {new Date().getFullYear()} UK Pathway Services. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
