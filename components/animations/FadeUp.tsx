'use client'

import { motion, type MotionProps } from 'framer-motion'

interface FadeUpProps extends MotionProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export default function FadeUp({
  children,
  delay = 0,
  duration = 0.8,
  className,
  once = true,
  ...props
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
