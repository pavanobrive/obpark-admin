import { Controller, Get, Patch, Query, Param, Body } from '@nestjs/common'
import { OrderService } from './order.service'

@Controller('admin/orders')
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