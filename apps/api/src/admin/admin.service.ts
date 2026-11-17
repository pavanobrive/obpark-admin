import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { OrderStatus } from '@prisma/client'

const PAID_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]

export interface CreateProductDto {
  productId?: string
  productName?: string
  name?: string
  productHeading?: string
  title?: string
  brand?: string
  productDescription?: string
  description?: string
  longDescription?: string
  productFeatures?: string[] | string
  productCost?: number
  basePrice?: number
  price?: number
  platformCharges?: number
  discountCoupon?: string
  currencySymbol?: string
  taxCode?: string
  hsnCode?: string
  gstRate?: number
  gst?: number
  imagePath?: string
  images?: string[]
  galleryImages?: string[]
  discountText?: string
  productRating?: number
  totalReviewsCount?: number
  boughtPastMonthText?: string
  soldLastWeekText?: string
  categoryId: string
  attributes?: any
  aboutSections?: any
  shippingInformation?: string
  shippingBadges?: string[]
  reviewsBreakdown?: any
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

@Injectable()
export class AdminService {
  private cachedCuratedTaxes: any[] | null = null

  constructor(private prisma: PrismaService, private storageService: StorageService) {}

  async getDashboardStats() {
    const since = new Date()
    since.setDate(since.getDate() - 7)

    const [
      revenueAgg,
      totalOrders,
      pendingOrders,
      canceledOrders,
      totalUsers,
      totalProducts,
      recentOrdersRaw,
      productsWithOrders,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { createdAt: { gte: since }, status: { in: PAID_STATUSES } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: since } } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.users.count(),
      this.prisma.product.count(),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, totalAmount: true, status: true, createdAt: true, orderNumber: true },
      }),
      this.prisma.product.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          productId: true,
          productName: true,
          productCost: true,
          price: true,
        },
      }),
    ])

    const bestSelling = productsWithOrders.map((p) => ({
      id: p.id,
      name: p.productName,
      orders: 0,
      inStock: true,
      price: Number(p.price),
    }))

    return {
      totalRevenue: Number(revenueAgg._sum?.totalAmount ?? 0),
      totalOrders,
      pendingOrders,
      canceledOrders,
      totalUsers,
      totalProducts,
      stockProducts: totalProducts,
      outOfStockProducts: 0,
      recentOrders: recentOrdersRaw.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      })),
      salesByState: [],
      bestSelling,
    }
  }

  async getTaxes(search?: string, code?: string) {
    // 1. If searching, query dynamically with limit 50 for instantaneous response
    if (search && search.trim()) {
      const q = search.trim()
      const taxes = await this.prisma.taxMaster.findMany({
        where: {
          OR: [
            { code: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 50,
        orderBy: { code: 'asc' },
      })
      return taxes.map((t) => ({
        code: t.code,
        description: t.description,
        type: t.type,
        gstRate: Number(t.gstRate),
      }))
    }

    // 2. Return cached curated taxes if available and no special code requested
    if (!code && this.cachedCuratedTaxes && this.cachedCuratedTaxes.length > 0) {
      return this.cachedCuratedTaxes
    }

    // 3. Curated priority codes for automotive, mobility, accessories, EV, and services
    const priorityCodes = [
      '8708', '8714', '8703', '8504', '8715',
      '3402', '3405', '3926', '8512', '8507',
      '4011', '4012', '4013', '2710', '8421',
      '8511', '8527', '7318', '9968', '9983',
      '9987', '9972',
    ]

    const codesToFetch = code && !priorityCodes.includes(code)
      ? [code, ...priorityCodes]
      : priorityCodes

    const taxes = await this.prisma.taxMaster.findMany({
      where: {
        OR: [
          { code: { in: codesToFetch } },
          { code: { startsWith: '87' } }, // other motor vehicle codes
        ],
      },
      take: 60,
      orderBy: { code: 'asc' },
    })

    const mapped = taxes.map((t) => ({
      code: t.code,
      description: t.description,
      type: t.type,
      gstRate: Number(t.gstRate),
    }))

    if (!code) {
      this.cachedCuratedTaxes = mapped
    }

    return mapped
  }

  async listProducts(search?: string, limit = 20, page = 1) {
    const where = search
      ? {
          OR: [
            { productName: { contains: search, mode: 'insensitive' as const } },
            { productId: { contains: search, mode: 'insensitive' as const } },
            { productHeading: { contains: search, mode: 'insensitive' as const } },
            { brand: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, categoryName: true, slug: true } },
          tax: true,
        },
      }),
      this.prisma.product.count({ where }),
    ])

    const mapped = products.map((p) => ({
      ...p,
      name: p.productName,
      sku: p.productId,
      basePrice: Number(p.productCost),
      price: Number(p.price),
      gstRate: p.gstRate !== null && p.gstRate !== undefined
        ? Number(p.gstRate)
        : (p.tax?.gstRate ? Number(p.tax.gstRate) : 18),
      gst: p.gst !== null && p.gst !== undefined ? Number(p.gst) : undefined,
      description: p.productDescription || p.longDescription || '',
      category: {
        id: p.category.id,
        name: p.category.categoryName,
        categoryName: p.category.categoryName,
        slug: p.category.slug,
      },
    }))

    return { products: mapped, total }
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { productId: id }],
      },
      include: {
        category: true,
        tax: true,
      },
    })

    if (!product) throw new NotFoundException('Product not found')

    return {
      ...product,
      name: product.productName,
      sku: product.productId,
      basePrice: Number(product.productCost),
      price: Number(product.price),
      gstRate: product.gstRate !== null && product.gstRate !== undefined
        ? Number(product.gstRate)
        : (product.tax?.gstRate ? Number(product.tax.gstRate) : 18),
      gst: product.gst !== null && product.gst !== undefined ? Number(product.gst) : undefined,
      category: {
        id: product.category.id,
        name: product.category.categoryName,
        categoryName: product.category.categoryName,
        slug: product.category.slug,
      },
    }
  }

  async createProduct(dto: CreateProductDto) {
    const productName = dto.productName || dto.name || dto.title
    if (!productName) {
      throw new BadRequestException('productName is required')
    }

    if (!dto.categoryId) {
      throw new BadRequestException('categoryId is required')
    }

    // Verify category exists
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    })
    if (!categoryExists) {
      throw new BadRequestException(`Category with id ${dto.categoryId} not found`)
    }

    // Tax calculation
    const rawHsn = dto.hsnCode || dto.taxCode || null
    let validTaxCode: string | null = null
    let taxMasterGstRate: number | null = null

    if (rawHsn) {
      const taxRecord = await this.prisma.taxMaster.findUnique({
        where: { code: rawHsn },
      })
      if (taxRecord) {
        validTaxCode = taxRecord.code
        taxMasterGstRate = Number(taxRecord.gstRate)
      }
    }

    // Explicit dto.gstRate has highest priority; next is TaxMaster; fallback is 18
    const gstRate = dto.gstRate !== undefined && dto.gstRate !== null
      ? Number(dto.gstRate)
      : (taxMasterGstRate !== null ? taxMasterGstRate : 18)

    const baseCost = Number(dto.productCost ?? dto.basePrice ?? 0)
    const gstAmount = dto.gst !== undefined && dto.gst !== null
      ? Number(dto.gst)
      : Number(((baseCost * gstRate) / 100).toFixed(2))

    const finalPrice = dto.price ? Number(dto.price) : Number((baseCost + gstAmount).toFixed(2))

    // Parse features array
    let features: string[] = []
    if (Array.isArray(dto.productFeatures)) {
      features = dto.productFeatures
    } else if (typeof dto.productFeatures === 'string') {
      features = (dto.productFeatures as string).split(';').map((s) => s.trim()).filter(Boolean)
    }

    // Images
    const imageList = dto.images && dto.images.length > 0
      ? dto.images
      : (dto.galleryImages && dto.galleryImages.length > 0 ? dto.galleryImages : [])
    const primaryImage = dto.imagePath || (imageList.length > 0 ? imageList[0] : null)

    const productId = dto.productId || `OB-${Date.now().toString().slice(-6)}`

    const created = await this.prisma.product.create({
      data: {
        productId,
        productName,
        title: dto.title || productName,
        productHeading: dto.productHeading || null,
        brand: dto.brand || 'OBPARK',
        productDescription: dto.productDescription || dto.description || null,
        longDescription: dto.longDescription || null,
        productFeatures: features,
        productCost: baseCost,
        price: finalPrice,
        platformCharges: dto.platformCharges ? Number(dto.platformCharges) : 0,
        discountCoupon: dto.discountCoupon || null,
        currencySymbol: dto.currencySymbol || '₹',
        taxCode: validTaxCode,
        hsnCode: rawHsn,
        gst: gstAmount,
        gstRate,
        imagePath: primaryImage,
        images: imageList,
        galleryImages: imageList,
        discountText: dto.discountText || null,
        productRating: dto.productRating ? Number(dto.productRating) : 0,
        totalReviewsCount: dto.totalReviewsCount ?? 0,
        boughtPastMonthText: dto.boughtPastMonthText || null,
        soldLastWeekText: dto.soldLastWeekText || null,
        categoryId: dto.categoryId,
        shippingInformation: dto.shippingInformation || null,
        shippingBadges: dto.shippingBadges || [],
        attributes: dto.attributes || null,
        aboutSections: dto.aboutSections || null,
        reviewsBreakdown: dto.reviewsBreakdown || null,
      },
      include: {
        category: { select: { id: true, categoryName: true, slug: true } },
        tax: true,
      },
    })

    return {
      ...created,
      name: created.productName,
      sku: created.productId,
      basePrice: Number(created.productCost),
      price: Number(created.price),
      category: {
        id: created.category.id,
        name: created.category.categoryName,
        categoryName: created.category.categoryName,
      },
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { productId: id }] },
    })
    if (!existing) throw new NotFoundException('Product not found')

    const data: any = {}

    if (dto.productId !== undefined && dto.productId.trim() !== '') {
      data.productId = dto.productId.trim()
    }
    if (dto.productName || dto.name) {
      data.productName = dto.productName || dto.name
      data.title = dto.title || data.productName
    }
    if (dto.productHeading !== undefined) data.productHeading = dto.productHeading
    if (dto.brand !== undefined) data.brand = dto.brand
    if (dto.productDescription !== undefined || dto.description !== undefined) {
      data.productDescription = dto.productDescription ?? dto.description
    }
    if (dto.longDescription !== undefined) data.longDescription = dto.longDescription

    if (dto.productFeatures !== undefined) {
      if (Array.isArray(dto.productFeatures)) {
        data.productFeatures = dto.productFeatures
      } else if (typeof dto.productFeatures === 'string') {
        data.productFeatures = (dto.productFeatures as string).split(';').map((s) => s.trim()).filter(Boolean)
      }
    }

    if (dto.categoryId) {
      data.categoryId = dto.categoryId
    }

    // Pricing & Tax updates
    const rawHsn = dto.hsnCode !== undefined ? dto.hsnCode : (dto.taxCode !== undefined ? dto.taxCode : existing.hsnCode)
    data.hsnCode = rawHsn

    let validTaxCode: string | null = null
    let taxMasterGstRate: number | null = null
    if (rawHsn) {
      const taxRecord = await this.prisma.taxMaster.findUnique({ where: { code: rawHsn } })
      if (taxRecord) {
        validTaxCode = taxRecord.code
        taxMasterGstRate = Number(taxRecord.gstRate)
      }
    }
    data.taxCode = validTaxCode

    let gstRate = Number(existing.gstRate ?? 18)
    if (dto.gstRate !== undefined && dto.gstRate !== null) {
      gstRate = Number(dto.gstRate)
    } else if (taxMasterGstRate !== null && rawHsn !== existing.hsnCode) {
      gstRate = taxMasterGstRate
    }
    data.gstRate = gstRate

    const baseCost = dto.productCost !== undefined || dto.basePrice !== undefined
      ? Number(dto.productCost ?? dto.basePrice)
      : Number(existing.productCost)

    if (dto.productCost !== undefined || dto.basePrice !== undefined) {
      data.productCost = baseCost
    }

    const gstAmount = dto.gst !== undefined && dto.gst !== null
      ? Number(dto.gst)
      : Number(((baseCost * gstRate) / 100).toFixed(2))
    data.gst = gstAmount

    if (dto.price !== undefined && dto.price !== null) {
      data.price = Number(dto.price)
    } else if (dto.productCost !== undefined || dto.gstRate !== undefined) {
      data.price = Number((baseCost + gstAmount).toFixed(2))
    }

    if (dto.platformCharges !== undefined) data.platformCharges = Number(dto.platformCharges)
    if (dto.discountCoupon !== undefined) data.discountCoupon = dto.discountCoupon
    if (dto.currencySymbol !== undefined) data.currencySymbol = dto.currencySymbol

    if (dto.images !== undefined || dto.galleryImages !== undefined) {
      const imgList = dto.images ?? dto.galleryImages ?? []
      data.images = imgList
      data.galleryImages = imgList
      if (dto.imagePath === undefined && imgList.length > 0) {
        data.imagePath = imgList[0]
      }
    }

    if (dto.imagePath !== undefined) data.imagePath = dto.imagePath
    if (dto.discountText !== undefined) data.discountText = dto.discountText
    if (dto.shippingInformation !== undefined) data.shippingInformation = dto.shippingInformation
    if (dto.attributes !== undefined) data.attributes = dto.attributes

    if (dto.images && Array.isArray(dto.images) && existing.images) {
      this.storageService.diffAndDeleteImages(existing.images, dto.images)
    }

    const updated = await this.prisma.product.update({
      where: { id: existing.id },
      data,
      include: {
        category: { select: { id: true, categoryName: true, slug: true } },
        tax: true,
      },
    })

    return {
      ...updated,
      name: updated.productName,
      sku: updated.productId,
      basePrice: Number(updated.productCost),
      price: Number(updated.price),
      category: {
        id: updated.category.id,
        name: updated.category.categoryName,
        categoryName: updated.category.categoryName,
      },
    }
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ id }, { productId: id }] },
    })
    if (!existing) throw new NotFoundException('Product not found')

    // Clean up product images and directory from storage
    if (existing.productId) {
      this.storageService.deleteProductFolder(existing.productId)
    }
    if (existing.id && existing.id !== existing.productId) {
      this.storageService.deleteProductFolder(existing.id)
    }
    if (existing.images && existing.images.length > 0) {
      for (const img of existing.images) {
        this.storageService.deleteFile(img)
      }
    }

    await this.prisma.product.delete({
      where: { id: existing.id },
    })
    return { success: true }
  }

  async archiveProduct(id: string) {
    return this.deleteProduct(id)
  }
}
