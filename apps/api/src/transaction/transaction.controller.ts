import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('admin/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('summary')
  getSummary() {
    return this.transactionService.getSummary()
  }

  @Get()
  list(@Query() query: any) {
    return this.transactionService.listTransactions(query)
  }
}