import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, FolderOpen, Users, MessageSquare, Settings, LogOut, ShieldCheck } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/cases', label: 'All Cases', icon: FolderOpen },
    { href: '/admin/clients', label: 'Clients', icon: Users },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/services', label: 'Services', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-navy/[0.02] flex">
      {/* Admin sidebar */}
      <aside className="hidden md:flex w-60 bg-navy flex-col fixed left-0 top-0 bottom-0">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-xl text-white">UK Pathway</span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-white/40">Admin Portal</span>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 mb-2 flex items-center gap-2 px-3 py-2 bg-white/10 rounded-sm">
          <ShieldCheck size={14} className="text-white/60" />
          <span className="text-xs text-white/60 tracking-wider uppercase">Admin</span>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-sm"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-white font-light truncate">{profile.full_name || user.email}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-sm w-full text-left"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 md:ml-60">
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
