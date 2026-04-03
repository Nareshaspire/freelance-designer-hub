import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import Stripe from 'stripe';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { Payment, PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceQueryDto } from '../dto/invoice-query.dto';
import { GenerateInvoiceDto } from '../dto/generate-invoice.dto';
import { StripeService } from './stripe.service';
import { NotificationService } from './notification.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly notificationService: NotificationService,
  ) {}

  async generateInvoiceNumber(freelancerId: string, year: number): Promise<string> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.freelancerId = :freelancerId', { freelancerId })
      .andWhere('EXTRACT(YEAR FROM invoice.createdAt) = :year', { year })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (result) {
      const parts = result.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `INV-${year}-${String(sequence).padStart(4, '0')}`;
  }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    freelancerId: string,
  ): Promise<Invoice> {
    const { items, taxRate = 0, discount = 0, currency = 'USD', ...rest } = createInvoiceDto;

    const calculatedItems = items.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount - discount;

    const year = new Date().getFullYear();
    const invoiceNumber = await this.generateInvoiceNumber(freelancerId, year);

    const invoice = this.invoiceRepository.create({
      ...rest,
      freelancerId,
      currency,
      taxRate,
      discount,
      items: calculatedItems,
      subtotal,
      taxAmount,
      totalAmount,
      invoiceNumber,
      status: InvoiceStatus.DRAFT,
    });

    const saved = await this.invoiceRepository.save(invoice);
    this.notificationService.sendInvoiceCreatedNotification(saved);
    return saved;
  }

  async findAll(
    query: InvoiceQueryDto,
    userId: string,
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    const { status, dateFrom, dateTo, clientId, freelancerId, projectId, page = 1, limit = 10 } = query;

    const qb = this.invoiceRepository.createQueryBuilder('invoice');

    qb.where(
      '(invoice.freelancerId = :userId OR invoice.clientId = :userId)',
      { userId },
    );

    if (status) qb.andWhere('invoice.status = :status', { status });
    if (clientId) qb.andWhere('invoice.clientId = :clientId', { clientId });
    if (freelancerId) qb.andWhere('invoice.freelancerId = :freelancerId', { freelancerId });
    if (projectId) qb.andWhere('invoice.projectId = :projectId', { projectId });
    if (dateFrom) qb.andWhere('invoice.createdAt >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('invoice.createdAt <= :dateTo', { dateTo });

    qb.orderBy('invoice.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['payments'],
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async update(
    id: string,
    updateDto: UpdateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.freelancerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this invoice');
    }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    if (updateDto.items) {
      const calculatedItems = updateDto.items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }));
      const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
      const taxRate = updateDto.taxRate ?? invoice.taxRate;
      const discount = updateDto.discount ?? invoice.discount;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount - discount;

      Object.assign(invoice, updateDto, {
        items: calculatedItems,
        subtotal,
        taxAmount,
        totalAmount,
      });
    } else {
      Object.assign(invoice, updateDto);
    }

    return this.invoiceRepository.save(invoice);
  }

  async delete(id: string, userId: string): Promise<void> {
    const invoice = await this.findOne(id);

    if (invoice.freelancerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this invoice');
    }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.invoiceRepository.remove(invoice);
  }

  async sendInvoice(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.freelancerId !== userId) {
      throw new ForbiddenException('You do not have permission to send this invoice');
    }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    invoice.status = InvoiceStatus.SENT;
    const saved = await this.invoiceRepository.save(invoice);
    this.notificationService.sendInvoiceSentNotification(saved);
    return saved;
  }

  async markAsViewed(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);

    if (invoice.status === InvoiceStatus.SENT) {
      invoice.status = InvoiceStatus.VIEWED;
      const saved = await this.invoiceRepository.save(invoice);
      this.notificationService.sendInvoiceViewedNotification(saved);
      return saved;
    }

    return invoice;
  }

  async initiatePayment(
    invoiceId: string,
    paymentMethod: string,
    userId: string,
  ): Promise<{ clientSecret: string; payment: Payment }> {
    const invoice = await this.findOne(invoiceId);

    if (invoice.clientId !== userId) {
      throw new ForbiddenException('Only the client can initiate payment');
    }
    if (![InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE].includes(invoice.status)) {
      throw new BadRequestException('Invoice is not payable in its current status');
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      invoice.totalAmount,
      invoice.currency,
      {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
        freelancerId: invoice.freelancerId,
      },
    );

    const payment = this.paymentRepository.create({
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      currency: invoice.currency,
      method: paymentMethod as PaymentMethod,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      metadata: { paymentIntentId: paymentIntent.id },
    });

    const savedPayment = await this.paymentRepository.save(payment);
    return { clientSecret: paymentIntent.client_secret, payment: savedPayment };
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const payment = await this.paymentRepository.findOne({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          payment.status = PaymentStatus.COMPLETED;
          payment.paidAt = new Date();
          await this.paymentRepository.save(payment);

          const invoice = await this.findOne(payment.invoiceId);
          invoice.status = InvoiceStatus.PAID;
          invoice.paidAt = new Date();
          await this.invoiceRepository.save(invoice);
          this.notificationService.sendInvoicePaidNotification(invoice);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const payment = await this.paymentRepository.findOne({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          payment.status = PaymentStatus.FAILED;
          await this.paymentRepository.save(payment);
        }
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  async getEarningsSummary(freelancerId: string): Promise<{
    totalEarned: number;
    totalPending: number;
    totalOverdue: number;
  }> {
    const invoices = await this.invoiceRepository.find({
      where: { freelancerId },
    });

    const totalEarned = invoices
      .filter((i) => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + Number(i.totalAmount), 0);

    const totalPending = invoices
      .filter((i) => [InvoiceStatus.SENT, InvoiceStatus.VIEWED].includes(i.status))
      .reduce((sum, i) => sum + Number(i.totalAmount), 0);

    const totalOverdue = invoices
      .filter((i) => i.status === InvoiceStatus.OVERDUE)
      .reduce((sum, i) => sum + Number(i.totalAmount), 0);

    return { totalEarned, totalPending, totalOverdue };
  }

  async getMonthlyEarnings(freelancerId: string): Promise<Array<{ month: string; total: number }>> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select("TO_CHAR(invoice.paidAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(invoice.totalAmount)', 'total')
      .where('invoice.freelancerId = :freelancerId', { freelancerId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.paidAt IS NOT NULL')
      .groupBy("TO_CHAR(invoice.paidAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(invoice.paidAt, 'YYYY-MM')", 'DESC')
      .getRawMany();

    return result.map((r) => ({ month: r.month, total: parseFloat(r.total) }));
  }

  async exportToCsv(freelancerId: string): Promise<string> {
    const invoices = await this.invoiceRepository.find({
      where: { freelancerId },
      order: { createdAt: 'DESC' },
    });

    const headers = [
      'Invoice Number',
      'Status',
      'Client ID',
      'Project ID',
      'Subtotal',
      'Tax Rate',
      'Tax Amount',
      'Discount',
      'Total Amount',
      'Currency',
      'Due Date',
      'Paid At',
      'Created At',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.status,
      inv.clientId,
      inv.projectId,
      inv.subtotal,
      inv.taxRate,
      inv.taxAmount,
      inv.discount,
      inv.totalAmount,
      inv.currency,
      inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      inv.paidAt ? inv.paidAt.toISOString() : '',
      inv.createdAt.toISOString(),
    ]);

    const csvLines = [headers.join(','), ...rows.map((r) => r.join(','))];
    return csvLines.join('\n');
  }

  async generateFromMilestones(
    dto: GenerateInvoiceDto,
    freelancerId: string,
  ): Promise<Invoice> {
    const { projectId, milestoneIds = [], includeTrackedTime = false } = dto;

    const items = milestoneIds.map((milestoneId, index) => ({
      description: `Milestone ${index + 1} (ID: ${milestoneId})${includeTrackedTime ? ' + tracked time' : ''}`,
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    }));

    if (items.length === 0) {
      items.push({
        description: 'Project deliverables',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const year = new Date().getFullYear();
    const invoiceNumber = await this.generateInvoiceNumber(freelancerId, year);

    const invoice = this.invoiceRepository.create({
      projectId,
      milestoneId: milestoneIds[0] || null,
      clientId: 'placeholder-client-id',
      freelancerId,
      items,
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      totalAmount: 0,
      currency: 'USD',
      dueDate,
      invoiceNumber,
      status: InvoiceStatus.DRAFT,
    });

    return this.invoiceRepository.save(invoice);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueInvoices(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = await this.invoiceRepository.find({
      where: [
        { status: InvoiceStatus.SENT, dueDate: LessThan(today) },
        { status: InvoiceStatus.VIEWED, dueDate: LessThan(today) },
      ],
    });

    for (const invoice of overdueInvoices) {
      invoice.status = InvoiceStatus.OVERDUE;
      await this.invoiceRepository.save(invoice);
      this.notificationService.sendInvoiceOverdueNotification(invoice);
      this.logger.warn(`Marked invoice ${invoice.invoiceNumber} as overdue`);
    }
  }
}
