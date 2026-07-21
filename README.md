# MediSync

Enterprise EMR Appointment Management System.

## Backend foundation

The backend lives in `Backend/` and uses Node.js, Express, TypeScript, MongoDB,
and Mongoose. It is intentionally limited to infrastructure and a health
endpoint; business modules will be added in later implementation phases.

### Folder structure

```text
Backend/src/
├── config/       # Validated environment and database configuration
├── controllers/  # HTTP request/response adapters
├── services/     # Application and business logic
├── routes/       # Endpoint declarations
├── models/       # Mongoose schemas and models
├── middlewares/  # Cross-cutting Express middleware
├── validators/   # Reusable request validation
├── utils/        # Framework-independent helpers
├── constants/    # Shared immutable values
├── lib/          # Configured third-party integrations
├── types/        # Shared TypeScript declarations
├── app.ts        # Express application composition
└── server.ts     # Database connection and process lifecycle
```

The request flow is `Routes → Controllers → Services → Models`. Cross-cutting
concerns remain in middleware, while startup and shutdown are isolated in
`server.ts`, allowing the Express app to be imported independently.

### Local setup

1. Install dependencies: `cd Backend && npm install`
2. Copy `.env.example` to `.env` and update `MONGODB_URI`.
3. Start MongoDB.
4. Run the development server: `npm run dev`

Build and run production output with `npm run build` and `npm start`.
The health endpoint is available at `GET /api/v1/health`.

## Frontend foundation

The frontend lives in `Frontend/` and uses React, TypeScript, Vite,
Tailwind CSS, React Router, Axios, TanStack Query, and React Hook Form.
It is intentionally limited to the application shell, routing, and shared
infrastructure; business features will be added in later phases.

### Folder structure

```text
Frontend/src/
├── api/          # Centralized Axios client and API helpers
├── assets/       # Static assets
├── components/
│   ├── common/   # ErrorBoundary, LoadingScreen
│   ├── layout/   # Sidebar, TopNav, navigation config
│   └── ui/       # Reusable primitives (Button, Card, PageHeader, EmptyState)
├── features/     # Feature modules (auth, dashboard, doctor, appointment, schedule)
├── hooks/        # Shared React hooks
├── layouts/      # AppLayout (shell) and AuthLayout
├── lib/          # env access, query client, storage
├── pages/        # Route-level placeholder pages
├── providers/    # Global provider composition
├── routes/       # Router, route paths, Protected/Public guards
├── services/     # Shared application services
├── store/        # Client state (reserved)
├── styles/       # Tailwind entry point and theme
├── types/        # Shared TypeScript declarations
└── utils/        # Framework-independent helpers
```

### Local setup

1. Install dependencies: `cd Frontend && npm install`
2. Copy `.env.example` to `.env` and update `VITE_API_BASE_URL` if needed.
3. Run the development server: `npm run dev` (http://localhost:5173)

Build production output with `npm run build` and preview it with
`npm run preview`. Routes are guarded client-side: unauthenticated users
are redirected to `/login`, and the login page currently offers a
placeholder session until the real authentication flow is implemented.
