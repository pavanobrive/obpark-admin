'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { X, Loader2, Plus, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { AdminProduct, useUpdateProduct, useTaxes } from '@/hooks/useAdminProducts'
import { useCategories } from '@/hooks/useCategories'
import { useAuthStore } from '@/store/auth.store'
import { microgrammaBold } from '@/lib/fonts'

interface EditProductModalProps {
  product: AdminProduct
  onClose: () => void
}

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const updateProduct = useUpdateProduct()
  const { data: categories = [] } = useCategories()
  const { data: taxes = [] } = useTaxes()

  const [form, setForm] = useState({
    productId: product.productId || '',
    productName: product.productName || product.name || '',
    productHeading: product.productHeading || '',
    brand: product.brand || 'OBPARK',
    productDescription: product.productDescription || product.description || '',
    longDescription: product.longDescription || '',
    productFeatures: Array.isArray(product.productFeatures)
      ? product.productFeatures.join('; ')
      : '',
    productCost: String(product.productCost ?? product.basePrice ?? 0),
    price: String(product.price ?? 0),
    hsnCode: product.hsnCode || product.taxCode || '',
    platformCharges: String(product.platformCharges ?? 0),
    discountCoupon: product.discountCoupon || '',
    discountText: product.discountText || '',
    shippingInformation: product.shippingInformation || 'Standard shipping (3-5 business days)',
    categoryId: product.categoryId || product.category?.id || '',
  })

  const [images, setImages] = useState<string[]>(
    product.images && product.images.length > 0
      ? product.images
      : (product.imagePath ? [product.imagePath] : [])
  )
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Find selected tax rule from database taxes list
  const selectedTax = useMemo(() => {
    if (!form.hsnCode) return null
    return taxes.find((t) => t.code === form.hsnCode) || null
  }, [form.hsnCode, taxes])

  const gstRate = selectedTax ? Number(selectedTax.gstRate) : Number(product.gstRate ?? 18)

  // Real-time calculation: Base Cost + GST = Final Selling Price
  const calculations = useMemo(() => {
    const cost = parseFloat(form.productCost) || 0
    const gstAmount = Number(((cost * gstRate) / 100).toFixed(2))
    const calculatedPrice = Number((cost + gstAmount).toFixed(2))
    return { cost, gstAmount, calculatedPrice }
  }, [form.productCost, gstRate])

  // When HSN or cost changes, keep price in sync unless user deliberately edits price
  const handleCostChange = (val: string) => {
    const cost = parseFloat(val) || 0
    const gstAmount = Number(((cost * gstRate) / 100).toFixed(2))
    setForm((prev) => ({
      ...prev,
      productCost: val,
      price: String(Number((cost + gstAmount).toFixed(2))),
    }))
  }

  const handleHsnChange = (code: string) => {
    const chosen = taxes.find((t) => t.code === code)
    const rate = chosen ? Number(chosen.gstRate) : 18
    const cost = parseFloat(form.productCost) || 0
    const gstAmount = Number(((cost * rate) / 100).toFixed(2))
    setForm((prev) => ({
      ...prev,
      hsnCode: code,
      price: String(Number((cost + gstAmount).toFixed(2))),
    }))
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadError('')
    setUploading(true)

    try {
      const uploaded: string[] = []
      const token = useAuthStore.getState().accessToken

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3055'}/admin/media/upload`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
          }
        )
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        uploaded.push(data.url)
      }
      setImages((prev) => [...prev, ...uploaded])
    } catch {
      setUploadError('Failed to upload image. Please try again or paste image URL.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return
    setImages((prev) => [...prev, imageUrlInput.trim()])
    setImageUrlInput('')
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!form.productName.trim()) {
      setErrorMessage('Product Name is required')
      return
    }
    if (!form.productCost || parseFloat(form.productCost) <= 0) {
      setErrorMessage('Base cost must be greater than zero')
      return
    }
    if (!form.categoryId) {
      setErrorMessage('Please select a category')
      return
    }

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        data: {
          productId: form.productId.trim() || undefined,
          productName: form.productName.trim(),
          name: form.productName.trim(),
          title: form.productHeading.trim() || form.productName.trim(),
          productHeading: form.productHeading.trim() || undefined,
          brand: form.brand.trim() || 'OBPARK',
          productDescription: form.productDescription.trim() || undefined,
          longDescription: form.longDescription.trim() || undefined,
          productFeatures: form.productFeatures
            ? form.productFeatures.split(';').map((s) => s.trim()).filter(Boolean)
            : [],
          productCost: parseFloat(form.productCost),
          basePrice: parseFloat(form.productCost),
          price: parseFloat(form.price) || calculations.calculatedPrice,
          platformCharges: parseFloat(form.platformCharges) || 0,
          discountCoupon: form.discountCoupon.trim() || undefined,
          discountText: form.discountText.trim() || undefined,
          hsnCode: form.hsnCode || undefined,
          taxCode: form.hsnCode || undefined,
          gstRate,
          gst: calculations.gstAmount,
          currencySymbol: '₹',
          categoryId: form.categoryId,
          imagePath: images[0] || undefined,
          images,
          galleryImages: images,
          shippingInformation: form.shippingInformation.trim() || undefined,
        },
      })
      onClose()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update product')
    }
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`${microgrammaBold.className} text-lg font-bold text-gray-800`}>
                Edit Product
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-gray-100 text-gray-600 border">
                {product.productId || product.sku}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Modify catalog attributes, dynamic HSN tax rates, and logistics specifications.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Details */}
          <div className="space-y-4">
            <h3 className={`${microgrammaBold.className} text-xs font-bold text-gray-400 uppercase tracking-wider`}>
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Product Name *</label>
                <input
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  placeholder="e.g. Ceramic Quick Coat"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Product ID (Unique SKU) *</label>
                <input
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm font-mono outline-none focus:border-[#074139]"
                  placeholder="e.g. OB-CAR-001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Product Subtitle / Heading</label>
                <input
                  value={form.productHeading}
                  onChange={(e) => setForm({ ...form, productHeading: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  placeholder="e.g. Premium Hydrophobic Spray"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Brand</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  placeholder="OBPARK"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing, Dynamic HSN & GST */}
          <div className="space-y-4 pt-2 border-t">
            <h3 className={`${microgrammaBold.className} text-xs font-bold text-gray-400 uppercase tracking-wider`}>
              Pricing & HSN Tax Engine
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Base Cost (Excluding GST) *</label>
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:border-[#074139]">
                  <span className="px-3 text-sm text-gray-500 bg-gray-50 border-r">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.productCost}
                    onChange={(e) => handleCostChange(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    placeholder="1000.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">HSN / Tax Rule</label>
                <select
                  value={form.hsnCode}
                  onChange={(e) => handleHsnChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] bg-white"
                >
                  <option value="">Standard Default (18% GST)</option>
                  {taxes.map((t) => (
                    <option key={t.code} value={t.code}>
                      [{t.type}] HSN {t.code} — {t.description} ({Number(t.gstRate)}% GST)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Tax Breakdown Card */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-900 mb-2">
                <span>Dynamic GST Calculation</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {gstRate}% GST Slab
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block">Base Cost</span>
                  <span className="font-semibold text-gray-800">
                    ₹{calculations.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">GST ({gstRate}%)</span>
                  <span className="font-semibold text-emerald-700">
                    +₹{calculations.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Calculated Price</span>
                  <span className="font-bold text-gray-900 text-sm">
                    ₹{calculations.calculatedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Final Consumer Selling Price *</label>
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:border-[#074139]">
                  <span className="px-3 text-sm text-gray-500 bg-gray-50 border-r">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-emerald-800 outline-none"
                    placeholder="1180.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Platform Charges (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.platformCharges}
                  onChange={(e) => setForm({ ...form, platformCharges: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Descriptions & Features */}
          <div className="space-y-4 pt-2 border-t">
            <h3 className={`${microgrammaBold.className} text-xs font-bold text-gray-400 uppercase tracking-wider`}>
              Catalog Content & Bullet Features
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Short Description</label>
              <textarea
                value={form.productDescription}
                onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#074139]"
                placeholder="Brief summary displayed on product cards..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Long Description</label>
              <textarea
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#074139]"
                placeholder="Comprehensive specifications, safety warnings, and compatibility notes..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Product Features (Semicolon ; separated)
              </label>
              <textarea
                value={form.productFeatures}
                onChange={(e) => setForm({ ...form, productFeatures: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#074139]"
                placeholder="Hydrophobic shine; UV resistance; Long lasting; Scratch resistant"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">Separate bullet points with a semicolon (;)</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Shipping & Delivery Info</label>
              <input
                value={form.shippingInformation}
                onChange={(e) => setForm({ ...form, shippingInformation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                placeholder="e.g. Free shipping on orders above ₹1,500"
              />
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h3 className={`${microgrammaBold.className} text-xs font-bold text-gray-400 uppercase tracking-wider`}>
                Product Images ({images.length})
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                <span>Upload New</span>
              </button>
            </div>

            {uploadError && <p className="text-xs text-rose-500">{uploadError}</p>}

            {/* Existing images list */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg border bg-gray-50 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    title="Remove Image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Or add by URL */}
            <div className="flex gap-2 pt-1">
              <input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none focus:border-[#074139]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg font-medium transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50/50 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateProduct.isPending}
            className={`${microgrammaBold.className} px-5 py-2 rounded-lg text-sm text-white font-medium flex items-center gap-2 shadow-xs disabled:opacity-50`}
            style={{ backgroundColor: '#074139' }}
          >
            {updateProduct.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {updateProduct.isPending ? 'Saving Changes...' : 'Save Product Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
