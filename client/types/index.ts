export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type EscrowStatus = 'funded' | 'released' | 'refunded' | 'disputed';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  milestoneId?: string;
  clientId: string;
  freelancerId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  projectId: string;
  milestoneId?: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  fundedAt: string;
  releasedAt?: string;
  createdAt: string;
}

export interface EarningsSummary {
  totalEarned: number;
  totalPending: number;
  totalOverdue: number;
  currency: string;
}
