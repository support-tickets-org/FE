import { useCallback, useEffect, useState } from 'react';
import { ApiError, isAbortError } from '../services/apiClient';
import { getTickets, updateTicket } from '../services/ticketService';
import type { Ticket, TicketFilters, TicketStatus } from '../types/ticket';

export function useTickets(filters: TicketFilters) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Depend on the primitive values, not the filters object, so a new object
  // with the same values on every render doesn't trigger a refetch.
  const { status, q, page, limit } = filters;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getTickets({ status, q, page, limit }, controller.signal)
      .then((result) => {
        setTickets(result.data);
        setTotal(result.total);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'Something went wrong'));
      })
      .finally(() => {
        // A newer request owns the loading state once this one is aborted.
        if (!controller.signal.aborted) setLoading(false);
      });

    // Aborting on cleanup means a slow, stale response can never overwrite newer results.
    return () => controller.abort();
  }, [status, q, page, limit, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  const replaceTicket = (updated: Ticket) =>
    setTickets((current) => current.map((t) => (t.id === updated.id ? updated : t)));

  const updateStatus = useCallback(
    async (id: number, nextStatus: TicketStatus) => {
      const previous = tickets.find((t) => t.id === id);
      if (!previous) return;

      replaceTicket({ ...previous, status: nextStatus });

      try {
        replaceTicket(await updateTicket(id, { status: nextStatus }));
      } catch (err) {
        replaceTicket(previous);
        throw err;
      }
    },
    [tickets],
  );

  return { tickets, total, loading, error, updateStatus, refetch };
}
