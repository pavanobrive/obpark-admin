import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateCategoryDto {
  categoryName?: string
  name?: string
  slug: string
  shortDescription?: string
  description?: string
  imagePath?: string
  imageUrl?: string
}

export interface UpdateCategoryDto {
  categoryName?: string
  name?: string
  slug?: string
  shortDescription?: string
  description?: string
  imagePath?: string
  imageUrl?: string
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { categoryName: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return categories.map((c) => ({
      id: c.id,
      categoryName: c.categoryName,
      name: c.categoryName, // backward compatibility alias
      slug: c.slug,
      shortDescription: c.shortDescription,
      description: c.shortDescription, // alias
      imagePath: c.imagePath,
      imageUrl: c.imagePath, // alias
      productCount: c._count.products,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!category) throw new NotFoundException('Category not found')
    return {
      ...category,
      name: category.categoryName,
      description: category.shortDescription,
      imageUrl: category.imagePath,
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    const categoryName = dto.categoryName || dto.name
    if (!categoryName) {
      throw new BadRequestException('categoryName is required')
    }

    const slug = (dto.slug || categoryName)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const existing = await this.prisma.category.findUnique({ where: { slug } })
    if (existing) throw new ConflictException('A category with this slug already exists')

    const created = await this.prisma.category.create({
      data: {
        categoryName,
        slug,
        shortDescription: dto.shortDescription || dto.description || null,
        imagePath: dto.imagePath || dto.imageUrl || null,
      },
    })

    return {
      ...created,
      name: created.categoryName,
      description: created.shortDescription,
      imageUrl: created.imagePath,
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')

    const data: any = {}
    if (dto.categoryName || dto.name) data.categoryName = dto.categoryName || dto.name
    if (dto.slug) data.slug = dto.slug
    if (dto.shortDescription !== undefined || dto.description !== undefined) {
      data.shortDescription = dto.shortDescription ?? dto.description
    }
    if (dto.imagePath !== undefined || dto.imageUrl !== undefined) {
      data.imagePath = dto.imagePath ?? dto.imageUrl
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data,
    })

    return {
      ...updated,
      name: updated.categoryName,
      description: updated.shortDescription,
      imageUrl: updated.imagePath,
    }
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')
    const productCount = await this.prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      throw new BadRequestException(`Cannot delete — ${productCount} product(s) still use this category`)
    }
    await this.prisma.category.delete({ where: { id } })
    return { success: true }
  }

  async getProductsByCategory(categoryId: string) {
    const products = await this.prisma.product.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'desc' },
    })
    return products.map((p) => ({
      id: p.id,
      productId: p.productId,
      productName: p.productName,
      name: p.productName,
      productCost: Number(p.productCost),
      price: Number(p.price),
      imagePath: p.imagePath,
      images: p.images,
      createdAt: p.createdAt,
    }))
  }
}
