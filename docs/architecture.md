# Backend Module Architecture

The backend is a modular monolith. Domain code lives in `backend/src/modules/<domain>/`; modules run inside one Express application and use the shared MongoDB connection. REST endpoints are versioned under `/api/v1`.

When a domain is implemented, its directory may use this convention:

```text
backend/src/modules/<domain>/
  <domain>.routes.ts
  <domain>.controller.ts
  <domain>.service.ts
  <domain>.repository.ts
  <domain>.model.ts
  <domain>.validation.ts
  <domain>.types.ts
```

These files are a future convention; they are not created in the placeholder modules yet.

## Layer responsibilities

- **Routes** define HTTP routes, attach applicable middleware, and pass requests to controllers.
- **Controllers** read validated request data, call services, and return HTTP responses. Keep them thin.
- **Services** contain business rules, cross-entity validation, and workflow coordination.
- **Repositories** contain persistence and query logic. They communicate with Mongoose models so controllers and services do not issue database queries directly.
- **Models** define Mongoose schemas and models when domain persistence is implemented.
- **Validation** contains Zod schemas for external request input. Validate at the API boundary before business logic runs.
- **Types** contain TypeScript types specific to the domain module.

The usual dependency direction is:

```text
Route → Controller → Service → Repository → Model → MongoDB
```

Validation runs at the API boundary. Business rules primarily belong in services. Controllers must not call AWS S3, Resend, Google Places, or other providers directly; provider access belongs behind integration adapters and application services.

Private wedding-owned data must be scoped to the authorized wedding. The wedding is the tenant boundary; request input alone must not select an arbitrary tenant.
