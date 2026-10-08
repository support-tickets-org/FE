import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, isAbortError } from '../services/apiClient';
import { getTickets, updateTicket } from '../services/ticketService';
import type { Ticket, TicketFilters, TicketStatus } from '../types/ticket';

export function useTickets(filters: TicketFilters) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const ticketsRef = useRef(tickets);
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  // Per ticket: the last status the server confirmed, and the id of the newest request.
  // Together they let an older, slower request neither overwrite nor roll back a newer change.
  const confirmedStatus = useRef(new Map<number, TicketStatus>());
  const latestRequest = useRef(new Map<number, number>());

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

  const setStatusLocally = (id: number, nextStatus: TicketStatus) =>
    setTickets((current) =>
      current.map((ticket) => (ticket.id === id ? { ...ticket, status: nextStatus } : ticket)),
    );

  const updateStatus = useCallback(async (id: number, nextStatus: TicketStatus) => {
    const ticket = ticketsRef.current.find((t) => t.id === id);
    if (!ticket || ticket.status === nextStatus) return;

    if (!confirmedStatus.current.has(id)) confirmedStatus.current.set(id, ticket.status);
    const requestId = (latestRequest.current.get(id) ?? 0) + 1;
    latestRequest.current.set(id, requestId);
    const isLatest = () => latestRequest.current.get(id) === requestId;

    setStatusLocally(id, nextStatus);

    try {
      const updated = await updateTicket(id, { status: nextStatus });
      if (isLatest()) {
        confirmedStatus.current.delete(id);
        setTickets((current) => current.map((t) => (t.id === id ? updated : t)));
      } else if (confirmedStatus.current.has(id)) {
        confirmedStatus.current.set(id, updated.status);
      }
    } catch (err) {
      if (isLatest()) {
        const rollbackTo = confirmedStatus.current.get(id) ?? ticket.status;
        confirmedStatus.current.delete(id);
        setStatusLocally(id, rollbackTo);
      }
      throw err;
    }
  }, []);

  return { tickets, total, loading, error, updateStatus, refetch };
}
