'use client'

import { useState, useRef } from 'react'
import {
  Plus,
  MoreVertical,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Download,
  Upload,
  Loader2,
  ImageIcon,
} from 'lucide-react'

import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
} from '@/hooks/useCategories'
import { useAuthStore } from '@/store/auth.store'

const TABS = ['All Product', 'Featured Products', 'On Sale', 'Out of Stock']

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createCategory = useCreateCategory()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = useAuthStore.getState().accessToken
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
      setImagePath(data.url)
    } catch {
      alert('Failed to upload category image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createCategory.mutateAsync({
        categoryName: name.trim(),
        name: name.trim(),
        slug: slugify(name),
        shortDescription: description.trim() || undefined,
        description: description.trim() || undefined,
        imagePath: imagePath.trim() || undefined,
        imageUrl: imagePath.trim() || undefined,
      })
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-800`}>
            Add Category
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Car Care & Detailing"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
              required
            />
            {name && (
              <p className="text-[11px] text-gray-400 mt-1 font-mono">Slug: {slugify(name)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of category items..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category Image</label>
            <div className="flex items-center gap-3">
              {imagePath ? (
                <div className="relative w-12 h-12 rounded-lg border overflow-hidden shrink-0">
                  <img src={imagePath} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePath('')}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                </button>
                <input
                  value={imagePath}
                  onChange={(e) => setImagePath(e.target.value)}
                  placeholder="Or enter direct image URL"
                  className="w-full px-2.5 py-1 text-xs border rounded-md outline-none focus:border-[#074139]"
                />
              </div>
            </div>
          </div>

          {createCategory.isError && (
            <p className="text-xs text-red-500">
              {(createCategory.error as Error)?.message || 'Failed to create category'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createCategory.isPending}
              className={`${microgrammaBold.className} px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50 flex items-center gap-1.5`}
              style={{ backgroundColor: '#074139' }}
            >
              {createCategory.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{createCategory.isPending ? 'Creating...' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditCategoryModal({
  category,
  onClose,
}: {
  category: Category
  onClose: () => void
}) {
  const [name, setName] = useState(category.categoryName || category.name || '')
  const [slug, setSlug] = useState(category.slug || '')
  const [description, setDescription] = useState(category.shortDescription || category.description || '')
  const [imagePath, setImagePath] = useState(category.imagePath || category.imageUrl || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateCategory = useUpdateCategory()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = useAuthStore.getState().accessToken
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
      setImagePath(data.url)
    } catch {
      alert('Failed to upload category image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        data: {
          categoryName: name.trim(),
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          shortDescription: description.trim() || undefined,
          description: description.trim() || undefined,
          imagePath: imagePath.trim() || undefined,
          imageUrl: imagePath.trim() || undefined,
        },
      })
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${microgrammaBold.className} text-[18px] font-semibold text-gray-800`}>
            Edit Category
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slug || slug === slugify(name)) {
                  setSlug(slugify(e.target.value))
                }
              }}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Slug *</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm font-mono outline-none focus:border-[#074139]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of category items..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category Image</label>
            <div className="flex items-center gap-3">
              {imagePath ? (
                <div className="relative w-12 h-12 rounded-lg border overflow-hidden shrink-0">
                  <img src={imagePath} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePath('')}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploading ? 'Uploading...' : 'Change Image'}</span>
                </button>
                <input
                  value={imagePath}
                  onChange={(e) => setImagePath(e.target.value)}
                  placeholder="Or enter direct image URL"
                  className="w-full px-2.5 py-1 text-xs border rounded-md outline-none focus:border-[#074139]"
                />
              </div>
            </div>
          </div>

          {updateCategory.isError && (
            <p className="text-xs text-red-500">
              {(updateCategory.error as Error)?.message || 'Failed to update category'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || updateCategory.isPending}
              className={`${microgrammaBold.className} px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50 flex items-center gap-1.5`}
              style={{ backgroundColor: '#074139' }}
            >
              {updateCategory.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{updateCategory.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('All Product')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')

  const { data: categories = [], isLoading, isError } = useCategories()
  const deleteCategory = useDeleteCategory()

  const filtered = categories.filter((c) =>
    (c.categoryName || c.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    deleteCategory.mutate(id, {
      onError: (err: any) => {
        alert(err?.message || 'Failed to delete category')
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Categories" onMenuClick={() => setDrawerOpen(true)} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`${microgrammaBold.className} font-semibold text-[22px] text-gray-800`}>Discover</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] text-white font-medium shadow-xs`}
              style={{ backgroundColor: '#074139' }}
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-md">
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
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories"
                  className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-52 focus:border-[#074139]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-600 bg-green-50">
                  <th className="px-3 py-2.5 font-medium rounded-l-lg">No.</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">Slug</th>
                  <th className="px-3 py-2.5 font-medium">Description</th>
                  <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="py-3">
                        <div className="h-10 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (
                  filtered.map((c, i) => {
                    const displayName = c.categoryName || c.name || 'Category'
                    const image = c.imagePath || c.imageUrl

                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover bg-gray-100 border shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs text-emerald-800 font-bold shrink-0">
                                {displayName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="text-gray-800 font-semibold">{displayName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                        <td className="px-3 py-3 text-gray-600">
                          {c.shortDescription || c.description || '—'}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingCategory(c)}
                              className="text-gray-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Edit category"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(c.id, displayName)}
                              disabled={deleteCategory.isPending}
                              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
                {filtered.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && <AddCategoryModal onClose={() => setModalOpen(false)} />}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  )
}
