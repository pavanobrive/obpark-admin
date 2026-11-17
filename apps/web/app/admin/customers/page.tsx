'use client'

import { useState } from 'react'
import {
  Users,
  BarChart3,
  UserCheck,
  Crown,
  Radio,
  ArrowRight,
} from 'lucide-react'
import { microgrammaBold } from '@/lib/fonts'
import { CustomerTable } from '@/components/admin/customers/CustomerTable'
import { CustomerDetailPanel } from '@/components/admin/customers/CustomerDetailPanel'
import { CustomerMonthOverview } from '@/components/admin/customers/CustomerMonthOverview'
import { useCustomers } from '@/hooks/useCustomers'
import { Header } from '@/components/admin/layout/Header'
import type { Customer } from '@/components/admin/customers/types'

export default function CustomersPage() {
  const [, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'directory'>('overview')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const { data: customers, isLoading } = useCustomers()

  // Calculate high-level summary KPIs
  const totalCount = customers?.length ?? 0
  const activeCount = customers?.filter((c) => c.status === 'Active').length ?? 0
  const vipCount = customers?.filter((c) => c.status === 'VIP').length ?? 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        title="Customers"
        onMenuClick={() => setDrawerOpen(true)}
      />

      <div className="p-4 sm:p-6 space-y-6 flex-1">
        {/* Page Top Header & Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`${microgrammaBold.className} text-[1.375rem] font-bold text-gray-800`}>
              Customer Hub
            </h2>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Monitor monthly registration trends, visitor analytics, and manage client profiles
            </p>
          </div>

          {/* Two-Tab Switcher */}
          <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold shadow-inner self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-[#074139] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Customer Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-[#074139] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Customers Directory</span>
              <span
                className={`text-[0.625rem] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'directory'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-300/80 text-gray-700'
                }`}
              >
                {isLoading ? '—' : totalCount}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: Customer Overview & Monthly Calendar Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Global Quick KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-gray-600 font-semibold">Total Registered</p>
                  <div className="p-2 rounded-lg bg-emerald-50 text-[#074139]">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {isLoading ? '—' : totalCount}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[0.6875rem] text-emerald-700 font-semibold">All accounts</span>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="text-[0.6875rem] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-gray-600 font-semibold">Active Users</p>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {isLoading ? '—' : activeCount}
                </p>
                <p className="text-[0.6875rem] text-gray-500 font-medium mt-2">
                  {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}% verified rate` : '0%'}
                </p>
              </div>

              <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-gray-600 font-semibold">VIP Members</p>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {isLoading ? '—' : vipCount}
                </p>
                <p className="text-[0.6875rem] text-amber-700 mt-2">
                  Frequent buyers
                </p>
              </div>

              <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-gray-400 font-medium">Live Visitors</p>
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Radio className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-300 mt-2">—</p>
                <p className="text-[0.6875rem] text-gray-400 mt-2">Telemetry not connected</p>
              </div>
            </div>

            {/* Interactive Month Overview Component with Calendar Selector */}
            <CustomerMonthOverview
              customers={customers || []}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 2: Customer Directory & Conditional Detail Panel */}
        {activeTab === 'directory' && (
          <div className="animate-in fade-in duration-200">
            {selectedCustomer ? (
              /* Split Layout: Customer Table + Open CustomerDetailPanel */
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex-1 w-full min-w-0">
                  <CustomerTable
                    customers={customers || []}
                    isLoading={isLoading}
                    selectedId={selectedCustomer.id + selectedCustomer.name}
                    onSelect={setSelectedCustomer}
                    containerHeight="calc(100vh - 220px)"
                  />
                </div>

                {/* Opened Detail Panel with close (X) trigger */}
                <div className="w-full xl:w-96 shrink-0 sticky top-24 transition-all duration-300">
                  <CustomerDetailPanel
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                  />
                </div>
              </div>
            ) : (
              /* Full Width Layout: Customer Table with maximum breathing room */
              <div className="w-full">
                <CustomerTable
                  customers={customers || []}
                  isLoading={isLoading}
                  selectedId={null}
                  onSelect={setSelectedCustomer}
                  containerHeight="calc(100vh - 220px)"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
