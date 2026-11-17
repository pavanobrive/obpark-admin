import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'

export interface CreateCategoryDto {
  categoryName?: string
  name?: string
  slug?: string
  shortDescription?: string
  description?: string
  cardImage?: string
  bannerImage?: string
  sliderImage?: string
  imagePath?: string
  imageUrl?: string
}

export interface UpdateCategoryDto {
  categoryName?: string
  name?: string
  slug?: string
  shortDescription?: string
  description?: string
  cardImage?: string
  bannerImage?: string
  sliderImage?: string
  imagePath?: string
  imageUrl?: string
}

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { categoryName: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return categories.map((c) => {
      // If any image is empty or missing, fall back to bannerImage
      const banner = c.bannerImage || c.cardImage || c.imagePath
      const card = c.cardImage || banner
      const slider = c.sliderImage || banner

      return {
        id: c.id,
        categoryName: c.categoryName,
        name: c.categoryName,
        slug: c.slug,
        shortDescription: c.shortDescription,
        description: c.description || c.shortDescription,
        cardImage: card,
        bannerImage: banner,
        sliderImage: slider,
        imagePath: card,
        imageUrl: card,
        productCount: c._count.products,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }
    })
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

    const banner = category.bannerImage || category.cardImage || category.imagePath
    const card = category.cardImage || banner
    const slider = category.sliderImage || banner

    return {
      ...category,
      name: category.categoryName,
      description: category.description || category.shortDescription,
      cardImage: card,
      bannerImage: banner,
      sliderImage: slider,
      imageUrl: card,
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

    const bannerImage = dto.bannerImage || null
    const cardImage = dto.cardImage || bannerImage || dto.imagePath || dto.imageUrl || null
    const sliderImage = dto.sliderImage || bannerImage || cardImage || null
    const description = dto.description || dto.shortDescription || null
    const shortDescription = dto.shortDescription || dto.description || null

    const created = await this.prisma.category.create({
      data: {
        categoryName,
        slug,
        shortDescription,
        description,
        cardImage,
        bannerImage,
        sliderImage,
        imagePath: cardImage,
      },
    })

    return {
      ...created,
      name: created.categoryName,
      description: created.description || created.shortDescription,
      imageUrl: created.cardImage || created.imagePath,
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')

    const data: any = {}
    if (dto.categoryName || dto.name) data.categoryName = dto.categoryName || dto.name
    if (dto.slug) data.slug = dto.slug
    if (dto.description !== undefined) {
      data.description = dto.description
    }
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription
    }
    if (data.description === undefined && data.shortDescription !== undefined) {
      data.description = data.shortDescription
    }

    // Clean up replaced individual files if new ones are uploaded
    if (dto.cardImage !== undefined) {
      if (category.cardImage && category.cardImage !== dto.cardImage) {
        this.storageService.deleteFile(category.cardImage)
      }
      data.cardImage = dto.cardImage
      data.imagePath = dto.cardImage
    } else if (dto.imagePath !== undefined || dto.imageUrl !== undefined) {
      const img = dto.imagePath ?? dto.imageUrl
      if (category.imagePath && category.imagePath !== img) {
        this.storageService.deleteFile(category.imagePath)
      }
      data.cardImage = img
      data.imagePath = img
    }

    if (dto.bannerImage !== undefined) {
      if (category.bannerImage && category.bannerImage !== dto.bannerImage && category.bannerImage !== category.cardImage) {
        this.storageService.deleteFile(category.bannerImage)
      }
      data.bannerImage = dto.bannerImage
    }

    if (dto.sliderImage !== undefined) {
      if (category.sliderImage && category.sliderImage !== dto.sliderImage && category.sliderImage !== category.cardImage) {
        this.storageService.deleteFile(category.sliderImage)
      }
      data.sliderImage = dto.sliderImage
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data,
    })

    return {
      ...updated,
      name: updated.categoryName,
      description: updated.shortDescription,
      imageUrl: updated.cardImage || updated.imagePath,
    }
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundException('Category not found')
    const productCount = await this.prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      throw new BadRequestException(`Cannot delete: ${productCount} product(s) still use this category. Move or delete them first.`)
    }

    // Residual file and folder cleanup from disk
    this.storageService.deleteCategoryFolder(category.slug)
    if (category.cardImage) this.storageService.deleteFile(category.cardImage)
    if (category.bannerImage) this.storageService.deleteFile(category.bannerImage)
    if (category.sliderImage) this.storageService.deleteFile(category.sliderImage)
    if (category.imagePath) this.storageService.deleteFile(category.imagePath)

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
