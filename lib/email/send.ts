import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'UK Pathway Services <noreply@ukpathwayservices.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ukpathwayservices.com'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[Email Error]', error)
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: 'Welcome to UK Pathway Services',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a1a3a; color: #ffffff; padding: 48px;">
        <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 24px;">Welcome, ${name}</h1>
        <div style="width: 40px; height: 1px; background: rgba(255,255,255,0.3); margin-bottom: 24px;"></div>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 16px;">
          Your UK Pathway Services account has been created. You can now access your secure client portal to submit applications and track your cases.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display: inline-block; margin-top: 24px; background: #ffffff; color: #0a1a3a; padding: 14px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          Access Your Portal
        </a>
        <p style="margin-top: 48px; font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 300;">
          UK Pathway Services provides consultancy and application support services. We are not affiliated with the DVLA, DVSA, HMRC, or HM Government.
        </p>
      </div>
    `,
  })
}

export async function sendApplicationReceivedEmail(to: string, name: string, caseNumber: string, serviceName: string) {
  await sendEmail({
    to,
    subject: `Application Received — ${caseNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a1a3a; color: #ffffff; padding: 48px;">
        <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 8px;">Application Received</h1>
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 32px;">${caseNumber}</p>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 16px;">
          Dear ${name}, your application for <strong style="font-weight: 400;">${serviceName}</strong> has been received and assigned case number <strong style="font-weight: 400;">${caseNumber}</strong>.
        </p>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 24px;">
          Our team will review your application within 24 hours and may reach out if additional documents are required. You can track your case status in your portal at any time.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display: inline-block; background: #ffffff; color: #0a1a3a; padding: 14px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          View Your Case
        </a>
        <p style="margin-top: 48px; font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 300;">
          UK Pathway Services provides consultancy and application support services. We are not affiliated with the DVLA, DVSA, HMRC, or HM Government.
        </p>
      </div>
    `,
  })
}

export async function sendStatusUpdateEmail(to: string, name: string, caseNumber: string, serviceName: string, newStatus: string, message?: string) {
  await sendEmail({
    to,
    subject: `Case Update — ${caseNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a1a3a; color: #ffffff; padding: 48px;">
        <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 8px;">Case Update</h1>
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 32px;">${caseNumber}</p>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 16px;">
          Dear ${name}, your case for <strong style="font-weight: 400;">${serviceName}</strong> has been updated.
        </p>
        <div style="background: rgba(255,255,255,0.08); padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px;">New Status</p>
          <p style="font-size: 18px; font-weight: 400;">${newStatus}</p>
        </div>
        ${message ? `<p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 24px;">${message}</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display: inline-block; background: #ffffff; color: #0a1a3a; padding: 14px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          View Your Case
        </a>
        <p style="margin-top: 48px; font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 300;">
          UK Pathway Services provides consultancy and application support services. We are not affiliated with the DVLA, DVSA, HMRC, or HM Government.
        </p>
      </div>
    `,
  })
}

export async function sendAdminNotification(caseNumber: string, clientName: string, serviceName: string, caseId: string) {
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Case — ${caseNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #0a1a3a; font-weight: 500;">New Application Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
          <tr><td style="padding: 8px 0; color: #666; font-size: 13px;">Case Number</td><td style="padding: 8px 0; font-weight: 500; font-size: 13px;">${caseNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 13px;">Client</td><td style="padding: 8px 0; font-weight: 500; font-size: 13px;">${clientName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666; font-size: 13px;">Service</td><td style="padding: 8px 0; font-weight: 500; font-size: 13px;">${serviceName}</td></tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/cases/${caseId}"
           style="display: inline-block; margin-top: 24px; background: #0a1a3a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 12px;">
          View Case in Admin
        </a>
      </div>
    `,
  })
}

export async function sendPaymentInstructionsEmail(to: string, name: string, caseNumber: string, amount: string) {
  await sendEmail({
    to,
    subject: `Payment Required — ${caseNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a1a3a; color: #ffffff; padding: 48px;">
        <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 8px;">Payment Required</h1>
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 32px;">${caseNumber}</p>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 24px;">
          Dear ${name}, your case is ready to proceed. To continue, please arrange payment of <strong style="font-weight: 400;">${amount}</strong>.
        </p>
        <div style="background: rgba(255,255,255,0.08); padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px;">Payment Details</p>
          <p style="font-weight: 300; color: rgba(255,255,255,0.7); font-size: 13px;">Please contact us via WhatsApp or email for bank transfer details. Reference your case number <strong>${caseNumber}</strong> in all communications.</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact"
           style="display: inline-block; background: #ffffff; color: #0a1a3a; padding: 14px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          Contact Us
        </a>
      </div>
    `,
  })
}

export async function sendCaseCompletedEmail(to: string, name: string, caseNumber: string, serviceName: string) {
  await sendEmail({
    to,
    subject: `Case Completed — ${caseNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a1a3a; color: #ffffff; padding: 48px;">
        <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 8px;">Case Complete</h1>
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 32px;">${caseNumber}</p>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 16px;">
          Dear ${name}, your case for <strong style="font-weight: 400;">${serviceName}</strong> has been completed. All documents and records are available in your secure portal.
        </p>
        <p style="font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 24px;">
          Thank you for trusting UK Pathway Services. If you need any further assistance, don&apos;t hesitate to contact us.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display: inline-block; background: #ffffff; color: #0a1a3a; padding: 14px 32px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          View Your Portal
        </a>
        <p style="margin-top: 48px; font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 300;">
          UK Pathway Services provides consultancy and application support services. We are not affiliated with the DVLA, DVSA, HMRC, or HM Government.
        </p>
      </div>
    `,
  })
}
