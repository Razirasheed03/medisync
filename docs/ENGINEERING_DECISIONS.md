# Engineering Decisions

Key design choices made while building MediSync, kept brief for reference.

## Architecture

- Backend stays layered: `Routes → Controllers → Services → Models`. Controllers are thin; business logic lives in services.
- Frontend is organized by feature (`appointments`, `patients`, `schedules`, `users`, `dashboard`, `auth`) on a shared Axios client, TanStack Query, and React Hook Form + Zod.

## Authentication

- Short-lived access JWTs in the response body; refresh tokens as httpOnly cookies, stored as SHA-256 hashes and rotated on every refresh.
- Logout clears the stored refresh hash so the cookie is dead.
- Passwords hashed with bcrypt in a Mongoose pre-save hook.

## RBAC

- Route-level `authorize(...roles)` middleware.
- Doctors are scoped to their own appointments and may only update notes / mark completed.
- Booking, cancel, and mark-arrived are limited to `SUPER_ADMIN` and `RECEPTIONIST`.

## Schedules & slots

- Schedules define working days, sessions, breaks, and a `slotDuration`.
- Slots are generated per request: breaks and past times excluded, overlapping sessions rejected at validation.
- The slots API returns each slot with an `isBooked` flag so the UI renders one grid.

## Patients & departments

- Patients are first-class docs with an auto-generated `PAT-######` code, searchable by code, name, and phone.
- Booking accepts an existing `patientId` or inline fields that auto-create a patient.
- Appointments snapshot the doctor's department at booking time so history stays stable.

## Concurrency (double-booking)

Two layers guard against overlaps:

1. A pre-insert overlap query (`startTime < end AND endTime > start`) for active statuses.
2. A partial unique index on `{ doctor, appointmentDate, startTime, endTime }` for `BOOKED / ARRIVED / COMPLETED`.

Races that beat the query fail on the unique index and return HTTP 409.

## Status workflow

```text
BOOKED ──► ARRIVED ──► COMPLETED
   │          │
   └──────────┴──► CANCELLED
CANCELLED ──► BOOKED   (re-book)
```

Invalid transitions are rejected in the service layer.

## Audit trail

- `AuditLog` captures login and appointment create/update/cancel with user, role, action, entity, and timestamp.
- Audit writes never block the business operation; failures are logged and swallowed.

## Real-time updates

- Socket.IO shares the Express HTTP server and reuses the JWT for handshake auth.
- Appointment changes emit `appointment:created|updated|cancelled`; the frontend invalidates the relevant query caches.

## API consistency

- Responses use one envelope: `{ success, message, data, meta }`, with Zod issues under `data.issues` on 422.
- Stack traces are only exposed outside production.

## Performance

- Compound and partial indexes on appointments, patients, users, and audit logs.
- Server-side pagination, sorting, and filtering on list endpoints.
- Frontend uses `keepPreviousData`, memoized lookups, and per-resource `staleTime`.

## Tooling & AI assistance

I leaned on AI coding tools to move faster and keep quality up, while keeping the design decisions my own:

- Used them to scaffold repetitive boilerplate (route/controller/service stubs, Zod schemas, query hooks) so I could spend time on the tricky parts.
- Used AI to pressure-test edge cases around slot generation, double-booking, and the status workflow, then wrote and verified the fixes myself.
- Treated generated code as a first draft: reviewed, refactored to match the existing patterns, and kept only what fit the codebase.

## Deliberately unchanged

- Folder layout, Axios client, auth store, cookie strategy, and response envelope.
- Docker left optional; local MongoDB + `.env` is enough to run.
