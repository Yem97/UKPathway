import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import WhatsAppButton from '@/components/sections/WhatsAppButton'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
