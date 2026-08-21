'use client'

import { AddProductForm } from '@/components/admin/products/AddProductForm'
import { useState } from 'react'
import { Header } from '@/components/admin/layout/Header'

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