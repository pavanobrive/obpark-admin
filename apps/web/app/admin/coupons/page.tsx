// apps/web/app/admin/coupons/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/admin/layout/Header'
import { microgrammaBold } from '@/lib/fonts'
import { Plus, MoreVertical, Search, Filter, X } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Coupon {
  id: string
  code: string
  description?: string
  discountType: 'FLAT' | 'PERCENTAGE'
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  usedCount: number
  isActive: boolean
  expiresAt?: string
}

const TABS = ['All Coupons', 'Active', 'Disabled', 'Expired']

function isExpired(coupon: Coupon) {
  return !!coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
}

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState('All Coupons')
  const [showForm, setShowForm] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const qc = useQueryClient()

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => api.get<Coupon[]>('/coupons'),
  })

  const createCoupon = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setShowForm(false)
      reset()
    },
  })

  const toggleCoupon = useMutation({
    mutationFn: (id: string) => api.patch(`/coupons/${id}/toggle`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })

  interface CouponFormValues {
  code: string
  description?: string
  discountType: 'FLAT' | 'PERCENTAGE'
  discountValue: string
  minOrderValue?: string
  maxUses?: string
  expiresAt?: string
}

const { register, handleSubmit, reset, watch } = useForm<CouponFormValues>({ defaultValues: { discountType: 'FLAT' } })
  const discountType = watch('discountType')

  const onSubmit = (data: any) => {
    createCoupon.mutate({
      ...data,
      discountValue: parseFloat(data.discountValue),
      minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : undefined,
      maxUses: data.maxUses ? parseInt(data.maxUses) : undefined,
      expiresAt: data.expiresAt || undefined,
    })
  }

  const filtered = (coupons ?? []).filter((c) => {
    if (activeTab === 'Active') return c.isActive && !isExpired(c)
    if (activeTab === 'Disabled') return !c.isActive
    if (activeTab === 'Expired') return isExpired(c)
    return true
  })

  const total = coupons?.length ?? 0
  const activeCount = coupons?.filter((c) => c.isActive && !isExpired(c)).length ?? 0
  const expiredCount = coupons?.filter(isExpired).length ?? 0
  const totalUses = coupons?.reduce((sum, c) => sum + c.usedCount, 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
  <Header
  title="Coupons"
  onMenuClick={() => setDrawerOpen(true)}
/>

  <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`${microgrammaBold.className} font-semibold text-[18px] text-gray-800`}>Coupon List</h2>
          <button
  onClick={() => setShowForm(true)}
  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] text-white ${microgrammaBold.className}`}
  style={{ backgroundColor: '#074139' }}
>
  <Plus className="h-4 w-4" />
  <span>Add Coupon</span>
</button>
        </div>

        {/* KPI cards — all real, computed from actual coupon list */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Coupons', value: total },
            { label: 'Active Coupons', value: activeCount },
            { label: 'Expired Coupons', value: expiredCount },
            { label: 'Total Redemptions', value: totalUses },
          ].map((k) => (
            <div key={k.label} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <p className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-700`}>{k.label}</p>
                <MoreVertical className="h-4 w-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{isLoading ? '—' : k.value}</p>
              <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
            </div>
          ))}
        </div>

        {/* Filter tabs + table */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex bg-gray-50 rounded-lg p-1 text-sm overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  style={activeTab === tab ? { color: '#074139' } : {}}
                >
                  {tab === 'All Coupons' ? `All Coupons (${total})` : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input placeholder="Search coupon code" className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-48" />
              </div>
              <button className="p-2 rounded-lg border text-gray-500"><Filter className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-600 bg-green-50">
                  <th className="px-3 py-2.5 font-medium rounded-l-lg">Code</th>
                  <th className="px-3 py-2.5 font-medium">Description</th>
                  <th className="px-3 py-2.5 font-medium">Discount</th>
                  <th className="px-3 py-2.5 font-medium">Min Order</th>
                  <th className="px-3 py-2.5 font-medium">Uses</th>
                  <th className="px-3 py-2.5 font-medium">Expires</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={8} className="py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : !filtered.length ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">No coupons found</td></tr>
                ) : (
                  filtered.map((c) => {
                    const expired = isExpired(c)
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-3 py-3 font-mono font-bold text-gray-800">{c.code}</td>
                        <td className="px-3 py-3 text-gray-600">{c.description || '—'}</td>
                        <td className="px-3 py-3 text-gray-700">
                          {c.discountType === 'FLAT' ? `₹${Number(c.discountValue).toLocaleString('en-IN')} off` : `${c.discountValue}% off`}
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {c.minOrderValue ? `₹${Number(c.minOrderValue).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-3 py-3 text-gray-700">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${expired ? 'bg-gray-400' : c.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={expired ? 'text-gray-500' : c.isActive ? 'text-green-600' : 'text-red-500'}>
                              {expired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleCoupon.mutate(c.id)}
                            disabled={expired || toggleCoupon.isPending}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors disabled:opacity-40 ${
                              c.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {c.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create coupon modal — reuses your existing Doc 2 form pattern */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className={`${microgrammaBold.className} font-bold text-lg`} style={{ color: '#074139' }}>Create Coupon</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Coupon Code</label>
                <input {...register('code', { required: true })} placeholder="OBRIVE100" className="w-full px-3 py-2 rounded-lg border text-sm outline-none uppercase" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <input {...register('description')} placeholder="₹100 off on orders above ₹500" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Discount Type</label>
                  <select {...register('discountType')} className="w-full px-3 py-2 rounded-lg border text-sm outline-none">
                    <option value="FLAT">Flat (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{discountType === 'FLAT' ? 'Amount (₹)' : 'Percentage (%)'}</label>
                  <input type="number" {...register('discountValue', { required: true })} placeholder={discountType === 'FLAT' ? '100' : '10'} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Min Order Value (₹)</label>
                  <input type="number" {...register('minOrderValue')} placeholder="500" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max Uses</label>
                  <input type="number" {...register('maxUses')} placeholder="Unlimited" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                <input type="date" {...register('expiresAt')} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
              </div>

              {createCoupon.isError && (
                <p className="text-xs text-red-500">Something went wrong — check the code isn't already in use.</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createCoupon.isPending}
                  className="flex-1 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-60"
                  style={{ backgroundColor: '#074139' }}
                >
                  {createCoupon.isPending ? 'Creating...' : 'Create Coupon'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border font-medium text-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}