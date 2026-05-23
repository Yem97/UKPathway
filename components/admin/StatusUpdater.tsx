'use client'

import { useState, useTransition } from 'react'
import { updateCaseStatus } from '@/app/actions/admin'
import { STATUS_LABELS } from '@/types'
import type { CaseStatus } from '@/types'

const ALL_STATUSES: CaseStatus[] = [
  'submitted', 'under_review', 'documents_requested',
  'awaiting_payment', 'processing', 'completed', 'rejected',
]

export function StatusUpdater({ caseId, current }: { caseId: string; current: CaseStatus }) {
  const [pending, startTransition] = useTransition()
  const [active, setActive] = useState<CaseStatus>(current)

  const handleUpdate = (status: CaseStatus) => {
    setActive(status)
    startTransition(() => updateCaseStatus(caseId, status))
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleUpdate(s)}
          disabled={pending}
          className={`px-3 py-2 text-xs border transition-all disabled:opacity-50 ${
            active === s
              ? 'bg-navy text-white border-navy'
              : 'border-navy/20 text-navy hover:bg-navy hover:text-white'
          }`}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
