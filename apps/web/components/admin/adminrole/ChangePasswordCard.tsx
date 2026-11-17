'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useChangePassword } from '@/hooks/useProfile'
import { microgrammaBold } from '@/lib/fonts'
import { dialog } from '@/lib/dialog'

export function ChangePasswordCard() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const changePassword = useChangePassword()

  const passwordsMatch = form.next && form.confirm && form.next === form.confirm
  const isLengthValid = form.next.length >= 6
  const isFormValid = Boolean(form.current && form.next && passwordsMatch && isLengthValid)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.current) {
      dialog.alert({
        title: 'Current Password Required',
        message: 'Please enter your current account password to proceed.',
        variant: 'error',
      })
      return
    }

    if (!isLengthValid) {
      dialog.alert({
        title: 'Password Too Short',
        message: 'Your new password must be at least 6 characters long.',
        variant: 'warning',
      })
      return
    }

    if (form.next !== form.confirm) {
      dialog.alert({
        title: 'Passwords Do Not Match',
        message: 'The new password and confirmation password do not match. Please re-enter them.',
        variant: 'error',
      })
      return
    }

    changePassword.mutate(
      { currentPassword: form.current, newPassword: form.next },
      {
        onSuccess: () => {
          setForm({ current: '', next: '', confirm: '' })
          dialog.alert({
            title: 'Password Changed Successfully',
            message: 'Your password has been updated. Please remember to use your new password the next time you sign in.',
            variant: 'success',
          })
        },
        onError: (err: any) => {
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to change password. Please ensure your current password is correct.'
          dialog.alert({
            title: 'Password Update Failed',
            message: Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage,
            variant: 'error',
          })
        },
      }
    )
  }

  return (
    <form onSubmit={handleSave} className="bg-white border rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-gray-800 ${microgrammaBold.className}`}>
          Change Password
        </h3>
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Lock className="h-3 w-3" /> Security
        </span>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Current Password</label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            placeholder="Enter current password"
            className="w-full px-3 py-2 pr-9 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1.5 block">New Password</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            placeholder="At least 6 characters"
            className="w-full px-3 py-2 pr-9 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showNew ? 'Hide new password' : 'Show new password'}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.next && !isLengthValid && (
          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Password must be at least 6 characters
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Confirm New Password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Re-enter new password"
            className="w-full px-3 py-2 pr-9 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.confirm && (
          <p className={`text-[11px] mt-1 flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
            {passwordsMatch ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Passwords match
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" /> Passwords do not match
              </>
            )}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={changePassword.isPending || !isFormValid}
        className="w-full py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 hover:opacity-95 shadow-xs"
        style={{ backgroundColor: '#074139' }}
      >
        {changePassword.isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Updating Password...
          </>
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  )
}
