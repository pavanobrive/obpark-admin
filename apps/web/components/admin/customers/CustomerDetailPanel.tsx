// apps/web/components/admin/customers/CustomerDetailPanel.tsx
'use client'

import { Copy, MapPin, Phone } from 'lucide-react'
import type { Customer } from './types'

interface CustomerDetailPanelProps {
  customer: Customer | null
}

export function CustomerDetailPanel({ customer }: CustomerDetailPanelProps) {
  return (
    <div className="bg-white border rounded-xl p-6">
      {!customer ? (
        <p className="text-sm text-gray-400 text-center py-12">Click a customer row to see details</p>
      ) : (
        <div className="space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 truncate">{customer.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="truncate">{customer.name.toLowerCase().replace(' ', '.')}@example.com</span>
                <button aria-label="Copy email" className="shrink-0 hover:text-gray-600">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Customer Info</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                {customer.phone}
              </div>
              {/* TODO: address not in current placeholder data — needs a real field once GET /admin/customers exists */}
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-400">Address not available yet</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
<div>
  <p className="text-xs text-gray-400 mb-2">Social Media</p>
  <div className="flex items-center gap-2">
    {['FB', 'TW', 'IN', 'IG'].map((label) => (
      <div
        key={label}
        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400"
      >
        {label}
      </div>
    ))}
  </div>
  {/* TODO: no social account linkage in backend yet — placeholder badges only */}
</div>

          {/* Activity */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Activity</p>
            <div className="space-y-1 text-xs text-gray-600">
              {/* TODO: needs real registration/last-purchase dates from backend */}
              <p>Registration: <span className="text-gray-400">not available yet</span></p>
              <p>Last purchase: <span className="text-gray-400">not available yet</span></p>
            </div>
          </div>

          {/* Order overview */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Order overview</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded-lg p-2 text-center">
                <p className="font-bold text-gray-800">{customer.orders}</p>
                <p className="text-[10px] text-gray-400">Total order</p>
              </div>
              <div className="border rounded-lg p-2 text-center">
                <p className="font-bold text-green-600">{Math.round(customer.orders * 0.9)}</p>
                <p className="text-[10px] text-gray-400">Completed</p>
              </div>
              <div className="border rounded-lg p-2 text-center">
                <p className="font-bold text-red-500">{Math.round(customer.orders * 0.1)}</p>
                <p className="text-[10px] text-gray-400">Canceled</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}