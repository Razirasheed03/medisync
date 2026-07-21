# API Documentation

**Base URL:** `/api/v1`

Authenticated requests send the access token in the header; the refresh token
travels automatically in an httpOnly cookie (`refreshToken`) when the client
uses `credentials: include`.

```http
Authorization: Bearer <accessToken>
```

---

## API Standards

- Every response uses a consistent envelope (below); `data` is `null` on error.
- JSON everywhere; dates are `YYYY-MM-DD`, times are 24-hour `HH:mm`.
- Validation errors return `422` with `data.issues: [{ path, message }]`.
- Sensitive fields (password hashes, refresh tokens) are never returned.

**Success**

```json
{ "success": true, "message": "…", "data": {}, "meta": {} }
```

**Error**

```json
{ "success": false, "message": "…", "data": null, "meta": {} }
```

### Common HTTP status codes

| Code | Meaning                                             |
| ---- | --------------------------------------------------- |
| 200  | OK                                                  |
| 201  | Created                                             |
| 401  | Missing / invalid / expired token                   |
| 403  | Authenticated but not permitted (RBAC / ownership)  |
| 404  | Resource not found                                  |
| 409  | Conflict (slot already booked)                      |
| 422  | Validation failed / illegal status transition       |

### Role-Based Access Control

All endpoints require a valid JWT unless marked **Public**. Three roles:

| Role           | Scope                                                        |
| -------------- | ------------------------------------------------------------ |
| `SUPER_ADMIN`  | Full access: users, schedules, all appointments, audit logs. |
| `RECEPTIONIST` | Patients, booking, updates, arrivals, all schedules (to book).|
| `DOCTOR`       | Read-only to own appointments/schedule; consultation notes.  |

---

## Auth

| Method | Path            | Auth   | Description                    |
| ------ | --------------- | ------ | ------------------------------ |
| POST   | `/auth/login`   | Public | Login; sets refresh cookie     |
| POST   | `/auth/refresh` | Cookie | Rotate access + refresh tokens |
| POST   | `/auth/logout`  | Cookie | Invalidate refresh token       |

```jsonc
// POST /auth/login
{ "email": "superadmin@medisync.test", "password": "…" }
// → data: { accessToken, user: { id, name, email, role } }
```

---

## Users — `SUPER_ADMIN`

| Method | Path                  | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/users`              | List (`search`, `role`, `status`, `page`, `limit`) |
| POST   | `/users`              | Create doctor / receptionist             |
| GET    | `/users/:id`          | Get one                                  |
| PATCH  | `/users/:id`          | Update                                   |
| PATCH  | `/users/:id/password` | Reset password                           |
| DELETE | `/users/:id`          | Soft-deactivate                          |

> `department` is required when creating a `DOCTOR`.

---

## Doctors & Departments

| Method | Path                       | Auth | Description                       |
| ------ | -------------------------- | ---- | --------------------------------- |
| GET    | `/departments`             | JWT  | List department enums             |
| GET    | `/doctors?department=`     | JWT  | List active doctors               |
| GET    | `/doctors/:doctorId/slots` | JWT  | Slot grid (`?date=&duration=`)    |

Slot item: `{ startTime, endTime, isBooked }`.

### Dynamic Slot Generation

Slots are generated from the doctor's active schedule for the requested date:
each session is split into fixed `slotDuration` intervals, break windows are
excluded, and past slots are omitted for the current day. `duration` defaults
to the schedule's `slotDuration`.

---

## Doctor Schedules

| Method | Path                                 | Roles                    | Description            |
| ------ | ------------------------------------ | ------------------------ | ---------------------- |
| POST   | `/doctor-schedules`                  | SUPER_ADMIN              | Create (one per doctor)|
| GET    | `/doctor-schedules`                  | All roles (scoped)       | List                   |
| GET    | `/doctor-schedules/:doctorId`        | All roles (scoped)       | Get one                |
| PUT    | `/doctor-schedules/:doctorId`        | SUPER_ADMIN              | Replace days / duration|
| PATCH  | `/doctor-schedules/:doctorId/status` | SUPER_ADMIN              | Activate / deactivate  |

**Read access (scoping):**

| Role           | Visible schedules                                  |
| -------------- | -------------------------------------------------- |
| `SUPER_ADMIN`  | All schedules                                      |
| `RECEPTIONIST` | All schedules (required to book any doctor)        |
| `DOCTOR`       | Own schedule only; another doctor's returns `403`  |

```jsonc
// POST /doctor-schedules  (creating a second schedule for a doctor → 409)
{
  "doctorId": "…",
  "slotDuration": 30,
  "isActive": true,
  "workingDays": [
    {
      "day": "MONDAY",
      "sessions": [
        { "startTime": "09:00", "endTime": "13:00",
          "breakStartTime": "11:00", "breakEndTime": "11:15" }
      ]
    }
  ]
}
```

---

## Patients

| Method | Path            | Roles                     | Description                   |
| ------ | --------------- | ------------------------- | ----------------------------- |
| GET    | `/patients`     | SUPER_ADMIN, RECEPTIONIST | Search by code / name / phone |
| POST   | `/patients`     | SUPER_ADMIN, RECEPTIONIST | Create                        |
| GET    | `/patients/:id` | All roles                 | Get one (doctors view info)   |

Query: `?search=&page=&limit=`

---

## Appointments

| Method | Path                       | Roles                     | Description                 |
| ------ | -------------------------- | ------------------------- | --------------------------- |
| POST   | `/appointments`            | SUPER_ADMIN, RECEPTIONIST | Book                        |
| GET    | `/appointments`            | All roles                 | List (doctors see own only) |
| GET    | `/appointments/:id`        | All roles                 | Get one                     |
| PATCH  | `/appointments/:id`        | All roles¹                | Update                      |
| PATCH  | `/appointments/:id/arrive` | SUPER_ADMIN, RECEPTIONIST | Mark patient arrived        |
| PATCH  | `/appointments/:id/cancel` | SUPER_ADMIN, RECEPTIONIST | Cancel                      |

> ¹ Doctors may update only their **own** appointments, limited to `notes` and
> completing them — and only once status is `ARRIVED`.

```jsonc
// POST /appointments — existing patient
{ "patientId": "…", "doctorId": "…", "appointmentDate": "2026-07-22",
  "startTime": "09:00", "endTime": "09:30", "purpose": "Follow-up" }

