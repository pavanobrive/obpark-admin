'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useChangePassword } from '@/hooks/useProfile'
import { microgrammaBold } from '@/lib/fonts'

export function ChangePasswordCard() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const changePassword = useChangePassword()

  const handleSave = () => {
    if (form.next !== form.confirm) return
    changePassword.mutate({ currentPassword: form.current, newPassword: form.next })
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-gray-800 ${microgrammaBold.className}`}>Change Password</h3>
        <button className="text-xs text-blue-500">Need help?</button>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            placeholder="Enter password"
            className="w-full px-3 py-2 pr-9 rounded-lg border text-sm outline-none"
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button className="text-xs text-blue-500 mt-1">Forgot Current Password? Click here</button>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">New Password</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            placeholder="Enter password"
            className="w-full px-3 py-2 pr-9 rounded-lg border text-sm outline-none"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Re-enter Password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Enter password"
            className="w-full px-3 py-2 pr-9 rounded-lg border text-sm outline-none"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.confirm && form.next !== form.confirm && (
          <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
        )}
      </div>

      <p className="text-[10px] text-amber-600">TODO: no change-password endpoint confirmed on backend yet</p>

      <button
        onClick={handleSave}
        disabled={changePassword.isPending || !form.current || !form.next || form.next !== form.confirm}
        className={` ${microgrammaBold.className} w-full py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-50`}
        style={{ backgroundColor: '#074139' }}
      >
        {changePassword.isPending ? 'Saving...' : 'Save Change'}
      </button>
    </div>
  )
}