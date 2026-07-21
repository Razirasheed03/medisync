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
