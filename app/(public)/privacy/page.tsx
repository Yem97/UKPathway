import type { Metadata } from 'next'
import FadeUp from '@/components/animations/FadeUp'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How UK Pathway Services collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <p className="eyebrow text-white/50 mb-4">Legal</p>
            <h1 className="font-serif text-5xl text-white">Privacy Policy</h1>
          </FadeUp>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow">
          {[
            { title: '1. Who We Are', body: 'UK Pathway Services is a document consultancy operating from within the United Kingdom. We are the data controller for personal information collected through our website and client portal. Contact: info@ukpathwayservices.com' },
            { title: '2. What Data We Collect', body: 'We collect: your name, email address, phone number, country of residence, passport details, visa and immigration status documents, driving licence details, and any other documents you upload in connection with your service application. We also collect standard website usage data (IP address, browser type, pages visited).' },
            { title: '3. Why We Collect It', body: 'We use your data solely to: provide the consultancy services you have requested; communicate with you about your case; comply with our legal obligations; and improve our services. We will never sell your data to third parties.' },
            { title: '4. Legal Basis', body: 'We process your data under: (a) the performance of a contract — to provide the services you have engaged us for; (b) legal obligation — where required by UK law; and (c) legitimate interests — for internal service improvement, always balanced against your rights.' },
            { title: '5. How We Store It', body: 'Your data is stored securely using Supabase infrastructure hosted within the EU/UK. Documents are stored in encrypted, private storage buckets accessible only to you and your assigned case handler. We use row-level security to ensure strict data isolation between clients.' },
            { title: '6. How Long We Keep It', body: 'We retain your data for as long as your account is active and for 7 years thereafter, as required for tax and legal compliance purposes. You may request earlier deletion subject to our legal obligations.' },
            { title: '7. Your Rights (UK GDPR)', body: 'You have the right to: access your personal data; correct inaccurate data; request erasure ("right to be forgotten"); object to processing; restrict processing; and data portability. To exercise any of these rights, contact us at info@ukpathwayservices.com.' },
            { title: '8. Cookies', body: 'We use essential cookies only — necessary for authentication and session management. We do not use advertising or tracking cookies. A cookie consent notice is displayed on your first visit.' },
            { title: '9. Third Parties', body: 'We share data only with: Supabase (data storage and authentication); Resend (email delivery); and government bodies (DVLA, HMRC, UKVI) as required to provide your requested service. All third parties are bound by appropriate data processing agreements.' },
            { title: '10. Contact & Complaints', body: 'For privacy-related matters, contact: info@ukpathwayservices.com. If you are unsatisfied with our response, you have the right to lodge a complaint with the Information Commissioner\'s Office (ICO) at ico.org.uk.' },
          ].map(({ title, body }) => (
            <div key={title} className="mb-10">
              <h2 className="font-serif text-xl text-navy mb-3">{title}</h2>
              <div className="w-8 h-px bg-navy/20 mb-4" />
              <p className="text-navy leading-relaxed text-sm">{body}</p>
            </div>
          ))}
          <p className="text-xs text-navy/40 font-light mt-12 pt-8 border-t border-navy/10">
            Last updated: May 2026. Governed by the laws of England and Wales.
          </p>
        </div>
      </section>
    </>
  )
}
