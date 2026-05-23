'use client'

import { useTransition } from 'react'
import { updateCaseStatus } from '@/app/actions/admin'
import type { CaseStatus } from '@/types'

interface Props {
  caseId: string
  status: CaseStatus
  label: string
  variant?: 'default' | 'danger'
}

export function StatusActionButton({ caseId, status, label, variant = 'default' }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => updateCaseStatus(caseId, status))}
      disabled={pending}
      className={`w-full text-left text-sm border px-4 py-2.5 transition-all disabled:opacity-50 ${
        variant === 'danger'
          ? 'border-red-300 text-red-600 hover:bg-red-600 hover:text-white'
          : 'border-navy/20 text-navy hover:bg-navy hover:text-white'
      }`}
    >
      {pending ? '…' : label}
    </button>
  )
}
