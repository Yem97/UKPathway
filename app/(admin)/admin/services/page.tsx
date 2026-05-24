'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types'
import { CheckCircle, XCircle, Clock, Save, Check, AlertCircle } from 'lucide-react'

export default function AdminServicesPage() {
  const supabase = createClient()
  const [services, setServices]   = useState<Service[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState<string | null>(null)
  const [savedId, setSavedId]     = useState<string | null>(null)
  const [prices, setPrices]       = useState<Record<string, string>>({})
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        const rows = data || []
        setServices(rows)
        const init: Record<string, string> = {}
        rows.forEach((s: Service) => { init[s.id] = s.price?.toString() ?? '' })
        setPrices(init)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleActive = async (service: Service) => {
    setSaving(service.id)
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)
    if (!error) {
      setServices((prev) =>
        prev.map((s) => s.id === service.id ? { ...s, is_active: !s.is_active } : s)
      )
    }
    setSaving(null)
  }

  const savePrice = async (service: Service) => {
    const raw = prices[service.id] ?? ''
    const num = parseFloat(raw)
    if (!raw || isNaN(num) || num < 0) {
      setPriceErrors((prev) => ({ ...prev, [service.id]: 'Enter a valid price' }))
      return
    }
    setPriceErrors((prev) => ({ ...prev, [service.id]: '' }))
    setSaving(service.id)

    const { error } = await supabase
      .from('services')
      .update({ price: num })
      .eq('id', service.id)

    if (error) {
      setPriceErrors((prev) => ({ ...prev, [service.id]: error.message }))
    } else {
      setServices((prev) =>
        prev.map((s) => s.id === service.id ? { ...s, price: num } : s)
      )
      setSavedId(service.id)
      setTimeout(() => setSavedId(null), 2500)
    }
    setSaving(null)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-serif text-3xl text-navy">Services</h1>
        <p className="text-sm text-navy/60 mt-1">Manage service catalog, pricing and availability.</p>
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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left — info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="font-serif text-xl text-navy">{service.name}</h2>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 shrink-0 ${
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
                  <div className="flex items-center gap-6 text-xs text-navy/60 flex-wrap">
                    {service.timeline && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {service.timeline}
                      </span>
                    )}
                    <span className="font-mono">/services/{service.slug}</span>
                  </div>
                </div>

                {/* Right — price + toggle */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                  {/* Price editor */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-navy font-medium">£</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={prices[service.id] ?? ''}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, [service.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && savePrice(service)}
                        className="w-24 border border-navy/20 px-2 py-1.5 text-navy text-sm focus:outline-none focus:border-navy text-right"
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => savePrice(service)}
                        disabled={saving === service.id}
                        title="Save price"
                        className={`p-1.5 border transition-all disabled:opacity-50 ${
                          savedId === service.id
                            ? 'border-green-400 text-green-600'
                            : 'border-navy/20 text-navy/40 hover:text-navy hover:border-navy'
                        }`}
                      >
                        {saving === service.id
                          ? <span className="text-xs px-0.5">…</span>
                          : savedId === service.id
                          ? <Check size={14} />
                          : <Save size={14} />}
                      </button>
                    </div>
                    {priceErrors[service.id] && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle size={11} /> {priceErrors[service.id]}
                      </p>
                    )}
                  </div>

                  {/* Active toggle */}
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
