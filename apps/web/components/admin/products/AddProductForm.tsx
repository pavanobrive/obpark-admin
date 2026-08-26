'use client'

import { useRef, useState } from 'react'
import { Search, Save, Upload, Plus, Wand2, Pencil, RefreshCw, ChevronDown, X, Loader2 } from 'lucide-react'
import { useCreateProduct } from '@/hooks/useCreateProduct'
import { useCategories } from '@/hooks/useCategories'
import { api } from '@/lib/api'
import { microgrammaBold } from '@/lib/fonts'

const COLORS = ['#C7E8D4', '#F4C4C4', '#C4CCD4', '#EDE1B0', '#3A3A3A']

export function AddProductForm() {
  const [form, setForm] = useState({ name: '', description: '', price: '', discountedPrice: '', stock: '', categoryId: '' })
  const [unlimited, setUnlimited] = useState(true)
  const [selectedColor, setSelectedColor] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createProduct = useCreateProduct()
  const { data: categories = [] } = useCategories()

  const salePrice = form.price && form.discountedPrice
    ? (parseFloat(form.price) - parseFloat(form.discountedPrice)).toFixed(2)
    : null

  const canPublish = form.name.trim() !== '' && form.price !== '' && form.categoryId !== ''

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadError('')
    setUploading(true)

    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/media/upload`, {
          method: 'POST',
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
    createProduct.mutate({
      name: form.name,
      slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: form.description,
      basePrice: parseFloat(form.price) || 0,
      sku: `SKU-${Date.now()}`,
      stock: unlimited ? 0 : parseInt(form.stock) || 0,
      categoryId: form.categoryId,
      images,
    })
  }

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className={`${microgrammaBold.className} text-[22px] font-bold text-gray-800`}>
  Add New Product
</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className=" relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input placeholder="Search product for add" className="pl-8 pr-2 py-2 rounded-lg bg-white border text-xs outline-none w-48" />
          </div>
          <button
            onClick={handlePublish}
            disabled={createProduct.isPending || !canPublish}
            className={`${microgrammaBold.className} px-4 py-2 rounded-lg text-[16px] text-white font-medium disabled:opacity-50`}
            style={{ backgroundColor: '#074139' }}
          >
            {createProduct.isPending ? 'Publishing...' : 'Publish Product'}
          </button>
          <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] border font-medium text-gray-600`}>
            <Save className="h-4 w-4" /> Save to draft
          </button>
          <button
  aria-label="Add"
  className="w-12 h-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center shadow-sm"
>
  <div className="w-8 h-8 rounded-full border-[3px] border-gray-500 flex items-center justify-center">
    <Plus className="w-5 h-5 text-gray-500" strokeWidth={3} />
  </div>
</button>
        </div>
      </div>

      {createProduct.isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
          Product created successfully.
        </div>
      )}
      {createProduct.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          Something went wrong — check required fields and try again.
        </div>
      )}
      {!canPublish && (form.name || form.price) && (
        <p className="text-xs text-amber-600">Name, price, and category are required before publishing.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>Basic Details</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Engine Oil Filter"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Description</label>
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the product..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none pr-16"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <button aria-label="Edit description" className="text-gray-400 hover:text-gray-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button aria-label="AI assist" className="text-gray-400 hover:text-gray-600">
                    <Wand2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>Pricing</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Price (₹)</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="349"
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <div className="flex items-center gap-1 px-3 border-l text-sm text-gray-500 shrink-0">
                  ₹ INR <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Discounted Price (Optional)</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <span className="px-3 text-sm text-gray-400 border-r">₹</span>
                  <input
                    type="number"
                    value={form.discountedPrice}
                    onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                    placeholder="99"
                    className="flex-1 px-3 py-2 text-sm outline-none min-w-0"
                  />
                </div>
                {salePrice && (
                  <p className="text-[10px] text-green-600 mt-1">Sale= ₹{salePrice}</p>
                )}
                <p className="text-[10px] text-amber-600 mt-1">Not yet saved to backend — needs DTO update</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tax Included</label>
                <div className="flex items-center gap-4 pt-2 text-sm">
                  <label className="flex items-center gap-1.5"><input type="radio" name="tax" defaultChecked /> Yes</label>
                  <label className="flex items-center gap-1.5"><input type="radio" name="tax" /> No</label>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expiration</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" placeholder="Start" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
                <input type="date" placeholder="End" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" />
              </div>
              <p className="text-[10px] text-amber-600 mt-1">Expiration dates not yet in backend schema</p>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>Inventory</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="100"
                  disabled={unlimited}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock Status</label>
                <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none">
                  <option>In Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3">
  <button
    type="button"
    onClick={() => setUnlimited(!unlimited)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
      unlimited ? 'bg-[#074139]' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
        unlimited ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>

  <span className="text-sm font-medium text-gray-700">
    Unlimited
  </span>
</label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" /> Highlight this product in a featured section
            </label>
            <div className="flex gap-3 pt-2">
              <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] border font-medium text-gray-600`}>
                <Save className="h-4 w-4" /> Save to draft
              </button>
              <button
                onClick={handlePublish}
                disabled={createProduct.isPending || !canPublish}
                className={`${microgrammaBold.className} px-4 py-2 rounded-lg text-[16px] text-white font-medium disabled:opacity-50`}
                style={{ backgroundColor: '#074139' }}
              >
                {createProduct.isPending ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Upload Product Image */}
          <div className="bg-white border rounded-xl p-6 space-y-3 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>Upload Product Image</h3>
            <p className="text-xs text-gray-400">Product Image</p>

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
                className="border rounded-xl h-56 bg-gray-50 overflow-hidden relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={images[0]} alt="Product" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="border rounded-xl h-56 flex items-center justify-center text-gray-300 text-sm bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
            )}

            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-gray-600 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" /> {uploading ? 'Uploading...' : 'Browse'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-gray-600 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {images.map((url) => (
                <div key={url} className="relative group h-16 rounded-lg bg-gray-100 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-green-600 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span className="text-[10px]">Add Image</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border rounded-xl p-6 space-y-4 shadow-md">
            <h3 className={`${microgrammaBold.className} text-[16px] font-semibold text-gray-800`}>Categories</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Categories</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              >
                <option value="">Select your category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-[10px] text-amber-600 mt-1">No categories yet — create one on the Categories page first</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Product Tag</label>
              <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none">
                <option>Select your product</option>
              </select>
              <p className="text-[10px] text-amber-600 mt-1">Product tags not yet in backend schema</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Select your color</label>
              <div className="flex items-center gap-2">
                {COLORS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    aria-label={`Select color ${i + 1}`}
                    className={`w-7 h-7 rounded-full border-2 ${selectedColor === i ? 'border-gray-700' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-amber-600 mt-1">Color variants not yet in backend schema</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}