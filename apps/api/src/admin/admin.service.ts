import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
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
  constructor(private prisma: PrismaService) {}

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

  async getTaxes() {
    let taxes = await this.prisma.taxMaster.findMany({
      orderBy: { code: 'asc' },
    })

    if (!taxes || taxes.length === 0) {
      const defaultTaxes = [
        { code: '8703', description: 'Electric Vehicles & Specialized Parts', type: 'HSN', gstRate: 5.0 },
        { code: '8504', description: 'EV Chargers & Power Adapters', type: 'HSN', gstRate: 5.0 },
        { code: '8715', description: 'Child Safety Car Seats & Carriers', type: 'HSN', gstRate: 12.0 },
        { code: '8708', description: 'Motor Vehicle Parts & Accessories', type: 'HSN', gstRate: 18.0 },
        { code: '8714', description: 'Motorcycle & Bicycle Parts', type: 'HSN', gstRate: 18.0 },
        { code: '3402', description: 'Car Wash Shampoo & Cleaning Prep', type: 'HSN', gstRate: 18.0 },
        { code: '3405', description: 'Polishes, Waxes & Detailing Compounds', type: 'HSN', gstRate: 18.0 },
        { code: '3926', description: 'Interior Plastic Organizers & Trims', type: 'HSN', gstRate: 18.0 },
        { code: '8512', description: 'Automotive Lighting, Horns & Electronics', type: 'HSN', gstRate: 18.0 },
        { code: '4011', description: 'Pneumatic Rubber Tyres & Tubes', type: 'HSN', gstRate: 28.0 },
        { code: '9968', description: 'Shipping & Courier Logistics (SAC)', type: 'SAC', gstRate: 18.0 },
        { code: '9983', description: 'Platform Services & Convenience Fee (SAC)', type: 'SAC', gstRate: 18.0 },
      ]

      for (const t of defaultTaxes) {
        await this.prisma.taxMaster.upsert({
          where: { code: t.code },
          update: { description: t.description, gstRate: t.gstRate, type: t.type },
          create: t,
        })
      }

      taxes = await this.prisma.taxMaster.findMany({ orderBy: { code: 'asc' } })
    }

    return taxes.map((t) => ({
      code: t.code,
      description: t.description,
      type: t.type,
      gstRate: Number(t.gstRate),
    }))
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
      gstRate: p.tax?.gstRate ? Number(p.tax.gstRate) : Number(p.gstRate ?? 18),
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
      gstRate: product.tax?.gstRate ? Number(product.tax.gstRate) : Number(product.gstRate ?? 18),
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
    const taxCode = dto.taxCode || dto.hsnCode || null
    let gstRate = 18
    if (taxCode) {
      const taxRecord = await this.prisma.taxMaster.findUnique({
        where: { code: taxCode },
      })
      if (taxRecord) {
        gstRate = Number(taxRecord.gstRate)
      }
    } else if (dto.gstRate) {
      gstRate = Number(dto.gstRate)
    }

    const baseCost = Number(dto.productCost ?? dto.basePrice ?? 0)
    const gstAmount = Number(((baseCost * gstRate) / 100).toFixed(2))
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
        taxCode,
        hsnCode: taxCode,
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
    const taxCode = dto.taxCode !== undefined ? dto.taxCode : (dto.hsnCode !== undefined ? dto.hsnCode : existing.taxCode)
    data.taxCode = taxCode
    data.hsnCode = taxCode

    let gstRate = Number(existing.gstRate ?? 18)
    if (taxCode && taxCode !== existing.taxCode) {
      const taxRecord = await this.prisma.taxMaster.findUnique({ where: { code: taxCode } })
      if (taxRecord) gstRate = Number(taxRecord.gstRate)
      data.gstRate = gstRate
    }

    if (dto.productCost !== undefined || dto.basePrice !== undefined) {
      const baseCost = Number(dto.productCost ?? dto.basePrice)
      data.productCost = baseCost
      const gstAmount = Number(((baseCost * gstRate) / 100).toFixed(2))
      data.gst = gstAmount
      if (dto.price === undefined) {
        data.price = Number((baseCost + gstAmount).toFixed(2))
      }
    }

    if (dto.price !== undefined) {
      data.price = Number(dto.price)
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

    await this.prisma.product.delete({
      where: { id: existing.id },
    })
    return { success: true }
  }

  async archiveProduct(id: string) {
    return this.deleteProduct(id)
  }
}
