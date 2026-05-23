'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isHeroPage = pathname === '/'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled || !isHeroPage
            ? 'bg-white border-b border-navy/10 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <nav className="container-wide flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <span
              className={cn(
                'font-serif text-xl leading-tight transition-colors duration-300',
                scrolled || !isHeroPage ? 'text-navy' : 'text-white'
              )}
            >
              UK Pathway
            </span>
            <span
              className={cn(
                'text-[10px] tracking-[0.25em] uppercase transition-colors duration-300',
                scrolled || !isHeroPage ? 'text-navy/50' : 'text-white/60'
              )}
            >
              Services
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'text-xs tracking-widest uppercase transition-colors duration-200',
                    pathname === link.href
                      ? scrolled || !isHeroPage ? 'text-navy' : 'text-white'
                      : scrolled || !isHeroPage
                        ? 'text-navy/60 hover:text-navy'
                        : 'text-white/70 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={cn(
                'text-xs tracking-widest uppercase transition-colors duration-200',
                scrolled || !isHeroPage
                  ? 'text-navy/60 hover:text-navy'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className={cn(
                'px-6 py-2.5 text-xs tracking-widest uppercase transition-all duration-300',
                scrolled || !isHeroPage
                  ? 'bg-navy text-white hover:bg-navy-800'
                  : 'bg-white text-navy hover:bg-white/90'
              )}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'md:hidden p-2 transition-colors',
              scrolled || !isHeroPage ? 'text-navy' : 'text-white'
            )}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-luxury flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-navy/10">
                <span className="font-serif text-navy text-lg">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="text-navy p-1">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-6 py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm tracking-widest uppercase text-navy/70 hover:text-navy transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="px-6 py-8 border-t border-navy/10 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="btn-secondary text-center text-xs py-3"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-center text-xs py-3"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
