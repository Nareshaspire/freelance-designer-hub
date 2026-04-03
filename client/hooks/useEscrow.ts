import { useState, useCallback } from 'react';
import { EscrowTransaction } from '../types';
import * as paymentService from '../services/payments';
import type { FundEscrowData } from '../services/payments';

export function useEscrow() {
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEscrowTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getEscrowTransactions();
      setEscrowTransactions(data.escrowTransactions ?? data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch escrow transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fundEscrow = useCallback(async (data: FundEscrowData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.fundEscrow(data);
      await fetchEscrowTransactions();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fund escrow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEscrowTransactions]);

  const releaseEscrow = useCallback(async (id: string) => {
    setError(null);
    try {
      const result = await paymentService.releaseEscrow(id);
      setEscrowTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'released' as const } : t))
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release escrow');
      throw err;
    }
  }, []);

  const disputeEscrow = useCallback(async (id: string) => {
    setError(null);
    try {
      const result = await paymentService.disputeEscrow(id);
      setEscrowTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'disputed' as const } : t))
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispute escrow');
      throw err;
    }
  }, []);

  return {
    escrowTransactions,
    loading,
    error,
    fundEscrow,
    releaseEscrow,
    disputeEscrow,
    fetchEscrowTransactions,
  };
}
