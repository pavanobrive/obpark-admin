import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { AdminService, CreateProductDto, UpdateProductDto } from './admin.service'
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

  @Get('taxes')
  getTaxes() {
    return this.adminService.getTaxes()
  }

  @Get('products')
  listProducts(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.listProducts(
      search,
      limit ? Number(limit) : undefined,
      page ? Number(page) : undefined,
    )
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.adminService.getProductById(id)
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto)
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminService.updateProduct(id, dto)
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id)
  }
}
