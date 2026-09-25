# Decisions

## The last slot of the day
Business hours mean a visit has to finish by 17:00, not just start before it. So I generate slots per duration: a 30-minute visit can start as late as 16:30, a 60-minute visit as late as 16:00. That lives in `lib/domain/schedule.ts` (`checkSlot`, `slotStartsForDate`), and the same rule runs inside the shared Zod schema, so the form and the API can't disagree about it.

## Whose 9:00?
The clinic is in New York, so `America/New_York` is the source of truth for the weekday check, the opening hours and the slot grid. I store `startsAt` as UTC and convert only at the edges. The picker and the confirmation show clinic time as the primary value and the viewer's own zone as a secondary hint, so a patient in Lagos sees something like `9:00 AM EDT (2:00 PM WAT)`. The math is in `lib/domain/schedule.ts` and the hint is `formatInTimeZone` in `lib/format.ts`.

## A stale draft
When a saved draft comes back I re-validate it instead of trusting it. If the chosen time is now in the past I clear the time and say why; if the provider is gone I clear the provider; everything else the patient typed is kept. I never submit a stale draft automatically — they have to pick a valid slot and press confirm. The draft is `lib/stores/booking-draft.ts` and it's restored in `components/booking/booking-wizard.tsx`.

## Did it save?
The client makes one idempotency key per booking attempt and keeps it with the draft, then sends it on the POST. The store maps key to appointment id, so a retry after a misleading 500 returns the appointment that already exists instead of creating a second one. The submit button is also disabled while the request is in flight. The key is read in `booking-wizard.tsx`, and the server side is `createAppointment` in `lib/server/appointments.ts`.

## Two clicks, one appointment
Only one status change can be in flight at a time. While a mutation is pending the other actions are disabled, so "Check in" then "Cancel" can't both fire. If a request fails and the write didn't actually land, I re-read the appointment, roll the UI back and show a toast; that reconciliation is the `reconcile` helper in `components/appointments/appointment-detail.tsx`.

## Rows that move
With offset pagination a new earlier booking really does shift the rows on page 3, and I chose not to hide that. The server list is the source of truth and the URL pins the exact view, so the shift is correct rather than surprising. What I do control is how it feels: `keepPreviousData` keeps the current rows on screen while the next page loads, and I don't move the user's page out from under them (see `lib/queries/appointments.ts`).

## Search and the back button
If every keystroke pushed a history entry, Back would undo the search one character at a time, which is useless. So the debounced search writes the URL with `history: "replace"`, while filters, sort and page changes `push`. Back then returns to the previous meaningful view — the last filter or page — rather than every intermediate query. That split is in `components/appointments/use-appointments-params.ts`.

## The deployed store
The API is in-memory and the app is deployed on Vercel. That's the one place the mock's shape leaks: Vercel can run more than one serverless instance, so in principle a write on one instance might not be visible on another. In practice the seed is deterministic and a single warm instance covers the traffic this exercise sees, so the booking-to-desk flow works on the live site. I accepted that tradeoff because the brief allows the data to reset, but I'll call it out plainly: if that flow ever looks inconsistent on the live site, this is why, and the fix is to put a hosted KV store behind the same interface (`lib/server/store.ts`).

## Push back
I'd challenge "conflict only at submit." Making a patient fill four steps and only then find out the slot is gone is a poor experience when the API already has what it needs to prevent it. I'd promote the available-slots endpoint (currently a bonus item) into the core so the picker only offers free times, and keep 409 as the race-condition guard rather than the main way conflicts are discovered.

## Other calls

### Making the table work on a phone
Horizontal scroll with the first column pinned, rather than a card layout. The desk's whole job is comparing rows against each other, and cards make that harder the moment you're scanning a schedule, so keeping the real columns intact is worth the sideways scroll. Pinning the patient column means you always know which row you're looking at, and it's far less new UI to maintain than two separate layouts. It's the `overflow-x-auto` wrapper with a `sticky left-0` patient cell in `components/appointments/appointments-table.tsx`.

### Conflict detection is overlap, not just a matching start time
The brief says 409 when the provider is already booked "at that start time," but I check for any overlap between the two visits. A 60-minute visit at 10:00 and a 30-minute one at 10:30 share no start time, yet the provider can't do both, so the stricter check is the correct one. It lives in `findConflict` in `lib/server/appointments.ts`, and the same rules are in the shared schema so the form catches it too.

### Fetching on the client, not on the server
I let TanStack Query fetch rather than prefetching on the server, because every table view is defined by URL state (page, filters, sort) that changes constantly after load. A server prefetch would only cover the first default view and then hand off to the client anyway, so it buys nothing for the work it adds. The query keys are derived from the URL, so the cache and invalidation line up with what the user is actually looking at (`lib/queries/`). Server-prefetching just the first page stays a bonus.

### Sample data
The generated patients mix Nigerian and other names, written without tone marks. The brief leaves the data entirely open ("generate them however you like"), so I just picked a set that looks like the people who'd walk into this clinic. Everything the brief does pin — clinic timezone, US phone format, insurers — stays exactly as specified (`lib/server/store.ts`).

### A patient can hold two overlapping bookings with different providers
Appointments are checked against the chosen provider's schedule, not the patient's, so nothing stops the same person booking two providers at the same time. I treated that as out of scope for a mock clinic and didn't invent a rule the brief doesn't ask for. If it mattered, the check would move into `createAppointment` and reject on a patient-level overlap.
