import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  }

  async getCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({ where: { slug } })
  }

  async createCategory(dto: { name: string; slug: string; description?: string; imageUrl?: string }) {
    const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } })
    if (existing) throw new ConflictException('A category with this slug already exists')
    return this.prisma.category.create({ data: dto })
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')
    const productCount = await this.prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) throw new BadRequestException(`Cannot delete — ${productCount} product(s) still use this category`)
    await this.prisma.category.delete({ where: { id } })
    return { success: true }
  }

  async getProductsByCategory(categoryId: string) {
    const products = await this.prisma.product.findMany({
      where: { categoryId },
      select: { id: true, name: true, createdAt: true, orderItems: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return products.map((p) => ({ id: p.id, name: p.name, createdAt: p.createdAt, orderCount: p.orderItems.length }))
  }
}