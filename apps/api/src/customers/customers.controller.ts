import { Controller, Get, Query } from '@nestjs/common'
import { CustomersService } from './customers.service'

@Controller('admin/customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.customersService.listCustomers(search)
  }
}