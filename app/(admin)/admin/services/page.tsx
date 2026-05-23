'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function AdminServicesPage() {
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        setServices(data || [])
        setLoading(false)
      })
  }, [])

  const toggleActive = async (service: Service) => {
    setSaving(service.id)
    await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)
    setServices((prev) =>
      prev.map((s) => s.id === service.id ? { ...s, is_active: !s.is_active } : s)
    )
    setSaving(null)
  }

  const updatePrice = async (service: Service, price: string) => {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return
    setSaving(service.id)
    await supabase
      .from('services')
      .update({ price: numPrice })
      .eq('id', service.id)
    setServices((prev) =>
      prev.map((s) => s.id === service.id ? { ...s, price: numPrice } : s)
    )
    setSaving(null)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-serif text-3xl text-navy">Services</h1>
        <p className="text-sm text-navy/60 mt-1">Manage service catalog, pricing, and availability.</p>
      </div>

      {loading ? (
        <div className="bg-white border border-navy/10 p-16 text-center">
          <p className="text-navy/40 text-sm">Loading services…</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white border p-6 transition-all ${
                service.is_active ? 'border-navy/10' : 'border-navy/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-serif text-xl text-navy">{service.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 ${
                        service.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {service.is_active ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-sm text-navy mb-3 max-w-xl">{service.short_description}</p>

                  <div className="flex items-center gap-6 text-xs text-navy/60">
                    {service.timeline && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {service.timeline}
                      </span>
                    )}
                    <span className="font-mono">/services/{service.slug}</span>
                  </div>
                </div>

                {/* Price editor */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-navy">£</span>
                    <input
                      type="number"
                      defaultValue={service.price || ''}
                      onBlur={(e) => updatePrice(service, e.target.value)}
                      className="w-24 border border-navy/20 px-2 py-1.5 text-navy text-sm focus:outline-none focus:border-navy text-right"
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    onClick={() => toggleActive(service)}
                    disabled={saving === service.id}
                    className={`text-xs tracking-widest uppercase px-4 py-2 border transition-all disabled:opacity-50 ${
                      service.is_active
                        ? 'border-red-300 text-red-600 hover:bg-red-600 hover:text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    {saving === service.id ? '…' : service.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
