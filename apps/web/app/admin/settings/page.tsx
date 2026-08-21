// apps/web/app/admin/settings/page.tsx
'use client'

import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'

export default function SettingsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Settings" onMenuClick={() => setDrawerOpen(true)} />
      <div className="p-6">
        <div className="bg-white border rounded-xl p-8 text-center text-sm text-gray-400">
          No Figma design yet for Settings — this page is a placeholder. Store config, tax rules, shipping settings would live here later.
        </div>
      </div>
    </div>
  )
}