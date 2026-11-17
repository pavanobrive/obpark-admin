'use client'

import { Pencil, Copy, Check, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import type { AdminProfile } from './types'
import { microgrammaBold } from '@/lib/fonts'
import { dialog } from '@/lib/dialog'
import { getFullImageUrl } from '@/lib/utils'

interface ProfileCardProps {
  profile?: AdminProfile
  isLoading: boolean
  onEdit?: () => void
}

export function ProfileCard({ profile, isLoading, onEdit }: ProfileCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    if (!profile?.email) return
    navigator.clipboard.writeText(profile.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    dialog.alert({
      title: 'Copied to Clipboard',
      message: `Email "${profile.email}" copied to clipboard.`,
      variant: 'info',
    })
  }

  const formatRole = (role?: string) => {
    if (!role) return 'Administrator'
    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const getInitials = () => {
    const first = profile?.firstName?.[0] || ''
    const last = profile?.lastName?.[0] || ''
    const fallback = profile?.email?.[0]?.toUpperCase() || 'A'
    return (first + last).toUpperCase() || fallback
  }

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Admin User'

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <h3 className={`text-base font-semibold text-gray-800 ${microgrammaBold.className}`}>
          Profile Overview
        </h3>
        <div className="flex items-center gap-1.5 text-gray-400">
          {onEdit && (
            <button
              onClick={onEdit}
              title="Edit Profile"
              className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Edit profile"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleCopyEmail}
            title="Copy Email"
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Copy email"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto" />
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3.5">
            {profile?.avatarUrl ? (
              <img
                src={getFullImageUrl(profile.avatarUrl)}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/20 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#074139] to-[#1A817F] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {getInitials()}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"
              title="Active Account"
            />
          </div>

          <h4 className="text-base font-semibold text-gray-800">{fullName}</h4>
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {profile?.email || 'No email provided'}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{formatRole(profile?.role)}</span>
          </div>

          <div className="w-full border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600 text-left">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone
              </span>
              <span className="font-medium text-gray-700">{profile?.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location
              </span>
              <span className="font-medium text-gray-700">{profile?.location || 'Not set'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
