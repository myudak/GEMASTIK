import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function riskLabel(risk?: string) {
  if (risk === 'critical') return 'Kritis'
  if (risk === 'high') return 'Risiko Tinggi'
  if (risk === 'medium') return 'Menengah'
  if (risk === 'low') return 'Rendah'
  return 'Info'
}
