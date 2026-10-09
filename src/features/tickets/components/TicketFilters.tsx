import { STATUS_LABELS, TICKET_STATUSES, type TicketStatus } from '../ticket.types';

interface TicketFiltersProps {
  status: TicketStatus | '';
  search: string;
  onStatusChange: (status: TicketStatus | '') => void;
  onSearchChange: (search: string) => void;
}

export function TicketFilters({ status, search, onStatusChange, onSearchChange }: TicketFiltersProps) {
  return (
    <div className="filters">
      <input
        type="search"
        placeholder="Search by title…"
        aria-label="Search by title"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
      >
        <option value="">All statuses</option>
        {TICKET_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
