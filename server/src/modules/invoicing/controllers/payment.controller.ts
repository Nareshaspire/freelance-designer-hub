import {
  Controller,
  Get,
  Post,
  Param,
  Headers,
  UseGuards,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { StripeService } from '../services/stripe.service';
import { InvoiceService } from '../services/invoice.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  @ApiOperation({ summary: 'List payment history' })
  async findAll(@Headers('x-user-id') userId: string) {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.invoice', 'invoice')
      .where('invoice.clientId = :userId OR invoice.freelancerId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  @ApiOperation({ summary: 'Get payment details' })
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['invoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(req.rawBody, signature);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    await this.invoiceService.handleWebhook(event);
    return { received: true };
  }
}
