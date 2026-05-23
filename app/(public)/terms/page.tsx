import type { Metadata } from 'next'
import FadeUp from '@/components/animations/FadeUp'

export const metadata: Metadata = {
  title: 'Terms & Disclaimer',
  description: 'Terms of service and legal disclaimer for UK Pathway Services.',
}

export default function TermsPage() {
  return (
    <>
      <section className="bg-navy pt-32 pb-20">
        <div className="container-narrow">
          <FadeUp>
            <p className="eyebrow text-white/50 mb-4">Legal</p>
            <h1 className="font-serif text-5xl text-white">Terms & Disclaimer</h1>
          </FadeUp>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow">
          <div className="prose prose-navy max-w-none">
            <div className="bg-navy text-white p-8 mb-12">
              <p className="font-serif text-xl mb-3">Important Disclaimer</p>
              <p className="text-white/70 font-light leading-relaxed text-sm">
                UK Pathway Services provides consultancy and application support services. We are not affiliated with the DVLA, DVSA, HMRC, or HM Government. All tests must be sat by the applicant in person. All applications are submitted through official channels.
              </p>
            </div>

            {[
              {
                title: '1. Nature of Service',
                body: 'UK Pathway Services provides consultancy, guidance, and administrative support to individuals navigating UK documentation processes. We are an independent consultancy and are not an official government body. We do not guarantee outcomes, as final decisions rest with the relevant government departments.',
              },
              {
                title: '2. No Government Affiliation',
                body: 'We have no affiliation with, and are not endorsed by, the DVLA, DVSA, HMRC, Home Office, or any other UK government department. Our relationships are professional knowledge relationships — we do not have authority to issue, approve, or accelerate government documents.',
              },
              {
                title: '3. Legitimate Services Only',
                body: 'All services we provide are conducted through official, legitimate channels. We do not bypass, circumvent, or manipulate any official government process. Driving tests must be sat in person by the applicant. Applications are submitted through official government portals and procedures.',
              },
              {
                title: '4. Client Responsibilities',
                body: 'Clients are responsible for providing accurate and truthful information. Providing false information in a government application is a criminal offence. UK Pathway Services accepts no liability for consequences arising from inaccurate information provided by the client.',
              },
              {
                title: '5. Fees and Refunds',
                body: 'Our fees cover the consultancy and support services we provide. Government fees (e.g. DVLA application fees, theory test fees) are separate and payable directly to the relevant authority. Refund requests are assessed on a case-by-case basis. Please contact us for our current refund policy.',
              },
              {
                title: '6. No Guaranteed Outcomes',
                body: 'We cannot guarantee that any application will be approved. Government decisions are made independently by the relevant authority. Our role is to ensure your application is as complete and correct as possible to give you the best possible chance of success.',
              },
              {
                title: '7. Privacy & Data',
                body: 'We handle all personal data in accordance with UK GDPR and the Data Protection Act 2018. Please see our Privacy Policy for full details on how we collect, use, and protect your information.',
              },
              {
                title: '8. Governing Law',
                body: 'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="mb-10">
                <h2 className="font-serif text-xl text-navy mb-3">{title}</h2>
                <div className="w-8 h-px bg-navy/20 mb-4" />
                <p className="text-navy leading-relaxed text-sm">{body}</p>
              </div>
            ))}

            <p className="text-xs text-navy/70 mt-12 pt-8 border-t border-navy/10">
              Last updated: May 2026. These terms may be updated periodically. Continued use of our services constitutes acceptance of the current terms.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
