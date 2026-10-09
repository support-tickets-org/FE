import type { ApiError } from '../../../lib/apiClient';
import type { Ticket, TicketStatus } from '../ticket.types';
import { TicketRow } from './TicketRow';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  error: ApiError | null;
  onRetry: () => void;
  onStatusChange: (id: number, status: TicketStatus) => Promise<void>;
}

export function TicketList({ tickets, loading, error, onRetry, onStatusChange }: TicketListProps) {
  if (error) {
    return (
      <div className="state state-error" role="alert">
        <p>Couldn't load tickets: {error.message}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="state" aria-busy="true">
        Loading tickets…
      </div>
    );
  }

  if (tickets.length === 0) {
    return <div className="state">No tickets found.</div>;
  }

  return (
    // Previous results stay visible (dimmed) while the next page or search loads,
    // which avoids the list flashing empty on every keystroke.
    <ul className={`ticket-list ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} onStatusChange={onStatusChange} />
      ))}
    </ul>
  );
}
