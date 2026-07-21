# Database Schema

MongoDB collections used by MediSync.

## Entity relationship diagram

```text
┌────────────┐       1     ┌──────────────────┐
│   User     │────────────<│  DoctorSchedule  │
│            │             │  (doctorId uniq) │
│ role:      │             └──────────────────┘
│ SUPER_ADMIN│
│ RECEPTIONIST│
│ DOCTOR     │ 1
│ department?│──────┐
└─────┬──────┘      │
      │             │
      │ writes      │ doctor
      ▼             ▼
┌────────────┐  ┌────────────────┐      ┌────────────┐
│  AuditLog  │  │  Appointment   │─────>│  Patient   │
│            │  │                │ N  1 │            │
│ action     │  │ status         │      │ patientCode│
│ entityType │  │ department     │      │ name/phone │
└────────────┘  │ purpose/notes  │      └────────────┘
                └────────────────┘

┌────────────┐
│  Counter   │  ← atomic sequences (patientCode)
└────────────┘
```

## Collections

### `users`

| Field          | Type     | Notes                                      |
| -------------- | -------- | ------------------------------------------ |
| name           | string   | Required                                   |
| email          | string   | Unique, lowercase                          |
| password       | string   | bcrypt hashed, `select: false`             |
| role           | enum     | `SUPER_ADMIN` \| `RECEPTIONIST` \| `DOCTOR`|
| status         | enum     | `ACTIVE` \| `INACTIVE`                     |
| department     | enum?    | Required for doctors at create time        |
| refreshToken   | string?  | SHA-256 of refresh JWT, `select: false`    |
| createdAt / updatedAt | date | timestamps                          |

**Indexes:** `email` (unique), `status`

### `doctorschedules`

| Field          | Type     | Notes                                      |
| -------------- | -------- | ------------------------------------------ |
| doctorId       | ObjectId | Unique, ref `User`, immutable              |
| workingDays[]  | object   | `{ day, sessions[] }`                      |
| sessions[]     | object   | `{ startTime, endTime, breakStart?, breakEnd? }` |
| slotDuration   | number   | Minutes, integer > 0                       |
| isActive       | boolean  | Default `true`                             |

**Indexes:** `doctorId` (unique), `isActive`

### `patients`

| Field          | Type     | Notes                                      |
| -------------- | -------- | ------------------------------------------ |
| patientCode    | string   | Unique, e.g. `PAT-000042`                  |
| name           | string   | Indexed                                    |
| phone          | string   | Indexed                                    |
| email          | string?  | Optional                                   |

**Indexes:** `patientCode` (unique), `name`, `phone`

### `appointments`

| Field            | Type     | Notes                                      |
| ---------------- | -------- | ------------------------------------------ |
| patient          | ObjectId | Ref `Patient`                              |
| patientName      | string   | Denormalized for list/search               |
| patientEmail     | string?  | Denormalized                               |
| patientPhone     | string   | Denormalized, indexed                      |
| doctor           | ObjectId | Ref `User`                                 |
| department       | enum     | Snapshot of doctor's department            |
| appointmentDate  | string   | `YYYY-MM-DD`                               |
| startTime        | string   | `HH:mm`                                    |
| endTime          | string   | `HH:mm`                                    |
| status           | enum     | `BOOKED` \| `ARRIVED` \| `COMPLETED` \| `CANCELLED` |
| purpose          | string?  | Optional                                   |
| notes            | string?  | Consultation notes                         |

**Indexes:**

- `doctor`, `appointmentDate`, `status`, `department`
- `patient`, `patientName`, `patientPhone`
- compound `{ appointmentDate, startTime, endTime }`
- **unique partial** `unique_active_doctor_slot` on
  `{ doctor, appointmentDate, startTime, endTime }` where
  `status ∈ {BOOKED, ARRIVED, COMPLETED}` — prevents double booking

### `auditlogs`

| Field        | Type     | Notes                                       |
| ------------ | -------- | ------------------------------------------- |
| user         | ObjectId | Actor                                       |
| userName     | string   | Display name snapshot                       |
| role         | enum     | Actor role                                  |
| action       | enum     | `LOGIN` \| `APPOINTMENT_*`                  |
| entityType   | enum     | `User` \| `Appointment`                     |
| entityId     | ObjectId?| Optional                                    |
| metadata     | mixed?   | Optional context                            |
| createdAt    | date     | Indexed descending                          |

### `counters`

| Field     | Type   | Notes                                  |
| --------- | ------ | -------------------------------------- |
| `_id`     | string | Sequence name (`patientCode`)          |
| sequence  | number | Atomically incremented                 |

## Status workflow

```text
BOOKED ──► ARRIVED ──► COMPLETED
   │          │
   └──────────┴──► CANCELLED
CANCELLED ──► BOOKED
```
