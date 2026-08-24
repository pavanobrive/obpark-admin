import { Controller, Get, Post, Delete, Query, Body, Param } from '@nestjs/common'
import { AdminService } from './admin.service'

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats()
  }

  @Get('products')
  listProducts(@Query('search') search?: string, @Query('limit') limit?: string) {
    return this.adminService.listProducts(search, limit ? Number(limit) : undefined)
  }

  @Post('products')
  createProduct(@Body() dto: {
    name: string
    slug: string
    description?: string
    basePrice: number
    sku: string
    stock: number
    categoryId: string
  }) {
    return this.adminService.createProduct(dto)
  }

  @Delete('products/:id')
  archiveProduct(@Param('id') id: string) {
    return this.adminService.archiveProduct(id)
  }
}