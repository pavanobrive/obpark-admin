// apps/web/app/admin/adminrole/page.tsx
'use client'

import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'
import { ProfileCard } from '@/components/admin/adminrole/ProfileCard'
import { ChangePasswordCard } from '@/components/admin/adminrole/ChangePasswordCard'
import { ProfileUpdateForm } from '@/components/admin/adminrole/ProfileUpdateForm'
import { useProfile } from '@/hooks/useProfile'
import { microgrammaBold } from '@/lib/fonts'

export default function AdminRolePage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading } = useProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Admin Profile"
        onMenuClick={() => setDrawerOpen(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className={`font-semibold text-xl text-gray-800 ${microgrammaBold.className}`}>
            Account Profile & Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal profile, contact information, and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-6">
            <ProfileCard
              profile={profile}
              isLoading={isLoading}
              onEdit={() => setIsEditing(true)}
            />
            <ChangePasswordCard />
          </div>
          <div className="lg:col-span-2">
            <ProfileUpdateForm
              profile={profile}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
