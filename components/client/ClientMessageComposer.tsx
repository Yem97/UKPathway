'use client'

import { useState, useTransition } from 'react'
import { sendClientMessage } from '@/app/actions/client'
import { Send } from 'lucide-react'

export function ClientMessageComposer({ caseId }: { caseId: string }) {
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSend = () => {
    if (!message.trim()) return
    startTransition(async () => {
      await sendClientMessage(caseId, message)
      setMessage('')
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Write a message to your case manager…"
        className="w-full border border-navy/20 px-4 py-3 bg-white text-navy text-sm focus:outline-none focus:border-navy resize-none"
      />
      <button
        onClick={handleSend}
        disabled={pending || !message.trim()}
        className="self-end btn-primary text-xs py-2.5 px-6 flex items-center gap-2 disabled:opacity-50"
      >
        <Send size={13} />
        {pending ? 'Sending…' : 'Send Message'}
      </button>
    </div>
  )
}
