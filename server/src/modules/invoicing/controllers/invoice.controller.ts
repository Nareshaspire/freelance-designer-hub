import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { GenerateInvoiceDto } from '../dto/generate-invoice.dto';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('invoices')
@ApiHeader({ name: 'x-user-id', description: 'User ID (temporary auth header)', required: true })
@UseGuards(AuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.createInvoice(createInvoiceDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with filters and pagination' })
  findAll(
    @Query() query: InvoiceQueryDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.findAll(query, userId);
  }

  @Get('report/summary')
  @ApiOperation({ summary: 'Get earnings summary for freelancer' })
  getEarningsSummary(@Headers('x-user-id') userId: string) {
    return this.invoiceService.getEarningsSummary(userId);
  }

  @Get('report/monthly')
  @ApiOperation({ summary: 'Get monthly earnings breakdown' })
  getMonthlyEarnings(@Headers('x-user-id') userId: string) {
    return this.invoiceService.getMonthlyEarnings(userId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export invoices to CSV' })
  async exportCsv(
    @Headers('x-user-id') userId: string,
    @Res() res: Response,
  ) {
    const csv = await this.invoiceService.exportToCsv(userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
    res.send(csv);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Auto-generate invoice from project milestones' })
  generateFromMilestones(
    @Body() generateDto: GenerateInvoiceDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.generateFromMilestones(generateDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft invoice' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInvoiceDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft invoice' })
  delete(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.delete(id, userId);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send invoice to client' })
  sendInvoice(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.sendInvoice(id, userId);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Initiate payment for an invoice' })
  initiatePayment(
    @Param('id') id: string,
    @Body() dto: InitiatePaymentDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.invoiceService.initiatePayment(id, dto.paymentMethod, userId);
  }
}
