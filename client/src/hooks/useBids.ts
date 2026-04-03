import { useState, useEffect, useCallback } from 'react';
import { Bid, CreateBidInput, getProjectBids, createBid as apiCreateBid } from '@/services/projects';
import {
  getMyBids,
  updateBid as apiUpdateBid,
  withdrawBid as apiWithdrawBid,
  acceptBid as apiAcceptBid,
  rejectBid as apiRejectBid,
} from '@/services/bids';

export function useBids(projectId?: string) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = projectId ? await getProjectBids(projectId) : await getMyBids();
      setBids(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const submitBid = useCallback(async (data: CreateBidInput): Promise<Bid> => {
    if (!projectId) throw new Error('projectId required to submit a bid');
    const bid = await apiCreateBid(projectId, data);
    setBids(prev => [...prev, bid]);
    return bid;
  }, [projectId]);

  const updateBid = useCallback(async (id: string, data: Partial<CreateBidInput>): Promise<Bid> => {
    const bid = await apiUpdateBid(id, data);
    setBids(prev => prev.map(b => b.id === id ? bid : b));
    return bid;
  }, []);

  const withdrawBid = useCallback(async (id: string): Promise<void> => {
    await apiWithdrawBid(id);
    await fetchBids();
  }, [fetchBids]);

  const acceptBid = useCallback(async (id: string): Promise<Bid> => {
    const bid = await apiAcceptBid(id);
    setBids(prev => prev.map(b => b.id === id ? bid : b));
    return bid;
  }, []);

  const rejectBid = useCallback(async (id: string): Promise<Bid> => {
    const bid = await apiRejectBid(id);
    setBids(prev => prev.map(b => b.id === id ? bid : b));
    return bid;
  }, []);

  return {
    bids,
    loading,
    error,
    submitBid,
    updateBid,
    withdrawBid,
    acceptBid,
    rejectBid,
    refresh: fetchBids,
  };
}
