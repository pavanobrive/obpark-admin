import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { CategoryService } from './category.service'

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

  @Post('admin/categories')
  create(@Body() dto: { name: string; slug: string; description?: string; imageUrl?: string }) {
    return this.categoryService.createCategory(dto)
  }

  @Delete('admin/categories/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id)
  }
}