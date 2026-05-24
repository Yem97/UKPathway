// Service-specific application questions — one set per service slug

export type QuestionType = 'text' | 'select' | 'radio' | 'textarea' | 'date' | 'yesno'

export interface ServiceQuestion {
  id:          string
  label:       string
  type:        QuestionType
  options?:    string[]
  placeholder?: string
  required?:   boolean
  helpText?:   string
}

const VISA_TYPES = [
  'UK Citizen / British Passport',
  'Indefinite Leave to Remain (ILR)',
  'Settled Status (EU Settlement Scheme)',
  'Pre-Settled Status',
  'Skilled Worker Visa',
  'Student Visa',
  'Family Visa (spouse / dependent)',
  'BNO Visa',
  'Graduate Visa',
  'Refugee / Humanitarian Protection',
  'Asylum Seeker',
  'Other – please explain in notes',
]

export const SERVICE_QUESTIONS: Record<string, ServiceQuestion[]> = {

  'driving-licence-conversion': [
    {
      id: 'licence_issuing_country',
      label: 'Which country issued your driving licence?',
      type: 'text',
      placeholder: 'e.g. Nigeria, India, Poland',
      required: true,
    },
    {
      id: 'licence_number',
      label: 'Driving licence number',
      type: 'text',
      placeholder: 'As it appears on your licence card',
      required: true,
    },
    {
      id: 'years_held',
      label: 'How long have you held this licence?',
      type: 'select',
      options: ['Less than 1 year', '1–2 years', '3–5 years', '5–10 years', 'Over 10 years'],
      required: true,
    },
    {
      id: 'licence_type',
      label: 'Licence category',
      type: 'radio',
      options: ['Full licence', 'Provisional licence'],
      required: true,
    },
    {
      id: 'transmission',
      label: 'What type of vehicle are you licensed to drive?',
      type: 'radio',
      options: ['Manual only', 'Automatic only', 'Both manual and automatic'],
      required: true,
    },
    {
      id: 'urgency',
      label: 'How urgently do you need this conversion?',
      type: 'radio',
      options: ['As soon as possible', 'Within 1 month', 'Within 3 months', 'No specific deadline'],
      required: true,
    },
  ],

  'theory-test-booking': [
    {
      id: 'has_provisional',
      label: 'Do you already have a UK provisional driving licence?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'provisional_number',
      label: 'Provisional licence number (if you have one)',
      type: 'text',
      placeholder: 'e.g. SMITH901052AB9IJ',
      required: false,
    },
    {
      id: 'preferred_location',
      label: 'Preferred test centre location',
      type: 'text',
      placeholder: 'e.g. Central London, Manchester City Centre',
      required: true,
    },
    {
      id: 'preferred_dates',
      label: 'Preferred availability for the test',
      type: 'text',
      placeholder: 'e.g. Weekday mornings after 10 June, ASAP',
      required: true,
    },
    {
      id: 'study_status',
      label: 'How prepared do you feel for the theory test?',
      type: 'radio',
      options: [
        'Not yet started studying',
        'Started but need more preparation time',
        'Almost ready — want to book soon',
        'Ready — book as soon as possible',
      ],
      required: true,
    },
  ],

  'practical-test-booking': [
    {
      id: 'theory_passed',
      label: 'Have you passed your UK theory test?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'theory_pass_date',
      label: 'Theory test pass date',
      type: 'date',
      required: false,
      helpText: 'Leave blank if not yet passed.',
    },
    {
      id: 'theory_cert_number',
      label: 'Theory test pass certificate number (if available)',
      type: 'text',
      placeholder: 'e.g. 123456789012',
      required: false,
    },
    {
      id: 'preferred_location',
      label: 'Preferred practical test centre',
      type: 'text',
      placeholder: 'e.g. Chiswick, Hendon, Birmingham West',
      required: true,
    },
    {
      id: 'lessons_completed',
      label: 'How many driving lessons have you completed so far?',
      type: 'radio',
      options: ['None yet', '1–10 lessons', '11–20 lessons', '20–40 lessons', 'Over 40 lessons'],
      required: true,
    },
    {
      id: 'needs_instructor',
      label: 'Do you need us to refer you to a DVSA-approved instructor?',
      type: 'yesno',
      required: true,
    },
  ],

  'ni-number-application': [
    {
      id: 'employment_status',
      label: 'What is your current employment situation?',
      type: 'radio',
      options: [
        'I am about to start a new job',
        'I am already employed and need an NI number',
        'I am self-employed',
        'I am seeking employment',
        'Other reason',
      ],
      required: true,
    },
    {
      id: 'employer_name',
      label: 'Employer or company name (if applicable)',
      type: 'text',
      placeholder: 'Leave blank if not yet employed',
      required: false,
    },
    {
      id: 'start_date',
      label: 'Employment start date (if known)',
      type: 'date',
      required: false,
    },
    {
      id: 'visa_type',
      label: 'Your current UK immigration status',
      type: 'select',
      options: VISA_TYPES,
      required: true,
    },
    {
      id: 'has_brp',
      label: 'Do you have a Biometric Residence Permit (BRP) or eVisa?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'date_arrived_uk',
      label: 'When did you arrive in the UK?',
      type: 'date',
      required: true,
    },
  ],

  'brp-evisa-guidance': [
    {
      id: 'request_type',
      label: 'What do you primarily need help with?',
      type: 'radio',
      options: [
        'My BRP has not arrived yet',
        'I need to collect my BRP',
        'Setting up or accessing my eVisa account',
        'Checking my immigration status online (Share Code)',
        'Understanding my visa conditions',
        'Something else — I will explain in notes',
      ],
      required: true,
    },
    {
      id: 'visa_type',
      label: 'Type of visa or leave granted',
      type: 'select',
      options: VISA_TYPES,
      required: true,
    },
    {
      id: 'decision_reference',
      label: 'UKVI reference number (from your decision letter)',
      type: 'text',
      placeholder: 'e.g. GWF0123456789 or HO REF',
      required: false,
      helpText: 'Found at the top of your Home Office decision letter.',
    },
    {
      id: 'has_ukvi_account',
      label: 'Have you already created a UKVI online account (gov.uk)?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'visa_expiry',
      label: 'Visa / leave expiry date (if known)',
      type: 'date',
      required: false,
    },
  ],

  'address-proof-setup': [
    {
      id: 'time_in_uk',
      label: 'How long have you been living in the UK?',
      type: 'radio',
      options: [
        'Less than 1 month',
        '1–3 months',
        '3–6 months',
        '6–12 months',
        'Over 1 year',
      ],
      required: true,
    },
    {
      id: 'accommodation_type',
      label: 'Current accommodation situation',
      type: 'radio',
      options: [
        'Private rental (sole tenant)',
        'Private rental (shared / HMO)',
        'Staying with family or friends',
        'University or student accommodation',
        'Council or social housing',
        'Other',
      ],
      required: true,
    },
    {
      id: 'address_needed_for',
      label: 'What do you need proof of address for?',
      type: 'text',
      placeholder: 'e.g. bank account, DVLA, GP registration, employer, NI application',
      required: true,
    },
    {
      id: 'existing_docs',
      label: 'Do you have any existing UK documentation? (utility bills, council letters, etc.)',
      type: 'textarea',
      placeholder: 'List what you have, or write "None"',
      required: true,
    },
    {
      id: 'landlord_details',
      label: 'Do you have contact details for your landlord or letting agent?',
      type: 'yesno',
      required: true,
      helpText: 'A landlord confirmation letter is often one of the fastest solutions.',
    },
  ],

  'uk-bank-account-setup': [
    {
      id: 'employment_status',
      label: 'What is your current employment status?',
      type: 'radio',
      options: [
        'Employed (full or part time)',
        'Self-employed',
        'Student',
        'Not yet working / job seeking',
        'Other',
      ],
      required: true,
    },
    {
      id: 'has_ni_number',
      label: 'Do you have a UK National Insurance (NI) number?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'has_address_proof',
      label: 'Do you have proof of UK address?',
      type: 'yesno',
      required: true,
      helpText: 'e.g. utility bill, bank letter, council letter, landlord letter.',
    },
    {
      id: 'tried_before',
      label: 'Have you tried to open a UK bank account before?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'previous_experience',
      label: 'If you tried before, what happened? (skip if not applicable)',
      type: 'textarea',
      placeholder: 'e.g. rejected due to no proof of address, account still pending, etc.',
      required: false,
    },
    {
      id: 'bank_preference',
      label: 'Which type of bank would you prefer?',
      type: 'radio',
      options: [
        'High-street bank (Barclays, NatWest, Lloyds, HSBC, etc.)',
        'Digital / challenger bank (Monzo, Revolut, Starling, etc.)',
        'No preference — advise me based on my situation',
      ],
      required: true,
    },
  ],
}

/** Returns questions for a given service slug, or [] if none defined */
export function getServiceQuestions(slug: string): ServiceQuestion[] {
  return SERVICE_QUESTIONS[slug] ?? []
}
