'use client'

import { useState, useTransition } from 'react'
import { sendAdminMessage } from '@/app/actions/admin'
import { Send } from 'lucide-react'

export function MessageComposer({ caseId }: { caseId: string }) {
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSend = () => {
    if (!message.trim()) return
    startTransition(async () => {
      await sendAdminMessage(caseId, message, isInternal)
      setMessage('')
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder={isInternal ? 'Internal note (not visible to client)…' : 'Type your message to the client…'}
        className="w-full border border-navy/20 px-4 py-3 bg-white text-navy text-sm focus:outline-none focus:border-navy resize-none"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-navy/60 cursor-pointer">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="accent-navy"
          />
          Internal note only
        </label>
        <button
          onClick={handleSend}
          disabled={pending || !message.trim()}
          className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50"
        >
          <Send size={13} />
          {pending ? 'Sending…' : isInternal ? 'Save Note' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}
