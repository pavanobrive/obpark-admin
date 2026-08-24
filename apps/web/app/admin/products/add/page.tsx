'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'

const AddProductForm = dynamic(
  () => import('@/components/admin/products/AddProductForm').then((mod) => mod.AddProductForm),
  { ssr: false }
)

export default function AddProductPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">

      <Header title="Add Product" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        <AddProductForm />
      </div>

    </div>
  )
}