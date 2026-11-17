'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react'
import { useUpdateProfile } from '@/hooks/useProfile'
import type { AdminProfile } from './types'
import { microgrammaBold } from '@/lib/fonts'
import { useAuthStore } from '@/store/auth.store'
import { dialog } from '@/lib/dialog'

interface ProfileUpdateFormProps {
  profile?: AdminProfile
  isEditing?: boolean
  setIsEditing?: (editing: boolean) => void
}

export function ProfileUpdateForm({ profile, isEditing, setIsEditing }: ProfileUpdateFormProps) {
  const [internalEditing, setInternalEditing] = useState(false)
  const editing = isEditing !== undefined ? isEditing : internalEditing
  const setEditing = (val: boolean) => {
    if (setIsEditing) setIsEditing(val)
    setInternalEditing(val)
  }

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dob: '',
    location: '',
    bio: '',
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
        bio: profile.bio ?? '',
      })
      setProfileImage(profile.avatarUrl ?? null)
    }
  }, [profile])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      dialog.alert({
        title: 'Invalid File',
        message: 'Please choose a valid image file (PNG, JPG, WebP, etc.).',
        variant: 'warning',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      dialog.alert({
        title: 'File Too Large',
        message: 'Profile image size must not exceed 5MB.',
        variant: 'warning',
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = useAuthStore.getState().accessToken

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3055'}/admin/media/upload?folder=profile`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        }
      )

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.message || 'Failed to upload image')
      }

      const data = await res.json()
      setProfileImage(data.url)
      dialog.alert({
        title: 'Image Uploaded',
        message: 'Profile picture uploaded. Click "Save Changes" to apply.',
        variant: 'info',
      })
    } catch (err: any) {
      dialog.alert({
        title: 'Upload Failed',
        message: err?.message || 'Could not upload photo. Please check your network and try again.',
        variant: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = () => {
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        dob: profile.dob ?? '',
        location: profile.location ?? '',
        bio: profile.bio ?? '',
      })
      setProfileImage(profile.avatarUrl ?? null)
    }
    setEditing(false)
  }

  const handleSave = () => {
    const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ')

    updateProfile.mutate(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        dob: form.dob,
        location: form.location.trim(),
        avatarUrl: profileImage || undefined,
        bio: form.bio.trim(),
      },
      {
        onSuccess: () => {
          setEditing(false)
          if (fullName) {
            useAuthStore.getState().updateUser({
              name: fullName,
              email: form.email.trim(),
            })
          }
          dialog.alert({
            title: 'Profile Updated',
            message: 'Your profile details have been saved successfully.',
            variant: 'success',
          })
        },
        onError: (err: any) => {
          const errMsg = err?.response?.data?.message || err?.message || 'Failed to save changes.'
          dialog.alert({
            title: 'Save Failed',
            message: Array.isArray(errMsg) ? errMsg.join('\n') : errMsg,
            variant: 'error',
          })
        },
      }
    )
  }

  const getInitials = () => {
    const f = form.firstName?.[0] || ''
    const l = form.lastName?.[0] || ''
    return (f + l).toUpperCase() || 'AD'
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className={`font-semibold text-gray-800 ${microgrammaBold.className}`}>
            Personal Information
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Update your account details, contact info, and profile photo.
          </p>
        </div>
        <button
          onClick={() => (editing ? handleCancel() : setEditing(true))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {editing ? (
            <>
              <X className="h-3.5 w-3.5" /> Cancel
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" /> Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
        <div className="relative w-16 h-16 rounded-full bg-gray-200 shrink-0 overflow-hidden border border-gray-200">
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Loader2 className="h-6 w-6 animate-spin text-[#074139]" />
            </div>
          ) : profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#074139] to-[#1A817F] text-white flex items-center justify-center font-bold text-lg">
              {getInitials()}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!editing || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#074139' }}
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" /> Upload Photo
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!editing || !profileImage || uploading}
            onClick={handleDeleteImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
          <span className="text-[11px] text-gray-400 block sm:inline ml-1">
            PNG, JPG or WebP up to 5MB
          </span>
        </div>
      </div>

      {/* Profile Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1.5 block">First Name</label>
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            disabled={!editing}
            placeholder="First name"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Last Name</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            disabled={!editing}
            placeholder="Last name"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!editing}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1.5 block">E-mail Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!editing}
            placeholder="admin@obrive.com"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            disabled={!editing}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Location / City</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            disabled={!editing}
            placeholder="e.g. New Delhi, India"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-900 mb-1.5 block">About / Biography</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          disabled={!editing}
          rows={3}
          placeholder="Brief description about your role, responsibilities, or background..."
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] focus:ring-1 focus:ring-[#074139] resize-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
        />
      </div>

      {editing && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending || uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white font-medium disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#074139' }}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateProfile.isPending}
            className="px-4 py-2.5 rounded-lg text-sm text-gray-600 border hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
