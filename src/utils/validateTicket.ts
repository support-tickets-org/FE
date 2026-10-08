import { TICKET_PRIORITIES, type CreateTicketInput } from '../types/ticket';

export type TicketFormErrors = Partial<Record<keyof CreateTicketInput, string>>;

// Mirrors the server rules so users get instant feedback; the server still validates.
export function validateTicket(input: CreateTicketInput): TicketFormErrors {
  const errors: TicketFormErrors = {};
  const title = input.title.trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length < 3) errors.title = 'Title must be at least 3 characters';
  else if (title.length > 100) errors.title = 'Title must be at most 100 characters';

  if (input.description && input.description.trim().length > 1000) {
    errors.description = 'Description must be at most 1000 characters';
  }

  if (!TICKET_PRIORITIES.includes(input.priority)) errors.priority = 'Choose a priority';

  return errors;
}
