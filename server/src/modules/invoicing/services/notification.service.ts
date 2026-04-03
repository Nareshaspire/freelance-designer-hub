import { Injectable, Logger } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  sendInvoiceCreatedNotification(invoice: Invoice): void {
    this.logger.log(`Invoice created: ${invoice.invoiceNumber} for client ${invoice.clientId}`);
  }

  sendInvoiceSentNotification(invoice: Invoice): void {
    this.logger.log(`Invoice sent: ${invoice.invoiceNumber} to client ${invoice.clientId}`);
  }

  sendInvoiceViewedNotification(invoice: Invoice): void {
    this.logger.log(`Invoice viewed: ${invoice.invoiceNumber} by client ${invoice.clientId}`);
  }

  sendInvoicePaidNotification(invoice: Invoice): void {
    this.logger.log(`Invoice paid: ${invoice.invoiceNumber} - Amount: ${invoice.totalAmount} ${invoice.currency}`);
  }

  sendInvoiceOverdueNotification(invoice: Invoice): void {
    this.logger.warn(`Invoice overdue: ${invoice.invoiceNumber} - Due date: ${invoice.dueDate}`);
  }
}
