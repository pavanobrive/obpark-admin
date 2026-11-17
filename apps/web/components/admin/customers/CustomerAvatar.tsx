'use client'

import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { getFullImageUrl } from '@/lib/utils'

interface CustomerAvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CustomerAvatar({
  src,
  name,
  size = 'sm',
  className = '',
}: CustomerAvatarProps) {
  const [hasError, setHasError] = useState(false)

  // Reset error state whenever the image source changes
  useEffect(() => {
    setHasError(false)
  }, [src])

  const sizeClasses = {
    sm: 'w-8 h-8 min-w-[2rem]',
    md: 'w-10 h-10 min-w-[2.5rem]',
    lg: 'w-14 h-14 min-w-[3.5rem]',
  }[size]

  const iconClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }[size]

  const cleanSrc = src?.trim() ? getFullImageUrl(src.trim()) : ''

  // If no source provided or loading error encountered, display the default user icon
  if (!cleanSrc || cleanSrc === 'null' || cleanSrc === 'undefined' || hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-emerald-50 border border-emerald-200/80 text-[#074139] flex items-center justify-center shrink-0 shadow-xs ${className}`}
        title={name || 'Customer'}
      >
        <User className={`${iconClasses} text-[#074139] stroke-[2.2]`} />
      </div>
    )
  }

  return (
    <img
      src={cleanSrc}
      alt={name ? `${name}'s avatar` : 'Customer avatar'}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${sizeClasses} rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0 ${className}`}
    />
  )
}
