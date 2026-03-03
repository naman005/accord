import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(new Date(date))
}

export function getShareUrl(token: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/f/${token}`
}

export function compatibilityLabel(score: number): {
  label: string
  color: string
} {
  if (score >= 85) return { label: 'Excellent Match', color: 'text-green-600' }
  if (score >= 70) return { label: 'Good Match', color: 'text-blue-600' }
  if (score >= 55) return { label: 'Moderate Match', color: 'text-yellow-600' }
  if (score >= 40) return { label: 'Some Differences', color: 'text-orange-600' }
  return { label: 'Significant Differences', color: 'text-red-600' }
}