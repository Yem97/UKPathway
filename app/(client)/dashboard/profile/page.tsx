import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/client/ProfileForm'
import { formatDate } from '@/lib/utils'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: cases } = await supabase
    .from('cases')
    .select('id')
    .eq('user_id', user!.id)

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Client Portal</p>
        <h1 className="font-serif text-3xl text-navy">My Profile</h1>
        <p className="text-sm text-navy/60 mt-1">Keep your contact details up to date.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-xl text-navy mb-6">Personal Information</h2>
            <ProfileForm
              initialFullName={profile?.full_name || ''}
              initialPhone={profile?.phone || ''}
              initialCountry={profile?.country || ''}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Account summary */}
          <div className="bg-white border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-4">Account</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-navy">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Member Since</p>
                <p className="text-navy">{formatDate(profile?.created_at || '')}</p>
              </div>
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider mb-0.5">Total Cases</p>
                <p className="text-navy">{cases?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="border border-navy/10 p-6">
            <h2 className="font-serif text-lg text-navy mb-2">Security</h2>
            <p className="text-xs text-navy/60 mb-4 leading-relaxed">
              To change your password, use the forgot password flow from the login page.
            </p>
            <a
              href="/login"
              className="text-xs tracking-widest uppercase text-navy hover:underline"
            >
              Change Password →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
