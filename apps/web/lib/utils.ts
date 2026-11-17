import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBackendBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  if (envUrl && !envUrl.includes('onrender.com') && !envUrl.includes('localhost:3001') && !envUrl.includes('localhost:3055')) {
    return envUrl.replace(/\/$/, '')
  }
  return 'https://api.obpark.in'
}

export function getFullImageUrl(path: string | undefined | null, fallback = ''): string {
  if (!path) return fallback
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    if (path.includes('onrender.com')) {
      return path.replace(/https?:\/\/[^/]+/, 'https://api.obpark.in')
    }
    return path
  }
  if (path.startsWith('/Images/') || path.startsWith('/images/') || path.startsWith('/blogs/') || path.startsWith('/fonts/')) {
    return path
  }
  let clean = path.replace(/^\/?products\//, '/uploads/products/')
  if (clean.startsWith('/uploads/products/')) {
    const rest = clean.replace('/uploads/products/', '')
    const parts = rest.split('/')
    if (parts.length >= 3) {
      clean = `/uploads/products/${parts[1]}/${parts.slice(2).join('/')}`
    }
  }
  const base = getBackendBaseUrl()
  return `${base}${clean.startsWith('/') ? '' : '/'}${clean}`
}