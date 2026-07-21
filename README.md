# MediSync

Enterprise EMR Appointment Management System for clinics. Supports role-based
access for Super Admins, Receptionists, and Doctors with dynamic slot
generation, concurrent-safe booking, audit logging, and real-time updates.

## Stack

| Layer    | Technologies                                                                 |
| -------- | ---------------------------------------------------------------------------- |
| Backend  | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Socket.IO, Zod, Pino   |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form + Zod, Socket.IO Client |

## Features

- JWT access + refresh authentication with bcrypt password hashing
- RBAC for `SUPER_ADMIN`, `RECEPTIONIST`, and `DOCTOR`
- Doctor schedule management (working days, sessions, breaks, slot duration)
- Dynamic slot generation that never overlaps breaks or booked appointments
- Patient search / registration and appointment booking
- Appointment lifecycle: Booked → Arrived → Completed / Cancelled
- Server-side filtering, sorting, and pagination
- Audit trail for login and appointment create / update / cancel
- Real-time appointment updates over Socket.IO
- Role-specific dashboards

## Architecture overview

- **Backend** — layered Express API: `routes` → `middlewares` (JWT, RBAC,
  Zod validation) → `controllers` (thin HTTP adapters) → `services` (all
  business logic) → Mongoose `models`. Responses use a shared envelope and a
  centralized error handler.
- **Frontend** — feature-based React SPA. Each feature owns its types,
  services, hooks, and components. Axios centralizes auth and token refresh;
  TanStack Query handles server state; React Hook Form + Zod handle forms.
- **Real-time** — the API broadcasts appointment events over Socket.IO;
  clients invalidate the relevant queries to update live.

Design rationale is documented in [ENGINEERING_DECISIONS.md](ENGINEERING_DECISIONS.md).

## Project structure

```text
Medisync/
├── Backend/                 # Express API
│   └── src/
│       ├── config/          # Env + database
│       ├── constants/
│       ├── controllers/     # Thin HTTP adapters
│       ├── lib/             # Logger, Socket.IO
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── scripts/         # Seed super admin
│       ├── services/        # Business logic
│       ├── types/
│       ├── utils/
│       └── validators/
├── Frontend/                # React SPA
│   └── src/
│       ├── api/             # Axios client
│       ├── components/
│       ├── features/        # appointments, auth, dashboard, patients, schedules, users
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── providers/
│       ├── routes/
│       └── store/
├── docs/
│   ├── API.md
│   └── DATABASE.md
├── ENGINEERING_DECISIONS.md
└── README.md
```

## Database design

MongoDB with Mongoose. Core collections: `users`, `patients`,
`doctorschedules`, `appointments`, `auditlogs`, and a `counters` helper for
sequential patient codes. Collections, relationships, indexes, and the query
optimization strategy are detailed in [docs/DATABASE.md](docs/DATABASE.md).

## Prerequisites

- Node.js 20+
- MongoDB 6+ running locally (or a reachable connection string)

## Backend setup

```bash
cd Backend
cp .env.example .env
# Edit MONGODB_URI and JWT secrets if needed
npm install
npm run seed          # creates superadmin@medisync.test
npm run dev           # http://localhost:3000
```

### Seed credentials

| Field    | Value                      |
| -------- | -------------------------- |
| Email    | `superadmin@medisync.test` |
| Password | `MediSync@Test2026!`       |
| Role     | `SUPER_ADMIN`              |

Override with `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`, and
`SEED_SUPER_ADMIN_NAME`.

### Backend scripts

| Script            | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start with hot reload      |
| `npm run build`   | Compile TypeScript         |
| `npm start`       | Run compiled output        |
| `npm run typecheck` | Type-check without emit  |
| `npm run seed`    | Seed / reset super admin   |

## Frontend setup

```bash
cd Frontend
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3000/api/v1
npm install
npm run dev           # http://localhost:5173
```

### Frontend scripts

| Script          | Description             |
| --------------- | ----------------------- |
| `npm run dev`   | Vite development server |
| `npm run build` | Type-check + production build |
| `npm run lint`  | Oxlint                  |
| `npm run preview` | Preview production build |

## Running the project

Start MongoDB, then run the backend and frontend in separate terminals:

```bash
# Terminal 1 — API on http://localhost:3000
cd Backend && npm run dev

# Terminal 2 — SPA on http://localhost:5173
cd Frontend && npm run dev
```

Open http://localhost:5173 and sign in with the seed credentials above.

## Environment variables

Copy each `.env.example` to `.env` before running. Full endpoint details live
in [docs/API.md](docs/API.md).

**Backend** (`Backend/.env`)

| Variable                    | Description                                   |
| --------------------------- | --------------------------------------------- |
| `NODE_ENV`                  | `development` \| `production` \| `test`       |
| `PORT`                      | API port (default `3000`)                     |
| `MONGODB_URI`               | MongoDB connection string                     |
| `CORS_ORIGIN`               | Allowed origin(s), comma-separated; include the frontend URL (e.g. `http://localhost:5173`) |
| `LOG_LEVEL`                 | Pino log level                                |
| `ACCESS_TOKEN_SECRET`       | JWT access secret (≥ 32 chars)                |
| `ACCESS_TOKEN_TTL_SECONDS`  | Access token lifetime (default `900`)         |
| `REFRESH_TOKEN_SECRET`      | JWT refresh secret (≥ 32 chars, distinct)     |
| `REFRESH_TOKEN_TTL_SECONDS` | Refresh token lifetime (default `604800`)     |
| `BCRYPT_SALT_ROUNDS`        | bcrypt cost factor (default `12`)             |

**Frontend** (`Frontend/.env`)

| Variable            | Description                                  |
| ------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL` | API base URL (e.g. `http://localhost:3000/api/v1`) |
| `VITE_APP_NAME`     | Display name                                 |

## Roles & capabilities

| Capability                    | SUPER_ADMIN | RECEPTIONIST | DOCTOR |
| ----------------------------- | ----------- | ------------ | ------ |
| Manage doctors / receptionists| ✓           |              |        |
| Manage doctor schedules       | ✓           |              |        |
| View all dashboards / audits  | ✓           |              |        |
| Search / create patients      | ✓           | ✓            | view   |
| Book / update / cancel appts  | ✓           | ✓            |        |
| Mark patient arrived          | ✓           | ✓            |        |
| View appointments             | all         | all          | own    |
| Update consultation notes     |             |              | ✓      |

## Assumptions made

- Each doctor has one schedule; a doctor belongs to a single department.
- Patients are shared clinic-wide; a new patient is auto-created at booking
  when no existing record is selected.
- Consultation notes are recorded by the doctor only after the patient is
  marked as arrived.
- Refresh tokens are stored in an httpOnly cookie and rotated on each refresh.

## Known limitations

- No email/SMS notifications or password-reset flow.
- Concurrency is enforced per slot via a unique index (no distributed locks).
- Audit logs are read-only and cover login and appointment lifecycle events.
- Slot times are stored and compared in the server's local timezone.

## Future improvements

- Multi-schedule / recurring availability and per-department rooms.
- Rate limiting, refresh-token blocklist, and richer audit coverage.
- Automated test suite and CI, plus Docker Compose for one-command startup.

## Documentation

- [API documentation](docs/API.md)
- [Database schema](docs/DATABASE.md)
- [Engineering decisions](ENGINEERING_DECISIONS.md)

## Health check

```bash
curl http://localhost:3000/api/v1/health
```
