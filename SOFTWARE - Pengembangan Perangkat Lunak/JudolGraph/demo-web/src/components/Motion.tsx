import { motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../lib/utils'

const smoothEase = [0.22, 1, 0.36, 1] as const

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: smoothEase },
}

const containerStagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
}

const itemRise = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: smoothEase },
}

export function MotionPage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} {...pageTransition}>
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      animate="animate"
      className={className}
      initial="initial"
      variants={containerStagger}
    >
      {children}
    </motion.div>
  )
}

export function MotionItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={itemRise}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      {children}
    </motion.div>
  )
}

export function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-3 w-3', className)}>
      <motion.span
        animate={{ opacity: [0.55, 0], scale: [1, 2.4] }}
        className="absolute inline-flex h-full w-full rounded-full bg-current"
        transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity }}
      />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
    </span>
  )
}

export function CountUp({
  value,
  className,
  duration = 900,
}: {
  value: number
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 24, stiffness: 190 })
  const rounded = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString('id-ID'),
  )

  useEffect(() => {
    if (!isInView) return
    const timeout = window.setTimeout(() => motionValue.set(value), duration * 0.02)
    return () => window.clearTimeout(timeout)
  }, [duration, isInView, motionValue, value])

  return <motion.span className={className} ref={ref}>{rounded}</motion.span>
}
