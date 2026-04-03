import { useState, useCallback } from 'react';
import { Invoice, EarningsSummary } from '../types';
import * as invoiceService from '../services/invoices';
import type { InvoiceQuery, CreateInvoiceData } from '../services/invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);

  const fetchInvoices = useCallback(async (query?: InvoiceQuery) => {
    setLoading(true);
    setError(null);
    try {
      const [invoicesData, summaryData] = await Promise.all([
        invoiceService.getInvoices(query),
        invoiceService.getEarningsSummary(),
      ]);
      setInvoices(invoicesData.invoices ?? invoicesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (data: CreateInvoiceData) => {
    setLoading(true);
    setError(null);
    try {
      const invoice = await invoiceService.createInvoice(data);
      setInvoices((prev) => [invoice, ...prev]);
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, data: Partial<CreateInvoiceData>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await invoiceService.updateInvoice(id, data);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await invoiceService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendInvoice = useCallback(async (id: string) => {
    setError(null);
    try {
      const updated = await invoiceService.sendInvoice(id);
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
      throw err;
    }
  }, []);

  const payInvoice = useCallback(async (id: string, method: string) => {
    setError(null);
    try {
      const result = await invoiceService.payInvoice(id, method);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      throw err;
    }
  }, []);

  return {
    invoices,
    loading,
    error,
    summary,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    payInvoice,
  };
}
