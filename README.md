# Support Tickets UI

React UI for the Support Tickets API, built with React 19, TypeScript and Vite.

## Setup

Requirements: Node 20+, Docker. The API from the `BE` repo must be running on port 4000.

### Docker

```bash
docker compose up -d --build
```

- UI: `http://localhost:8080`
- Set `API_URL` to use a different API address. Default: `http://host.docker.internal:4000`.

### Local development

```bash
npm install
npm run dev
```

- UI: `http://localhost:5173`
- `/api` is proxied to `http://localhost:4000`.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the build |
| `npm run typecheck` | Type-check |

## Features

- Ticket list with loading, empty and error states.
- Status filter and debounced title search.
- Pagination.
- New ticket form with client-side validation and server error display.
- Status change from the list with optimistic update and rollback on failure.

## Project Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── pages/TicketsPage.tsx    filter state and layout
├── components/              TicketFilters, TicketList, TicketRow, NewTicketForm, Pagination
├── hooks/
│   ├── useTickets.ts        fetching, stale request handling, optimistic status update
│   └── useDebounce.ts
├── services/
│   ├── apiClient.ts         fetch wrapper, ApiError
│   └── ticketService.ts
├── types/ticket.ts          copied from the API
└── utils/validateTicket.ts
nginx/default.conf.template
```

## Decisions

- **Plain `fetch`** with a custom hook. No data-fetching library.
- **`useTickets`** depends on filter values, not the filters object, so it does not refetch on every render.
- **`AbortController`** cancels the previous request when filters change, so stale responses are ignored.
- **Optimistic status update.** The status changes immediately. On failure the previous ticket is restored and the row shows an error.
- **Search is debounced** by 300 ms. Changing a filter resets to page 1.
- **Previous results stay visible** while the next page or search loads.
- **Client validation** uses the same rules as the API. Server validation errors are shown per field.
- **Same-origin API calls.** Vite proxies `/api` in development and nginx proxies it in Docker, so the API needs no CORS.
- **No router, global state or UI library.** The app has one page.

## Trade-offs

- Types are copied from the API and must be kept in sync manually.
- Rapid status changes on the same ticket are not coordinated. A failed earlier request can roll back a later change.
- A ticket whose status changes stays in the list even if it no longer matches the status filter, until the next fetch.
- The list refetches after a ticket is created instead of inserting it locally.
- No tests for the UI.

## With More Time

- Tests for `useTickets` and the form (Vitest and React Testing Library).
- Shared types package with the API.
- Edit and delete tickets from the UI.
- Keep filters and page in the URL.
- Toast notifications for errors.
- Accessibility review.
