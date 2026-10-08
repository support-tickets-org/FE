import { useState } from 'react';
import { NewTicketForm } from '../components/NewTicketForm';
import { Pagination } from '../components/Pagination';
import { TicketFilters } from '../components/TicketFilters';
import { TicketList } from '../components/TicketList';
import { useDebounce } from '../hooks/useDebounce';
import { useTickets } from '../hooks/useTickets';
import type { TicketStatus } from '../types/ticket';

const PAGE_SIZE = 10;

export function TicketsPage() {
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const { tickets, total, loading, error, updateStatus, refetch } = useTickets({
    status: status || undefined,
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });

  // Changing a filter resets to page 1, otherwise the user could land on a page that no longer exists.
  const handleStatusChange = (value: TicketStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreated = () => {
    setPage(1);
    refetch();
  };

  return (
    <div className="layout">
      <aside>
        <NewTicketForm onCreated={handleCreated} />
      </aside>

      <section className="card">
        <TicketFilters
          status={status}
          search={search}
          onStatusChange={handleStatusChange}
          onSearchChange={handleSearchChange}
        />
        <TicketList
          tickets={tickets}
          loading={loading}
          error={error}
          onRetry={refetch}
          onStatusChange={updateStatus}
        />
        <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
      </section>
    </div>
  );
}
