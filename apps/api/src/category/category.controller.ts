import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { CategoryService, CreateCategoryDto, UpdateCategoryDto } from './category.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('categories')
  list() {
    return this.categoryService.getCategories()
  }

  @Get('categories/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoryService.getCategoryBySlug(slug)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/categories')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/categories/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(id, dto)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/categories/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id)
  }
}
