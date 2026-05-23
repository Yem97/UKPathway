import { createClient } from '@/lib/supabase/server'
import { ApplyForm } from '@/components/client/ApplyForm'
import type { Service } from '@/types'

export default async function ApplyPage() {
  const supabase = createClient()

  const { data: services } = await supabase
    .from('services')
    .select('id, name, short_description, timeline, price, required_documents, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Client Portal</p>
        <h1 className="font-serif text-3xl text-navy">New Application</h1>
        <p className="text-sm text-navy/60 mt-1">Select a service and submit your application. Our team will be in touch within 24 hours.</p>
      </div>

      <ApplyForm services={services as Service[] || []} />
    </div>
  )
}
