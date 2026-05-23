import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const WHATSAPP_NUMBER = '+44XXXXXXXXXX'
export const PHONE_NUMBER = '+44XXXXXXXXXX'
export const EMAIL_ADDRESS = 'info@ukpathwayservices.com'
export const FACEBOOK_URL = 'https://facebook.com/ukpathwayservices'

export const DISCLAIMER =
  'UK Pathway Services provides consultancy and application support services. We are not affiliated with the DVLA, DVSA, HMRC, or HM Government. All tests must be sat by the applicant in person. All applications are submitted through official channels.'
