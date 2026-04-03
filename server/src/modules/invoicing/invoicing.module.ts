import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { Escrow } from './entities/escrow.entity';
import { InvoiceService } from './services/invoice.service';
import { EscrowService } from './services/escrow.service';
import { StripeService } from './services/stripe.service';
import { NotificationService } from './services/notification.service';
import { InvoiceController } from './controllers/invoice.controller';
import { PaymentController } from './controllers/payment.controller';
import { EscrowController } from './controllers/escrow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment, Escrow])],
  providers: [InvoiceService, EscrowService, StripeService, NotificationService],
  controllers: [InvoiceController, PaymentController, EscrowController],
  exports: [InvoiceService, EscrowService, StripeService],
})
export class InvoicingModule {}
