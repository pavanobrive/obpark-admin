// apps/web/components/admin/customers/CustomerDetailPanel.tsx
'use client'

import { useState } from 'react'
import { Copy, MapPin, Phone, Mail, Check, User, ShoppingBag, CreditCard } from 'lucide-react'
import type { Customer } from './types'

interface CustomerDetailPanelProps {
  customer: Customer | null
}

export function CustomerDetailPanel({ customer }: CustomerDetailPanelProps) {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    if (!customer?.email || customer.email === '—') return
    navigator.clipboard.writeText(customer.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border rounded-xl p-6 shadow-md">
      {!customer ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-2">
            <User className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-600">No customer selected</p>
          <p className="text-xs text-gray-400 mt-1">Click any customer row to view their full profile & spend</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-3 pb-4 border-b">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt=""
                className="w-14 h-14 rounded-full object-cover bg-gray-100 border shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-lg shrink-0">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800 truncate text-base">{customer.name}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    customer.status === 'VIP'
                      ? 'bg-amber-100 text-amber-700'
                      : customer.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <span className="truncate">{customer.email || 'No email registered'}</span>
                {customer.email && customer.email !== '—' && (
                  <button
                    onClick={copyEmail}
                    aria-label="Copy email"
                    className="shrink-0 text-gray-400 hover:text-gray-600 p-0.5"
                    title="Copy email"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <ShoppingBag className="h-3.5 w-3.5 text-[#074139]" />
                <span>Orders</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{customer.orderCount}</p>
            </div>
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>Total Spend</span>
              </div>
              <p className="text-lg font-bold text-emerald-800">
                ₹{customer.totalSpend.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Contact & Location
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{customer.phone || 'Phone not available'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="truncate">{customer.email || 'Email not available'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{customer.city && customer.city !== '—' ? customer.city : 'City not specified'}</span>
              </div>
            </div>
          </div>

          {/* Saved Delivery Addresses */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Saved Addresses ({customer.addresses?.length || 0})
            </p>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-2">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/60 text-xs text-gray-700 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {addr.label || addr.type || 'Address'}
                      </span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600">
                      {addr.streetAddress}
                      {addr.apartmentSuite ? `, ${addr.apartmentSuite}` : ''}
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {addr.city}, {addr.zipCode} • {addr.country}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No saved delivery addresses</p>
            )}
          </div>

          {/* Connected Badges */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Authentication Badges
            </p>
            <div className="flex items-center gap-2">
              {['Phone Verified', 'Platform User'].map((label) => (
                <div
                  key={label}
                  className="px-2.5 py-1 rounded-md bg-gray-100 text-[11px] font-medium text-gray-600"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
