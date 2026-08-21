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
    <div className="bg-white border rounded-xl p-6">
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

          <p className="text-xs text-gray-400 mt-4 mb-2">Linked with Social media</p>
          <div className="flex items-center gap-4">
            {(profile?.socials ?? [
              { provider: 'Google', linked: false },
              { provider: 'Facebook', linked: false },
              { provider: 'X', linked: false },
            ]).map((s) => (
              <div key={s.provider} className="flex items-center gap-1 text-xs">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">
                  {s.provider[0]}
                </span>
                <span className={s.linked ? 'text-green-600' : 'text-gray-400'}>
                  {s.linked ? 'Linked' : 'Not linked'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-600 mt-2">Social linkage status not in backend yet — placeholder</p>

          <button className={` ${microgrammaBold.className} mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm text-gray-600`}>
            <Plus className="h-4 w-4" /> Social media
          </button>
        </div>
      )}
    </div>
  )
}