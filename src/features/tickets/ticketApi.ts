import { request } from '../../lib/apiClient';
import type {
  CreateTicketInput,
  PaginatedResponse,
  Ticket,
  TicketFilters,
  UpdateTicketInput,
} from './ticket.types';

export function getTickets(filters: TicketFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
  if (filters.status) params.set('status', filters.status);
  if (filters.q) params.set('q', filters.q);

  return request<PaginatedResponse<Ticket>>(`/tickets?${params}`, { signal });
}

export function createTicket(input: CreateTicketInput) {
  return request<Ticket>('/tickets', { method: 'POST', body: input });
}

export function updateTicket(id: number, changes: UpdateTicketInput) {
  return request<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: changes });
}
