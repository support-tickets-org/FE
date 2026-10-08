// Mirrors BE/src/modules/tickets/ticket.types.ts. Keep the two in sync.
export const TICKET_STATUSES = ['open', 'in_progress', 'closed'] as const;
export const TICKET_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority: TicketPriority;
}

export type UpdateTicketInput = Partial<{
  title: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
}>;

export interface TicketFilters {
  status?: TicketStatus;
  q?: string;
  page: number;
  limit: number;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
