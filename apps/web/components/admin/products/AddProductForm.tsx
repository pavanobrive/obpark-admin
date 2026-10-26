'use client'

import { useRef, useState, useMemo } from 'react'
import { Search, Save, Upload, Plus, Wand2, Pencil, RefreshCw, ChevronDown, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useCreateProduct } from '@/hooks/useCreateProduct'
import { useCategories } from '@/hooks/useCategories'
import { useTaxes } from '@/hooks/useAdminProducts'
import { useAuthStore } from '@/store/auth.store'
import { microgrammaBold } from '@/lib/fonts'

export function AddProductForm() {
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    productHeading: '',
    brand: 'OBPARK',
    productDescription: '',
    longDescription: '',
    productFeatures: '',
    productCost: '',
    hsnCode: '',
    platformCharges: '0',
    discountCoupon: '',
    discountText: '',
    shippingInformation: 'Standard shipping (3-5 business days)',
    categoryId: '',
  })

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createProduct = useCreateProduct()
  const { data: categories = [] } = useCategories()
  const { data: taxes = [] } = useTaxes()

  // Find selected tax rule
  const selectedTax = useMemo(() => {
    if (!form.hsnCode) return null
    return taxes.find((t) => t.code === form.hsnCode) || null
  }, [form.hsnCode, taxes])

  const gstRate = selectedTax ? Number(selectedTax.gstRate) : 18

  // Real-time calculation: Base Cost + GST = Final Selling Price
  const calculations = useMemo(() => {
    const cost = parseFloat(form.productCost) || 0
    const gstAmount = Number(((cost * gstRate) / 100).toFixed(2))
    const finalPrice = Number((cost + gstAmount).toFixed(2))
    return { cost, gstAmount, finalPrice }
  }, [form.productCost, gstRate])

  const canPublish = form.productName.trim() !== '' && form.productCost !== '' && form.categoryId !== ''

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3055'}/admin/media/upload`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        uploaded.push(data.url)
      }
      setImages((prev) => [...prev, ...uploaded])
    } catch {
      setUploadError('Failed to upload one or more images. Try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url))
  }

  const handlePublish = () => {
    if (!canPublish) return

    const generatedId = form.productId.trim() || `OB-${Date.now().toString().slice(-6)}`

    createProduct.mutate(
      {
        productId: generatedId,
        productName: form.productName.trim(),
        productHeading: form.productHeading.trim() || undefined,
        brand: form.brand.trim() || 'OBPARK',
        productDescription: form.productDescription.trim() || undefined,
        longDescription: form.longDescription.trim() || undefined,
        productFeatures: form.productFeatures
          ? form.productFeatures.split(';').map((s) => s.trim()).filter(Boolean)
          : [],
        productCost: calculations.cost,
        price: calculations.finalPrice,
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
        shippingInformation: form.shippingInformation.trim() || undefined,
      },
      {
        onSuccess: () => {
          setForm({
            productId: '',
            productName: '',
            productHeading: '',
            brand: 'OBPARK',
            productDescription: '',
            longDescription: '',
            productFeatures: '',
            productCost: '',
            hsnCode: '',
            platformCharges: '0',
            discountCoupon: '',
            discountText: '',
            shippingInformation: 'Standard shipping (3-5 business days)',
            categoryId: '',
          })
          setImages([])
        },
      }
    )
  }

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`${microgrammaBold.className} text-[22px] font-bold text-gray-800`}>
            Add New Product
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Create product with dynamic GST computation, HSN verification, and catalog attributes.
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={handlePublish}
            disabled={createProduct.isPending || !canPublish}
            className={`${microgrammaBold.className} px-5 py-2.5 rounded-lg text-[15px] text-white font-medium disabled:opacity-50 flex items-center gap-2`}
            style={{ backgroundColor: '#074139' }}
          >
            {createProduct.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createProduct.isPending ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </div>

      {createProduct.isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <span>Product created successfully with verified tax and calculated selling price!</span>
        </div>
      )}

      {createProduct.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          {(createProduct.error as Error)?.message || 'Something went wrong — check required fields and try again.'}
        </div>
      )}

      {!canPublish && (form.productName || form.productCost) && (
        <p className="text-xs text-amber-600">Product Name, Base Cost, and Category are required before publishing.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>
              Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                <input
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder="e.g. Ceramic Coating Kit"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Custom Product ID / SKU</label>
                <input
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  placeholder="e.g. OB-CAR-001 (Auto-generated if empty)"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono text-xs focus:border-[#074139]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Product Heading</label>
                <input
                  value={form.productHeading}
                  onChange={(e) => setForm({ ...form, productHeading: e.target.value })}
                  placeholder="e.g. 9H Hardness Protection"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Brand</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="OBPARK"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Short Description</label>
              <textarea
                value={form.productDescription}
                onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                rows={2}
                placeholder="Brief summary for listings..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#074139]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Long Description</label>
              <textarea
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                rows={4}
                placeholder="Comprehensive technical specifications and usage details..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#074139]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Features (Separated by semicolon ;)</label>
              <textarea
                value={form.productFeatures}
                onChange={(e) => setForm({ ...form, productFeatures: e.target.value })}
                rows={2}
                placeholder="Hydrophobic shine; UV resistance; Long lasting; Scratch resistant"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none focus:border-[#074139]"
              />
              <p className="text-[11px] text-gray-400 mt-1">Split features using semicolons (;) for bullet points.</p>
            </div>
          </div>

          {/* Pricing, HSN & Dynamic Tax */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>
              Pricing & HSN Tax
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Base Cost (Without GST) *</label>
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:border-[#074139]">
                  <span className="px-3 text-sm text-gray-400 bg-gray-50 border-r">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.productCost}
                    onChange={(e) => setForm({ ...form, productCost: e.target.value })}
                    placeholder="1000.00"
                    className="flex-1 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">HSN Code (Tax Master)</label>
                <select
                  value={form.hsnCode}
                  onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                >
                  <option value="">Default GST (18%)</option>
                  {taxes.map((t) => (
                    <option key={t.code} value={t.code}>
                      [{t.type}] HSN {t.code} — {t.description} ({Number(t.gstRate)}% GST)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Calculation Preview Box */}
            <div className="rounded-xl border bg-emerald-50/50 p-4 border-emerald-200">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Base Cost:</span>
                <span className="font-semibold">₹{calculations.cost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Applicable GST Rate ({gstRate}%):</span>
                <span className="font-semibold text-emerald-700">+ ₹{calculations.gstAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">Final Selling Price (Tax-Inclusive):</span>
                <span className="text-base font-bold text-emerald-800">₹{calculations.finalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Platform Charges (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.platformCharges}
                  onChange={(e) => setForm({ ...form, platformCharges: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Discount Coupon Code</label>
                <input
                  value={form.discountCoupon}
                  onChange={(e) => setForm({ ...form, discountCoupon: e.target.value })}
                  placeholder="e.g. FESTIVE10"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono text-xs focus:border-[#074139]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Discount Promotional Badge Text</label>
              <input
                value={form.discountText}
                onChange={(e) => setForm({ ...form, discountText: e.target.value })}
                placeholder="e.g. Save 15% this Diwali"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Upload Product Images */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>
              Product Images
            </h3>
            <p className="text-xs text-gray-400">First image will be treated as the main thumbnail.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {images.length > 0 ? (
              <div
                className="border rounded-xl h-56 bg-gray-50 overflow-hidden relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={images[0]} alt="Primary" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-[11px] rounded-md font-medium">
                  Primary Thumbnail
                </div>
              </div>
            ) : (
              <div
                className="border rounded-xl h-56 flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-xs">Click to browse & upload images</span>
                  </>
                )}
              </div>
            )}

            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

            <div className="grid grid-cols-3 gap-2">
              {images.map((url, idx) => (
                <div key={url} className="relative group h-16 rounded-lg bg-gray-100 overflow-hidden border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 left-1 text-[9px] bg-black/60 text-white px-1 rounded">
                    #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-emerald-700 hover:bg-emerald-50/50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span className="text-[10px]">Add Image</span>
              </button>
            </div>
          </div>

          {/* Category & Logistics */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>
              Category & Logistics
            </h3>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName || c.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1">
                  No categories found. Add a category from the Categories page first.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Shipping & Delivery Information</label>
              <input
                value={form.shippingInformation}
                onChange={(e) => setForm({ ...form, shippingInformation: e.target.value })}
                placeholder="e.g. Free shipping on orders above ₹1,500"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