// POST /appointments — new patient (auto-created)
{ "patientName": "Jane Doe", "patientPhone": "+91 98765 43210",
  "doctorId": "…", "appointmentDate": "2026-07-22",
  "startTime": "09:00", "endTime": "09:30" }
```

**List query params**

| Param                  | Description                            |
| ---------------------- | -------------------------------------- |
| `search`               | Patient name or mobile                 |
| `doctorId`, `department` | Filter by doctor / department        |
| `date`                 | Exact date                             |
| `dateFrom`, `dateTo`   | Date range (`YYYY-MM-DD`)              |
| `status`               | `BOOKED` \| `ARRIVED` \| `COMPLETED` \| `CANCELLED` |
| `page`, `limit`        | Page (default 1), size ≤ 100 (default 20) |
| `sortOrder`            | `asc` \| `desc` (by date)              |

### Appointment Status Workflow

```
BOOKED → ARRIVED → COMPLETED
   └──────┴──────→ CANCELLED
```

`COMPLETED` is terminal; `CANCELLED` may be re-booked. Illegal transitions
return `422`. Notes are recorded by the doctor only in the `ARRIVED` state.

### Concurrency

Double booking is prevented at the database layer: a partial unique index on
`(doctor, date, slot)` for slot-holding statuses. Simultaneous requests for the
same slot yield exactly one `201`; the rest receive `409`.

### Pagination

List endpoints filter, sort, and paginate server-side and return
`meta.pagination: { page, limit, total, totalPages }`.

---

## Dashboards & Profile

| Method | Path                   | Role         |
| ------ | ---------------------- | ------------ |
| GET    | `/admin/dashboard`     | SUPER_ADMIN  |
| GET    | `/reception/dashboard` | RECEPTIONIST |
| GET    | `/doctor/dashboard`    | DOCTOR       |
| GET    | `/profile`             | All roles    |

---

## Audit Logs — `SUPER_ADMIN`

| Method | Path          | Description             |
| ------ | ------------- | ----------------------- |
| GET    | `/audit-logs` | `?action=&page=&limit=` |

Each entry records user, role, action, entity, and timestamp. Actions:
`LOGIN`, `APPOINTMENT_CREATED`, `APPOINTMENT_UPDATED`, `APPOINTMENT_CANCELLED`.

---

## Real-Time Updates (Socket.IO)

Connect to the API origin and pass the access token in the handshake;
unauthenticated connections are rejected. Every appointment mutation broadcasts
to all connected clients so schedulers update live.

```js
io(origin, { auth: { token: accessToken } })
```

| Event                   | Payload            |
| ----------------------- | ------------------ |
| `appointment:created`   | Appointment object |
| `appointment:updated`   | Appointment object |
| `appointment:cancelled` | Appointment object |

---

## Health

| Method | Path      | Auth   |
| ------ | --------- | ------ |
| GET    | `/health` | Public |
