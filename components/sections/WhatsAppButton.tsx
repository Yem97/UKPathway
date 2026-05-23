'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/utils'

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20UK%20Pathway%20Services.`

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-luxury flex items-center justify-center"
    >
      <MessageCircle size={26} fill="currentColor" strokeWidth={0} />
      <span className="sr-only">Chat on WhatsApp</span>
    </motion.a>
  )
}
