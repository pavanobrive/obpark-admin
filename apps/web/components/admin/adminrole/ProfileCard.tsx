'use client'

import { Pencil, Share2, Plus } from 'lucide-react'
import type { AdminProfile } from './types'
import { microgrammaBold } from '@/lib/fonts'

interface ProfileCardProps {
  profile?: AdminProfile
  isLoading: boolean
}

export function ProfileCard({ profile, isLoading }: ProfileCardProps) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-[16px] font-semibold text-gray-800 ${microgrammaBold.className}`}>Profile</h3>
        <div className="flex items-center gap-2 text-gray-400">
          <button aria-label="Edit profile"><Pencil className="h-4 w-4" /></button>
          <button aria-label="Share profile"><Share2 className="h-4 w-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-3" />
          <p className="font-semibold text-gray-800">{profile?.firstName} {profile?.lastName}</p>
          <p className="text-xs text-gray-400">{profile?.email}</p>
        </div>
      )}
    </div>
  )
}