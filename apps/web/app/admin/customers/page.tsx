// apps/web/app/admin/customers/page.tsx
'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { MoreVertical } from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { CustomerTable } from '@/components/admin/customers/CustomerTable'
import { CustomerDetailPanel } from '@/components/admin/customers/CustomerDetailPanel'
import { useCustomers } from '@/hooks/useCustomers'
import { Header } from '@/components/admin/layout/Header'
import type { Customer } from '@/components/admin/customers/types'

const OVERVIEW_CHART = [
  { day: 'Sun', value: 16000 }, { day: 'Mon', value: 27000 }, { day: 'Tue', value: 27000 },
  { day: 'Wed', value: 25409 }, { day: 'Thu', value: 22000 }, { day: 'Fri', value: 30000 }, { day: 'Sat', value: 30000 },
]

export default function CustomersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const { data: customers, isLoading } = useCustomers()

  return (
  <div className="min-h-screen bg-gray-50">

    <Header
  title="Customers"
  onMenuClick={() => setDrawerOpen(true)}
/>

    <div className="p-6 space-y-6">
    
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            {[
              { label: 'Total Customers', value: '—', trend: 'needs backend' },
              { label: 'New Customers', value: '—', trend: 'needs backend' },
              { label: 'Visitor', value: '—', trend: 'needs backend' },
            ].map((k) => (
              <div key={k.label} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <p className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-700`}>{k.label}</p>
                  <MoreVertical className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-1">{k.value}</p>
                <p className="text-xs text-gray-400 mt-1">{k.trend}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${microgrammaBold.className} font-semibold text-gray-800`}>Customer Overview</h2>
              <div className="flex gap-1 text-xs">
                <button className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200">This week</button>
                <button className="px-3 py-1.5 rounded-full text-gray-500 border">Last week</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={OVERVIEW_CHART}>
                <defs>
                  <linearGradient id="cust" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A2F1DF" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#A2F1DF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#cust)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CustomerTable
            customers={customers || []}
            isLoading={isLoading}
            selectedId={selectedCustomer ? selectedCustomer.id + selectedCustomer.name : null}
            onSelect={setSelectedCustomer}
          />
          <CustomerDetailPanel customer={selectedCustomer} />
        </div>
      </div>
    </div>
  )
}