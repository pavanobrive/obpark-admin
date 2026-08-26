import { Controller, Get, Post, Delete, Query, Body, Param, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
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
    images?: string[]
  }) {
    return this.adminService.createProduct(dto)
  }

  @Delete('products/:id')
  archiveProduct(@Param('id') id: string) {
    return this.adminService.archiveProduct(id)
  }
}