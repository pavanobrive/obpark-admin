import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { CategoryService } from './category.service'

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  list() {
    return this.categoryService.getCategories()
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoryService.getCategoryBySlug(slug)
  }

  @Post()
  create(@Body() dto: { name: string; slug: string; description?: string }) {
    return this.categoryService.createCategory(dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id)
  }
}