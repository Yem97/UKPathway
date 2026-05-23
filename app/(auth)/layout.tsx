import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <Link href="/" className="relative z-10 flex flex-col">
          <span className="font-serif text-2xl text-white">UK Pathway</span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">Services</span>
        </Link>

        <div className="relative z-10">
          <p className="font-serif text-4xl text-white leading-tight mb-6">
            Your trusted bridge
            <br />
            <em className="not-italic text-white/60">to UK documentation</em>
          </p>
          <div className="w-12 h-px bg-white/30 mb-6" />
          <p className="text-sm text-white/50 font-light leading-relaxed max-w-sm">
            Secure client portal — track your applications, upload documents, and communicate directly with your case handler.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/30 font-light">
          &copy; {new Date().getFullYear()} UK Pathway Services
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex flex-col mb-10 lg:hidden">
            <span className="font-serif text-2xl text-navy">UK Pathway</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-navy/40">Services</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
