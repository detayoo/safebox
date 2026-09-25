# Clinic Desk

Two sides over one data source. Patients book an appointment through a four-step
wizard at `/book`; front-desk staff search, filter and page through the schedule
at `/appointments`, then open an appointment to change its status or cancel it.
Both talk to a small mock API that lives in the same Next.js app.

## Running it locally

```
npm install
npm run dev
```

Then open http://localhost:3000 — the root redirects to `/appointments`. The
patient side is at `/book`.

Other scripts:

- `npm run build` — production build
- `npm run lint` — ESLint plus `tsc --noEmit` (this is the type check too)

The API seeds itself on first request with six providers and ~160 appointments,
so there's nothing to set up.

## Stack

- Next.js 16 (App Router), React 19, TypeScript with `strict: true`
- TanStack Query v5 for server state, TanStack Table v9 for the grid
- nuqs v2 for URL state, React Hook Form + Zod for the booking form
- Tailwind CSS v4 with shadcn/ui on Radix
- date-fns v4 with `@date-fns/tz`, Zustand for the booking draft and the failure toggle

## How it's laid out, and why

I grouped by concern rather than by file type, so a feature's parts sit together:

- `app/` — routes and the API. The route handlers are under `app/api/` because the
  brief wants the API in the same project. Pages stay server components and push
  interactivity down to client children.
- `components/ui/` — shadcn primitives (generated, not hand-edited).
- `components/common/` — the small shared pieces: empty state, error state, table
  skeleton, a detail row.
- `components/appointments/` — the desk side: table, columns, toolbar, the three
  filters, pagination, detail view, status actions, cancel dialog.
- `components/booking/` — the wizard and its four steps.
- `lib/domain/` — the rules both sides share: clinic schedule and timezone, and
  the status transition map.
- `lib/schemas/` — Zod schemas and the API envelope types. The create schema is
  used by both the form and the API, which is why the two validate identically.
- `lib/server/` — the in-memory store, the seed, and the list/create/update logic
  the route handlers call.
- `lib/api/` and `lib/queries/` — the typed fetch client and the TanStack Query
  options and mutations. Query keys live next to the query that owns them.
- `lib/stores/` — Zustand: the booking draft and the failure toggle.
- `hooks/` — the few shared hooks.

One thing worth calling out: all of the table's state (page, page size, search,
status, provider, date range, sort) lives in the URL through nuqs, and the query
key is built from it. The server does the paging, sorting and filtering, so the
table itself runs in manual mode — and its header sorting is driven from the URL
params rather than the table's own sorting state, because the server owns the
order.

## The API

- `GET /api/providers`
- `GET /api/appointments` — `page`, `pageSize`, `search`, `status` (repeatable or
  comma-separated), `providerId`, `from`, `to`, `sortBy`, `sortOrder`
- `GET /api/appointments/:id`
- `POST /api/appointments` — validates with the shared schema, 409 on a clash
- `PATCH /api/appointments/:id` — status changes, with a required reason to cancel

Every response uses one envelope. To make the loading and error states real, each
handler adds 300–900 ms of latency, and when the request carries
`x-simulate-failure: 1` about 30% of requests fail with a 500. There's a
"Simulate failures" switch in the header that sets that header, so the error paths
are testable on the live site. For writes, some of those injected failures happen
after the row is saved — the client sees a 500 for a change that actually landed,
which is what the idempotency key is for.

## Bonus items attempted

None yet. If I had another day I'd add them in this order: optimistic status
updates with rollback, a CSV export of the whole filtered view (not just the
visible page), bulk cancel across pages, an available-slots endpoint so the
picker only offers free times, then server-prefetching the first page of the
table.

## What's unfinished, and what I'd do next

- No automated tests. I'd add Vitest unit tests for the schemas and the status
  transitions first, then a single Playwright test for the full booking flow.
- The provider, date and time widgets in the wizard are verified by hand; there's
  no automated browser test for the final submit click.
- Conflict handling surfaces at submit. Shipping the available-slots endpoint
  would move that earlier (see the push-back note in DECISIONS.md).
- Column visibility/order controls and dark mode are not built.

## How long it took

Roughly 40 hours, most of it in the table's URL state and the booking wizard.

## Deployed at

https://safebox-sooty.vercel.app/
