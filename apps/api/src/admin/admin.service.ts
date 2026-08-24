import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const PAID_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

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
      stockProducts,
      outOfStockProducts,
      recentOrdersRaw,
      ordersWithState,
      bestSellingRaw,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { createdAt: { gte: since }, status: { in: [...PAID_STATUSES] } },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: since } } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { stock: { gt: 0 } } }),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, total: true, status: true, createdAt: true },
      }),
      this.prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] } },
        select: { total: true, address: { select: { state: true } } },
      }),
      this.prisma.product.findMany({
        take: 4,
        orderBy: { orderItems: { _count: 'desc' } },
        select: { id: true, name: true, basePrice: true, stock: true, orderItems: { select: { id: true } } },
      }),
    ])

    const stateMap: Record<string, number> = {}
    ordersWithState.forEach((o) => {
      const state = o.address?.state || 'Unknown'
      stateMap[state] = (stateMap[state] || 0) + Number(o.total)
    })
    const salesByState = Object.entries(stateMap)
      .map(([state, total]) => ({ state, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)

    const bestSelling = bestSellingRaw.map((p) => ({
      id: p.id,
      name: p.name,
      orders: p.orderItems.length,
      inStock: p.stock > 0,
      price: Number(p.basePrice),
    }))

    return {
      totalRevenue: Number(revenueAgg._sum.total ?? 0),
      totalOrders,
      pendingOrders,
      canceledOrders,
      totalUsers,
      totalProducts,
      stockProducts,
      outOfStockProducts,
      recentOrders: recentOrdersRaw,
      salesByState,
      bestSelling,
    }
  }

  async listProducts(search?: string, limit = 20) {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ])
    return { products, total }
  }

    async createProduct(dto: {
    name: string
    slug: string
    description?: string
    basePrice: number
    sku: string
    stock: number
    categoryId: string
  }) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        basePrice: dto.basePrice,
        sku: dto.sku,
        stock: dto.stock,
        categoryId: dto.categoryId,
        images: [],
        compatibility: [],
      },
      include: { category: { select: { id: true, name: true } } },
    })
  }

  async archiveProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
  }
}