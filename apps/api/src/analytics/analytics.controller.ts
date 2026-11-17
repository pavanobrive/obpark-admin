import { Controller, Get, Query, UseGuards } from '@nestjs/common'
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
  getRevenueTrend(@Query('year') year?: string, @Query('month') month?: string) {
    return this.analyticsService.getRevenueTrend(
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined
    )
  }
}
