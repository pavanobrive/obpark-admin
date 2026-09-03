'use client'

import { useState } from 'react'
import { Plus, MoreVertical, Search, Filter, MoreHorizontal, Pencil, Trash2, X,Download } from 'lucide-react'

import { microgrammaBold } from '@/lib/fonts'
import { Header } from '@/components/admin/layout/Header'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories'

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
  const createCategory = useCreateCategory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createCategory.mutateAsync({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || undefined,
      })
      onClose()
    } catch (err){
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Car Essentials"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
            />
            {name && (
              <p className="text-[11px] text-gray-400 mt-1">Slug: {slugify(name)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] resize-none"
            />
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createCategory.isPending}
              className={`${microgrammaBold.className} px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50`}
              style={{ backgroundColor: '#074139' }}
            >
              {createCategory.isPending ? 'Creating...' : 'Create'}
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
  const [search, setSearch] = useState('')

  const { data: categories = [], isLoading, isError } = useCategories()
  const deleteCategory = useDeleteCategory()

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
              className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] text-white font-medium`}
              style={{ backgroundColor: '#074139' }}
            >
              <Plus className="h-4 w-4" /> Add Category
            </button>
            <button className={`${microgrammaBold.className} flex items-center gap-1.5 px-4 py-2 rounded-lg text-[16px] border font-medium text-gray-600`}>
              More Action <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category tiles - real data */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-gray-400">Loading categories...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">Failed to load categories</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories yet — click "Add Category" to create one.</p>
          ) : (
            <div className="flex gap-4 min-w-[700px]">
              {categories.map((cat) => (
                <div key={cat.id} className="relative group bg-white border rounded-xl p-4 flex flex-col items-center gap-2 w-32 shrink-0 shadow-md hover:shadow-sm">
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="absolute top-1.5 right-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center text-2xl">
                    🏷️
                  </div>
                  <p className={`${microgrammaBold.className} text-[14px] font-medium text-gray-700 text-center`}>
                    {cat.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter tabs + table */}
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
                  {tab === 'All Product' ? `All Product (${categories.length})` : tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories"
                  className="pl-8 pr-2 py-1.5 rounded-lg bg-gray-50 border text-xs outline-none w-44"
                />
              </div>
              <button className="p-2 rounded-lg border text-gray-500"><Filter className="h-4 w-4" /></button>
              <button onClick={() => setModalOpen(true)} className="p-2 rounded-lg border text-gray-500"><Plus className="h-4 w-4" /></button>
              <button className="p-2 rounded-lg border text-gray-500"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-green-50">
                  <th className="px-3 py-2.5 font-medium rounded-l-lg">No.</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">Slug</th>
                  <th className="px-3 py-2.5 font-medium">Description</th>
                  <th className="px-3 py-2.5 font-medium rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                        <span className="text-gray-700 font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500">{c.slug}</td>
                    <td className="px-3 py-3 text-gray-500">{c.description || '—'}</td>
                    <td className="px-3 py-3">
  <div className="flex items-center gap-2">
    <button
      className="text-gray-400 hover:text-gray-600"
      title="Edit category"
    >
      <Pencil className="h-4 w-4" />
    </button>

    <button
      onClick={() => handleDelete(c.id, c.name)}
      className="text-gray-400 hover:text-red-500"
      title="Delete category"
    >
      <Trash2 className="h-4 w-4" />
    </button>

    <button
      onClick={() => alert('Download feature is currently unavailable')}
      className="text-gray-400 hover:text-[#074139]"
      title="Download products"
    >
      <Download className="h-4 w-4" />
    </button>
  </div>
</td>
                  </tr>
                ))}
                {filtered.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
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
    </div>
  )
}