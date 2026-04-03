import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY', 'sk_test_placeholder'),
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    const amountInCents = Math.round(amount * 100);
    return this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata,
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createTransfer(
    amount: number,
    currency: string,
    destinationAccount: string,
  ): Promise<Stripe.Transfer> {
    const amountInCents = Math.round(amount * 100);
    return this.stripe.transfers.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      destination: destinationAccount,
    });
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    const refundData: Stripe.RefundCreateParams = { payment_intent: paymentIntentId };
    if (amount !== undefined) {
      refundData.amount = Math.round(amount * 100);
    }
    return this.stripe.refunds.create(refundData);
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
