'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderOpen, Users, MessageSquare,
  Settings, LogOut, Menu, X, ShieldCheck,
} from 'lucide-react'

interface Props { fullName: string; email: string }

const navItems = [
  { href: '/admin',          label: 'Overview',  icon: LayoutDashboard },
  { href: '/admin/cases',    label: 'All Cases', icon: FolderOpen },
  { href: '/admin/clients',  label: 'Clients',   icon: Users },
  { href: '/admin/messages', label: 'Messages',  icon: MessageSquare },
  { href: '/admin/services', label: 'Services',  icon: Settings },
]

export function AdminMobileNav({ fullName, email }: Props) {
  const [open, setOpen] = useState(false)
  const pathname        = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Top bar */}
      <div className="md:hidden bg-navy px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-white/60" />
          <span className="font-serif text-white text-lg">Admin</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white p-1" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 z-40 flex">
        {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] tracking-wide transition-colors ${
                active ? 'text-white' : 'text-white/40'
              }`}
            >
              <Icon size={18} />
              {label.split(' ')[0]}
            </Link>
          )
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] tracking-wide text-white/40"
        >
          <Menu size={18} />
          More
        </button>
      </nav>

      {/* Slide-out drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-72 bg-navy h-full flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-white/60" />
                <span className="font-serif text-white">Admin Portal</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-3 text-sm rounded-sm transition-all ${
                      active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="px-4 py-4 border-t border-white/10">
              <div className="px-3 py-2 mb-2">
                <p className="text-sm text-white font-light truncate">{fullName || email}</p>
                <p className="text-xs text-white/40 truncate">{email}</p>
              </div>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-sm w-full text-left">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
