import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { DiscountType } from '@prisma/client'

export interface CreateCouponDto {
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderValue?: number
  maxUses?: number
  expiresAt?: string
}

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async validateCoupon(code: string, orderSubtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon || !coupon.isActive) throw new NotFoundException('Invalid or expired coupon code')
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('This coupon has expired')
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('This coupon has reached its usage limit')
    if (coupon.minOrderValue && orderSubtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException(`Minimum order value of ₹${coupon.minOrderValue} required`)
    }
    const discount = coupon.discountType === DiscountType.FLAT
      ? Math.min(Number(coupon.discountValue), orderSubtotal)
      : Math.floor((orderSubtotal * Number(coupon.discountValue)) / 100)
    return { coupon, discount, finalTotal: orderSubtotal - discount }
  }

  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } })
    if (existing) throw new ConflictException('Coupon code already exists')
    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description || null,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue || null,
        maxUses: dto.maxUses || null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    })
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async toggleCoupon(couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon) throw new NotFoundException('Coupon not found')
    return this.prisma.coupon.update({ where: { id: couponId }, data: { isActive: !coupon.isActive } })
  }

  async deleteCoupon(couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } })
    if (!coupon) throw new NotFoundException('Coupon not found')
    await this.prisma.coupon.delete({ where: { id: couponId } })
    return { success: true, message: 'Coupon deleted successfully' }
  }
}
