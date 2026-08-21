import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common'
import { CouponService, CreateCouponDto } from './coupon.service'

@Controller('coupons')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Post('validate')
  validate(@Body() dto: { code: string; subtotal: number }) {
    return this.couponService.validateCoupon(dto.code, dto.subtotal)
  }

  @Get()
  list() {
    return this.couponService.listCoupons()
  }

  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.createCoupon(dto)
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.couponService.toggleCoupon(id)
  }
}