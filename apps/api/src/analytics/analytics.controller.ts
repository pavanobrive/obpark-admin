import { Controller, Get, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('order-status-breakdown')
  getOrderStatusBreakdown() {
    return this.analyticsService.getOrderStatusBreakdown()
  }

  @Get('revenue-trend')
  getRevenueTrend() {
    return this.analyticsService.getRevenueTrend()
  }
}