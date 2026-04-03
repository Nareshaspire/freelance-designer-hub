import { useState, useCallback } from 'react';
import { Payment } from '../types';
import * as paymentService from '../services/payments';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getPayments();
      setPayments(data.payments ?? data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPayment = useCallback(async (id: string) => {
    setError(null);
    try {
      return await paymentService.getPayment(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment');
      throw err;
    }
  }, []);

  return { payments, loading, error, fetchPayments, getPayment };
}
