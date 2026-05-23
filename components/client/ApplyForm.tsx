'use client'

import { useState, useTransition } from 'react'
import { submitApplication } from '@/app/actions/client'
import type { Service } from '@/types'
import { CheckCircle, Clock, ChevronRight } from 'lucide-react'

export function ApplyForm({ services }: { services: Service[] }) {
  const [selected, setSelected] = useState<Service | null>(null)
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!selected) return
    startTransition(() => submitApplication(selected.id, notes))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Service selection */}
      <div className="lg:col-span-2">
        <h2 className="font-serif text-xl text-navy mb-4">Choose a Service</h2>
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelected(service)}
              className={`text-left p-5 border transition-all ${
                selected?.id === service.id
                  ? 'border-navy bg-navy text-white'
                  : 'border-navy/10 bg-white text-navy hover:border-navy'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className={`font-serif text-lg ${selected?.id === service.id ? 'text-white' : 'text-navy'}`}>
                      {service.name}
                    </p>
                    {selected?.id === service.id && <CheckCircle size={16} className="text-white shrink-0" />}
                  </div>
                  <p className={`text-sm ${selected?.id === service.id ? 'text-white/70' : 'text-navy/60'}`}>
                    {service.short_description}
                  </p>
                  {service.timeline && (
                    <p className={`text-xs mt-2 flex items-center gap-1 ${selected?.id === service.id ? 'text-white/50' : 'text-navy/40'}`}>
                      <Clock size={11} /> {service.timeline}
                    </p>
                  )}
                </div>
                {service.price && (
                  <div className={`shrink-0 text-right ${selected?.id === service.id ? 'text-white' : 'text-navy'}`}>
                    <p className="font-serif text-xl">£{service.price.toFixed(0)}</p>
                    <p className={`text-xs ${selected?.id === service.id ? 'text-white/50' : 'text-navy/40'}`}>service fee</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary + submit */}
      <div className="flex flex-col gap-5">
        {selected ? (
          <div className="bg-white border border-navy/10 p-6 sticky top-6">
            <h2 className="font-serif text-xl text-navy mb-4">Application Summary</h2>

            <div className="flex flex-col gap-3 mb-5 text-sm">
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Service</p>
                <p className="text-navy">{selected.name}</p>
              </div>
              {selected.timeline && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Timeline</p>
                  <p className="text-navy">{selected.timeline}</p>
                </div>
              )}
              {selected.price && (
                <div>
                  <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Fee</p>
                  <p className="text-navy font-medium">£{selected.price.toFixed(2)}</p>
                </div>
              )}
            </div>

            {selected.required_documents?.length ? (
              <div className="mb-5">
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-2">Documents You'll Need</p>
                <ul className="flex flex-col gap-1">
                  {selected.required_documents.map((doc) => (
                    <li key={doc} className="text-xs text-navy flex items-start gap-2">
                      <ChevronRight size={12} className="mt-0.5 shrink-0 text-navy/40" /> {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mb-5">
              <label className="text-xs text-navy/50 uppercase tracking-wider block mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any specific requirements or questions…"
                className="w-full border border-navy/20 px-3 py-2 text-navy text-sm focus:outline-none focus:border-navy resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={pending}
              className="w-full btn-primary text-xs py-3 disabled:opacity-50"
            >
              {pending ? 'Submitting…' : 'Submit Application →'}
            </button>

            <p className="text-[10px] text-navy/40 mt-3 text-center leading-relaxed">
              Payment is only required after we review your case. No upfront charges.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-navy/10 p-6 text-center">
            <p className="text-sm text-navy/40">Select a service to continue</p>
          </div>
        )}
      </div>
    </div>
  )
}
