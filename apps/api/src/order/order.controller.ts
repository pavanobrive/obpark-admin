import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common'
import { OrderService } from './order.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('counts')
  getCounts() {
    return this.orderService.getOrderCounts()
  }

  @Get()
  list(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.orderService.listOrders(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    )
  }

  @Patch(':orderId/status')
  updateStatus(@Param('orderId') orderId: string, @Body('status') status: string) {
    return this.orderService.updateStatus(orderId, status)
  }
}