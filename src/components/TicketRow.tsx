import { useState } from 'react';
import { ApiError } from '../services/apiClient';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from '../types/ticket';

interface TicketRowProps {
  ticket: Ticket;
  onStatusChange: (id: number, status: TicketStatus) => Promise<void>;
}

export function TicketRow({ ticket, onStatusChange }: TicketRowProps) {
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (status: TicketStatus) => {
    setError(null);
    try {
      await onStatusChange(ticket.id, status);
    } catch (err) {
      const reason = err instanceof ApiError ? err.message : 'Unknown error';
      setError(`Couldn't update status: ${reason}`);
    }
  };

  return (
    <li className="ticket">
      <div className="ticket-main">
        <div className="ticket-header">
          <span className="ticket-title">{ticket.title}</span>
          <span className={`badge priority-${ticket.priority}`}>{PRIORITY_LABELS[ticket.priority]}</span>
        </div>
        {ticket.description && <p className="ticket-description">{ticket.description}</p>}
        <span className="ticket-meta">
          #{ticket.id} · {new Date(ticket.createdAt).toLocaleString()}
        </span>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <select
        className={`status-select status-${ticket.status}`}
        aria-label={`Status of ${ticket.title}`}
        value={ticket.status}
        onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
      >
        {TICKET_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </li>
  );
}
