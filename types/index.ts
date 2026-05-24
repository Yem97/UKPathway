export type UserRole = 'client' | 'admin'

export type CaseStatus =
  | 'submitted'
  | 'under_review'
  | 'documents_requested'
  | 'awaiting_payment'
  | 'processing'
  | 'completed'
  | 'rejected'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  country: string | null
  role: UserRole
  created_at: string
}

export interface Service {
  id: string
  name: string
  slug: string
  short_description: string | null
  full_description: string | null
  timeline: string | null
  required_documents: string[] | null
  price: number | null
  is_active: boolean
  display_order: number | null
}

export interface Case {
  id: string
  case_number: string
  user_id: string
  service_id: string
  status: CaseStatus
  notes: string | null
  details: Record<string, string> | null
  created_at: string
  updated_at: string
  profiles?: Profile
  services?: Service
}

export interface CaseDocument {
  id: string
  case_id: string
  file_url: string
  file_name: string | null
  label: string | null
  uploaded_by: string | null
  created_at: string
}

export interface CaseMessage {
  id: string
  case_id: string
  author_id: string | null
  message: string
  is_internal: boolean
  created_at: string
  profiles?: Profile
}

export interface CaseTimeline {
  id: string
  case_id: string
  event_type: string | null
  event_description: string | null
  created_by: string | null
  created_at: string
  profiles?: Profile
}

export interface Payment {
  id: string
  case_id: string
  user_id: string
  amount: number | null
  currency: string
  status: string
  payment_method: string | null
  reference: string | null
  created_at: string
}

export const STATUS_LABELS: Record<CaseStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  documents_requested: 'Documents Requested',
  awaiting_payment: 'Awaiting Payment',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const STATUS_COLORS: Record<CaseStatus, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  documents_requested: 'bg-orange-100 text-orange-800',
  awaiting_payment: 'bg-purple-100 text-purple-800',
  processing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}
