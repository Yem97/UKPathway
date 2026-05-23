-- ============================================================
-- UK Pathway Services — Seed Data
-- Run AFTER schema.sql
-- ============================================================

insert into public.services (name, slug, short_description, full_description, timeline, required_documents, price, is_active, display_order)
values
  (
    'Driving Licence Conversion',
    'driving-licence-conversion',
    'Convert your existing foreign driving licence to a full UK licence through the DVLA with expert end-to-end guidance.',
    'Converting a foreign driving licence to a UK licence can be a complex process depending on your country of origin. We guide you through every step — from eligibility assessment, to document preparation, to DVLA submission. Our team has handled hundreds of conversions and knows exactly what examiners look for.',
    '4–8 weeks (varies by country of origin)',
    ARRAY['Current foreign driving licence', 'Passport or national ID', 'Proof of UK address (utility bill or bank statement)', 'DVLA D9 medical form (if required)', 'Passport-style photo'],
    149.00,
    true,
    1
  ),
  (
    'Theory Test Booking & Study Support',
    'theory-test-booking',
    'Booking assistance plus curated study materials — arrive fully prepared and confident.',
    'We handle your theory test slot booking at a convenient test centre, and provide you with access to curated study materials tailored to the official DVSA question bank. We track your booking and send you reminders so nothing slips through.',
    '1–2 weeks to book',
    ARRAY['Provisional UK driving licence (or we can help you get one)', 'Valid passport or photo ID'],
    89.00,
    true,
    2
  ),
  (
    'Practical Test Booking Assistance',
    'practical-test-booking',
    'DVSA-approved instructor referrals and practical driving test slot booking support.',
    'Finding a qualified DVSA-approved instructor and securing a practical test slot at the right time can be frustrating. We source instructor referrals matched to your location, and handle the slot booking process on your behalf — including monitoring cancellations for earlier dates.',
    '2–6 weeks',
    ARRAY['Provisional UK driving licence', 'Theory test pass certificate', 'Valid passport or photo ID'],
    99.00,
    true,
    3
  ),
  (
    'NI Number Application Support',
    'ni-number-application',
    'End-to-end support for your National Insurance number application — done right, first time.',
    'A National Insurance number is essential for working in the UK, paying tax, and accessing many services. We guide you through the full application process, prepare your documentation, and ensure everything is submitted correctly to HMRC. Our success rate is over 98%.',
    '2–4 weeks',
    ARRAY['Passport or biometric residence permit', 'Proof of UK address', 'Evidence of right to work (visa or settlement status)', 'Proof of reason for needing NI number (e.g. job offer letter)'],
    129.00,
    true,
    4
  ),
  (
    'BRP / eVisa Guidance',
    'brp-evisa-guidance',
    'Biometric Residence Permit and eVisa support from people who know the system inside out.',
    'Navigating BRP collection, eVisa setup, and UKVI correspondence can be overwhelming. We provide step-by-step guidance for BRP collection, eVisa account creation and management, and help you understand your immigration status documentation so you can live and work in the UK with confidence.',
    '1–3 weeks',
    ARRAY['Decision letter from UKVI', 'Passport', 'Vignette visa (if applicable)', 'UK address details'],
    119.00,
    true,
    5
  ),
  (
    'Address Proof Setup',
    'address-proof-setup',
    'Establish verifiable UK address documentation — essential for banking, DVLA, and government applications.',
    'Many UK processes require proof of a UK address. We help international clients establish the right documentation — working with legitimate and verifiable solutions that are accepted by the DVLA, banks, and other institutions. This is a common first step for newly arrived clients.',
    '1–2 weeks',
    ARRAY['Passport', 'Current visa or immigration status document'],
    79.00,
    true,
    6
  ),
  (
    'UK Bank Account Setup Guidance',
    'uk-bank-account-setup',
    'High-street and digital bank account guidance for international clients navigating UK requirements.',
    'Opening a UK bank account as a new arrival can be surprisingly difficult. We guide you through the best options — high-street banks and digital alternatives — based on your circumstances, help you prepare the correct documentation, and accompany you through the process with ongoing support.',
    '1–3 weeks',
    ARRAY['Passport', 'Proof of UK address', 'Proof of income or employment (if required)', 'NI number (if available)'],
    89.00,
    true,
    7
  );
