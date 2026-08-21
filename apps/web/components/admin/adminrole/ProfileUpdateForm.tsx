'use client'

import { useState, useEffect } from 'react'
import { Upload, Trash2, Wand2, Pencil } from 'lucide-react'
import { useUpdateProfile } from '@/hooks/useProfile'
import type { AdminProfile } from './types'
import { microgrammaBold } from '@/lib/fonts'

interface ProfileUpdateFormProps {
  profile?: AdminProfile
}

export function ProfileUpdateForm({ profile }: ProfileUpdateFormProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', dob: '', location: '', bio: '',
  })
  const updateProfile = useUpdateProfile()

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        dob: profile.dob ?? '',
        location: profile.location ?? '',
        bio: '',
      })
    }
  }, [profile])

  const handleSave = () => {
    updateProfile.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      dob: form.dob,
      location: form.location,
    })
    setEditing(false)
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-gray-800 ${microgrammaBold.className}`}>Profile Update</h3>
        <button
          onClick={() => setEditing(!editing)}
          className={` ${microgrammaBold.className} flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-gray-600`}
        >
          <Pencil className="h-3.5 w-3.5" /> {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
        <button
          disabled={!editing}
          className={` ${microgrammaBold.className} flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium disabled:opacity-50`}
          style={{ backgroundColor: '#074139' }}
        >
          <Upload className="h-3.5 w-3.5" /> Upload New
        </button>
        <button disabled={!editing} className={` ${microgrammaBold.className} flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-gray-600 disabled:opacity-50`}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">First Name</label>
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">E-mail</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="text-[10px] text-amber-600 mt-1">DOB field not confirmed in backend schema</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="text-[10px] text-amber-600 mt-1">Location field not confirmed in backend schema</p>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Credit Card</label>
        <input
          disabled={!editing}
          placeholder="•••• •••• •••• ••••"
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p className="text-[10px] text-amber-600 mt-1">Not stored in backend — likely shouldn't be, handle via payment gateway tokenization instead</p>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Biography</label>
        <div className="relative">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            disabled={!editing}
            rows={3}
            placeholder="Enter a biography about you"
            className="w-full px-3 py-2 pr-14 rounded-lg border text-sm outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2 text-gray-400">
            <Pencil className="h-3.5 w-3.5" />
            <Wand2 className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="text-[10px] text-amber-600 mt-1">Biography field not in backend schema yet</p>
      </div>

      {editing && (
        <button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="px-4 py-2 rounded-lg text-sm text-white font-medium"
          style={{ backgroundColor: '#074139' }}
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  )
}