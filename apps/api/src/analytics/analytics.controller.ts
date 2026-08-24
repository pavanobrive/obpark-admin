import { Controller, Get } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'

@Controller('admin/analytics')
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