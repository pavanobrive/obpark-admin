import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async listReviews() {
    const reviews = await this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true } } },
    })
    return reviews.map((r) => ({
      id: r.id,
      productName: r.product.name,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      status: r.status === 'PUBLISHED' ? 'Published' : r.status === 'REJECTED' ? 'Rejected' : 'Pending',
    }))
  }

  async approve(id: string) {
    await this.assertExists(id)
    return this.prisma.review.update({ where: { id }, data: { status: 'PUBLISHED' } })
  }

  async reject(id: string) {
    await this.assertExists(id)
    return this.prisma.review.update({ where: { id }, data: { status: 'REJECTED' } })
  }

  async remove(id: string) {
    await this.assertExists(id)
    await this.prisma.review.delete({ where: { id } })
    return { success: true }
  }

  private async assertExists(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundException('Review not found')
  }
}