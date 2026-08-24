import { Controller, Get, Query } from '@nestjs/common'
import { TransactionService } from './transaction.service'

@Controller('admin/transactions')
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