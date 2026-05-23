'use client'

import { useState, useTransition } from 'react'
import { saveCaseNotes } from '@/app/actions/admin'

export function NotesEditor({ caseId, initialNotes }: { caseId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      await saveCaseNotes(caseId, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <>
      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
        rows={5}
        placeholder="Add internal notes (not visible to client)…"
        className="w-full border border-navy/20 px-4 py-3 text-navy text-sm focus:outline-none focus:border-navy resize-none mb-3"
      />
      <button
        onClick={handleSave}
        disabled={pending}
        className={`btn-secondary text-xs py-2.5 px-6 transition-colors ${saved ? 'border-green-500 text-green-700' : ''}`}
      >
        {pending ? 'Saving…' : saved ? 'Saved ✓' : 'Save Notes'}
      </button>
    </>
  )
}
