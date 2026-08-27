import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { CouponService, CreateCouponDto } from './coupon.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.createCoupon(dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.couponService.toggleCoupon(id)
  }
}