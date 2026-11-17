'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
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
  CheckCircle2,
} from 'lucide-react'

import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  GridReadyEvent,
} from 'ag-grid-community'
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react'

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
import { dialog } from '@/lib/dialog'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

// Custom AG Grid theme matching OBPARK branding
const obparkGridTheme = themeQuartz.withParams({
  accentColor: '#074139',
  headerBackgroundColor: '#F0FDF4',
  headerTextColor: '#374151',
  headerFontWeight: 600,
  headerFontSize: 11.5,
  fontSize: 11.5,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  browserColorScheme: 'light',
  rowHoverColor: '#F9FAFB',
  selectedRowBackgroundColor: '#ECFDF5',
  rowHeight: 56,
  headerHeight: 38,
})

const TABS = ['All Product', 'Featured Products', 'On Sale', 'Out of Stock']

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Reusable Category Image Upload Slot for each of the 3 required images
 */
function CategoryImageUploadSlot({
  label,
  subtitle,
  imagePath,
  onChange,
  imageType,
  categorySlug,
}: {
  label: string
  subtitle: string
  imagePath: string
  onChange: (url: string) => void
  imageType: 'card' | 'banner' | 'slider'
  categorySlug: string
}) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'category')
      formData.append('folder', 'categories')
      formData.append('slug', categorySlug || 'general')
      formData.append('imageType', imageType)

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
      onChange(data.url)
    } catch {
      dialog.alert({
        title: 'Upload Failed',
        message: `Failed to upload ${label}. Please try again.`,
        variant: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-800">{label}</p>
          <p className="text-[11px] text-gray-500">{subtitle}</p>
        </div>
        {imagePath && (
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Set
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {imagePath ? (
          <div className="relative w-16 h-16 rounded-lg border border-gray-300 bg-white overflow-hidden shrink-0 group shadow-xs">
            <img src={imagePath} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}

        <div className="flex-1 space-y-1.5 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin text-emerald-700" /> : <Upload className="h-3 w-3 text-emerald-800" />}
              <span>{uploading ? 'Uploading...' : imagePath ? 'Replace Image' : 'Upload Image'}</span>
            </button>
            {imagePath && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <input
            value={imagePath}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter image URL (/uploads/...)"
            className="w-full px-2.5 py-1 text-xs border border-gray-200 bg-white rounded-md outline-none focus:border-[#074139]"
          />
        </div>
      </div>
    </div>
  )
}

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cardImage, setCardImage] = useState('')
  const [bannerImage, setBannerImage] = useState('')
  const [sliderImage, setSliderImage] = useState('')
  const createCategory = useCreateCategory()

  const currentSlug = slugify(name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createCategory.mutateAsync({
        categoryName: name.trim(),
        name: name.trim(),
        slug: currentSlug,
        shortDescription: description.trim() || undefined,
        description: description.trim() || undefined,
        cardImage: cardImage.trim() || undefined,
        bannerImage: bannerImage.trim() || undefined,
        sliderImage: sliderImage.trim() || undefined,
        imagePath: cardImage.trim() || undefined,
      })
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
          <div>
            <h3 className={`${microgrammaBold.className} text-[1.125rem] font-semibold text-gray-800`}>
              Add Category
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Configure category details and 3 visual assets</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category Name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Car Care Detailing"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139]"
              required
            />
            {name && (
              <p className="text-[0.6875rem] text-gray-500 mt-1 font-mono">Slug: {currentSlug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of category items..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] resize-none"
            />
          </div>

          {/* The 3 Category Images Sections */}
          <div className="space-y-3 pt-1">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Category Images (3 Types Required)
            </label>

            {/* 1. Shop Page Card Image */}
            <CategoryImageUploadSlot
              label="1. Shop Page Card Image"
              subtitle="Displayed on /shop category grid (Recommended 1:1 or 4:3)"
              imagePath={cardImage}
              onChange={setCardImage}
              imageType="card"
              categorySlug={currentSlug}
            />

            {/* 2. Category Page Top Hero Banner */}
            <CategoryImageUploadSlot
              label="2. Category Hero Banner"
              subtitle="Displayed at top banner of category page (Recommended wide 16:5)"
              imagePath={bannerImage}
              onChange={setBannerImage}
              imageType="banner"
              categorySlug={currentSlug}
            />

            {/* 3. Carousel Slider Image */}
            <CategoryImageUploadSlot
              label="3. Bottom Carousel Slider"
              subtitle="Displayed in 'Everything Your Car Needs' slider card"
              imagePath={sliderImage}
              onChange={setSliderImage}
              imageType="slider"
              categorySlug={currentSlug}
            />
          </div>

          {createCategory.isError && (
            <p className="text-xs text-red-500">
              {(createCategory.error as Error)?.message || 'Failed to create category'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
              className="px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50 flex items-center gap-1.5 transition-opacity"
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
  const [cardImage, setCardImage] = useState(category.cardImage || category.imagePath || category.imageUrl || '')
  const [bannerImage, setBannerImage] = useState(category.bannerImage || category.cardImage || category.imagePath || '')
  const [sliderImage, setSliderImage] = useState(category.sliderImage || category.cardImage || category.imagePath || '')
  const updateCategory = useUpdateCategory()

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
          cardImage: cardImage.trim() || undefined,
          bannerImage: bannerImage.trim() || undefined,
          sliderImage: sliderImage.trim() || undefined,
          imagePath: cardImage.trim() || undefined,
        },
      })
      onClose()
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
          <div>
            <h3 className={`${microgrammaBold.className} text-[1.125rem] font-semibold text-gray-800`}>
              Edit Category
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage details and the 3 category images</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category Name *</label>
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
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Slug *</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm font-mono outline-none focus:border-[#074139]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of category items..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#074139] resize-none"
            />
          </div>

          {/* 3 Category Images Upload Slots */}
          <div className="space-y-3 pt-1">
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Category Images (3 Types)
            </label>

            {/* 1. Shop Page Card */}
            <CategoryImageUploadSlot
              label="1. Shop Page Card Image"
              subtitle="Displayed on /shop category grid"
              imagePath={cardImage}
              onChange={setCardImage}
              imageType="card"
              categorySlug={slug || slugify(name)}
            />

            {/* 2. Hero Banner */}
            <CategoryImageUploadSlot
              label="2. Category Hero Banner"
              subtitle="Displayed at top banner of category page (Wide)"
              imagePath={bannerImage}
              onChange={setBannerImage}
              imageType="banner"
              categorySlug={slug || slugify(name)}
            />

            {/* 3. Carousel Slider */}
            <CategoryImageUploadSlot
              label="3. Bottom Carousel Slider"
              subtitle="Displayed in 'Everything Your Car Needs' slider card"
              imagePath={sliderImage}
              onChange={setSliderImage}
              imageType="slider"
              categorySlug={slug || slugify(name)}
            />
          </div>

          {updateCategory.isError && (
            <p className="text-xs text-red-500">
              {(updateCategory.error as Error)?.message || 'Failed to update category'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
              className="px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50 flex items-center gap-1.5 transition-opacity"
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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')

  const { data: categories = [], isLoading, isError } = useCategories()
  const deleteCategory = useDeleteCategory()

  const filtered = useMemo(() => {
    return categories.filter((c) =>
      (c.categoryName || c.name || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [categories, search])

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const confirmed = await dialog.confirm({
        title: 'Delete Category',
        message: `Are you sure you want to delete category "${name}"? Its images and folders will be cleanly removed. This action cannot be undone.`,
        confirmText: 'Delete Category',
        cancelText: 'Cancel',
        variant: 'danger',
      })
      if (!confirmed) return

      deleteCategory.mutate(id, {
        onError: (err: any) => {
          dialog.alert({
            title: 'Delete Failed',
            message: err?.message || 'Failed to delete category',
            variant: 'error',
          })
        },
      })
    },
    [deleteCategory]
  )

  // Cell Renderers with vertical Y-axis centering
  const CategoryNameCellRenderer = useCallback((props: CustomCellRendererProps<Category>) => {
    const c = props.data
    if (!c) return null
    const displayName = c.categoryName || c.name || 'Category'
    const image = c.cardImage || c.imagePath || c.imageUrl

    return (
      <div className="flex items-center gap-3 w-full h-full py-1">
        {image ? (
          <img
            src={image}
            alt=""
            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs text-emerald-800 font-bold shrink-0 shadow-2xs">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="text-gray-900 font-semibold text-sm truncate" title={displayName}>
          {displayName}
        </span>
      </div>
    )
  }, [])

  const ImagesCellRenderer = useCallback((props: CustomCellRendererProps<Category>) => {
    const c = props.data
    if (!c) return null
    return (
      <div className="flex items-center gap-2 h-full w-full py-1">
        <div
          title="Shop Card Image (Square)"
          className="w-8 h-8 rounded-lg border bg-gray-50 overflow-hidden relative shrink-0 shadow-2xs flex items-center justify-center"
          style={{ borderColor: c.cardImage ? '#10B981' : '#E5E7EB' }}
        >
          {c.cardImage ? (
            <img src={c.cardImage} alt="Card" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] text-gray-400 font-medium">Card</span>
          )}
        </div>
        <div
          title="Hero Banner Image (Wide)"
          className="w-14 h-8 rounded-lg border bg-gray-50 overflow-hidden relative shrink-0 shadow-2xs flex items-center justify-center"
          style={{ borderColor: c.bannerImage ? '#10B981' : '#E5E7EB' }}
        >
          {c.bannerImage ? (
            <img src={c.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] text-gray-400 font-medium">Banner</span>
          )}
        </div>
        <div
          title="Slider Image (Square)"
          className="w-8 h-8 rounded-lg border bg-gray-50 overflow-hidden relative shrink-0 shadow-2xs flex items-center justify-center"
          style={{ borderColor: c.sliderImage ? '#10B981' : '#E5E7EB' }}
        >
          {c.sliderImage ? (
            <img src={c.sliderImage} alt="Slider" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] text-gray-400 font-medium">Slide</span>
          )}
        </div>
      </div>
    )
  }, [])

  const SlugCellRenderer = useCallback((props: CustomCellRendererProps<Category>) => {
    const slug = props.value || '—'
    return (
      <div className="flex items-center w-full h-full">
        <span className="inline-flex items-center font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200/90 truncate">
          {slug}
        </span>
      </div>
    )
  }, [])

  const DescriptionCellRenderer = useCallback((props: CustomCellRendererProps<Category>) => {
    const desc = props.value || '—'
    return (
      <div className="flex items-center w-full h-full text-sm text-gray-700 truncate" title={desc}>
        {desc}
      </div>
    )
  }, [])

  const ActionCellRenderer = useCallback(
    (props: CustomCellRendererProps<Category>) => {
      const c = props.data
      if (!c) return null
      const displayName = c.categoryName || c.name || 'Category'

      return (
        <div className="flex items-center justify-center gap-1.5 w-full h-full">
          <button
            onClick={() => setEditingCategory(c)}
            className="text-gray-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Edit category"
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleDelete(c.id, displayName)}
            disabled={deleteCategory.isPending}
            className="text-gray-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Delete category"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    },
    [handleDelete, deleteCategory.isPending]
  )

  const colDefs = useMemo<ColDef<Category>[]>(() => {
    return [
      {
        headerName: 'No.',
        width: 70,
        valueGetter: (params) => (params.node?.rowIndex != null ? params.node.rowIndex + 1 : ''),
        cellClass: 'flex items-center justify-center text-gray-500 text-xs font-mono font-medium',
        headerClass: 'text-center',
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Category',
        field: 'categoryName',
        flex: 1.6,
        minWidth: 180,
        cellRenderer: CategoryNameCellRenderer,
        cellClass: 'flex items-center',
        valueGetter: (params) => params.data?.categoryName || params.data?.name || '',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Images (Card | Banner | Slider)',
        field: 'cardImage',
        width: 195,
        cellRenderer: ImagesCellRenderer,
        cellClass: 'flex items-center',
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Slug',
        field: 'slug',
        flex: 1.2,
        minWidth: 130,
        cellRenderer: SlugCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Description',
        field: 'description',
        flex: 2,
        minWidth: 180,
        valueGetter: (params) =>
          params.data?.shortDescription || params.data?.description || '—',
        cellRenderer: DescriptionCellRenderer,
        cellClass: 'flex items-center',
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Action',
        width: 95,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: ActionCellRenderer,
        cellClass: 'flex items-center justify-center',
        headerClass: 'text-center',
      },
    ]
  }, [CategoryNameCellRenderer, ImagesCellRenderer, SlugCellRenderer, DescriptionCellRenderer, ActionCellRenderer])

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      resizable: true,
      suppressMovable: true,
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F0FAF5]/40 min-h-screen">
      <Header title="Categories" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className={`${microgrammaBold.className} text-lg font-bold text-gray-900 tracking-wide`}>
                  Category Management
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organize categories with dedicated Shop Card, Banner, and Slider images.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all"
                style={{ backgroundColor: '#074139' }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Card with AG Grid */}
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#074139] focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-800">{filtered.length}</span> categories
            </div>
          </div>

          {/* AG Grid Table Container */}
          <div className="ag-grid-categories w-full rounded-xl overflow-hidden border border-gray-200/80 bg-white" style={{ height: '560px' }}>
            <style jsx global>{`
              .ag-grid-categories .ag-cell {
                display: flex !important;
                align-items: center !important;
              }
              .ag-grid-categories .ag-cell-wrapper {
                display: flex !important;
                align-items: center !important;
                height: 100% !important;
                width: 100% !important;
              }
              .ag-grid-categories .ag-cell-value {
                display: flex !important;
                align-items: center !important;
                height: 100% !important;
                width: 100% !important;
              }
              .ag-grid-categories .ag-react-container {
                display: flex !important;
                align-items: center !important;
                height: 100% !important;
                width: 100% !important;
              }
              .ag-grid-categories .ag-header-cell-label {
                display: flex !important;
                align-items: center !important;
                height: 100% !important;
              }
            `}</style>
            <AgGridReact<Category>
              theme={obparkGridTheme}
              rowData={filtered}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              quickFilterText={search}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              rowHeight={60}
              headerHeight={42}
              loading={isLoading}
              animateRows={true}
              enableCellTextSelection={true}
              overlayNoRowsTemplate="<div class='p-8 text-center text-gray-400 text-sm'>No categories found</div>"
              overlayLoadingTemplate="<div class='p-8 text-center text-emerald-800 text-sm font-medium'>Loading categories...</div>"
            />
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
