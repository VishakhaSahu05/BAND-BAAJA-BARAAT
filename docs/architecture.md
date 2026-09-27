# Architecture

This document describes the architecture already established for Band Baaja Baaraat. It does not introduce new architectural decisions; it records the conventions defined by the [README](../README.md), the PRD, the System Design document, the Database Design document, and the REST API Design document, all in `docs/`.

## System overview

```text
React + Vite frontend
        ↓
Express REST API (/api/v1)
        ↓
Zod validation
        ↓
Services
        ↓
Repositories
        ↓
Mongoose
        ↓
MongoDB Atlas
```

- **Frontend**: React, Vite, TypeScript.
- **Backend**: Node.js, Express.js, TypeScript, structured as a modular monolith (a single deployable service with domain modules kept separate internally, not a microservices split).
- **Database**: MongoDB Atlas via Mongoose.
- **API**: REST, versioned under `/api/v1`.
- **Validation**: Zod, applied to external input at the API boundary.
- **Authentication**: server-side sessions carried in HTTP-only, Secure, SameSite cookies. There is no JWT access/refresh token flow and no localStorage authentication token.
- **Tenant boundary**: the wedding. Private wedding-owned resources are isolated by the authenticated wedding membership (see [Wedding-scoped authorization](#wedding-scoped-authorization) below).

Third-party providers are integrated behind backend adapters, not called directly from domain code:

- **AWS S3** — photo/image storage, accessed through pre-signed URLs for browser uploads.
- **Resend** — email delivery.
- **Google Places API** — nearby vendor discovery.
- **YouTube** — livestream embedding via a stored YouTube URL (no dedicated streaming infrastructure).

## Backend module convention

Each backend domain lives under its own directory:

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

Responsibility of each layer:

| File | Responsibility |
| --- | --- |
| `<domain>.routes.ts` | Defines HTTP endpoints for the domain and wires them to controller functions. No business logic or persistence code. |
| `<domain>.controller.ts` | Handles HTTP-level concerns: reading the request, invoking validation, calling the service layer, and shaping the HTTP response. No direct database queries and no business rules. |
| `<domain>.service.ts` | Contains business rules and orchestrates the domain's behavior, including enforcing wedding-scoped access. Calls repositories rather than Mongoose models directly. |
| `<domain>.repository.ts` | Handles persistence and query logic against MongoDB through Mongoose models. This is the only layer that should contain database queries. |
| `<domain>.model.ts` | Defines the Mongoose schema(s) and model(s) for the domain. |
| `<domain>.validation.ts` | Defines Zod schemas that validate external input (request bodies, params, query strings) for the domain. |
| `<domain>.types.ts` | Defines shared TypeScript types for the domain that don't belong in the schema or validation files. |

Not every module necessarily needs every file on day one (for example, a module with no persisted data may have no `.model.ts`), but when a layer's concern exists for a domain, its code belongs in the file for that layer, not folded into another one.

## Request flow

```text
Route → Controller → Service → Repository → Model → MongoDB
```

- **Routes** define HTTP endpoints and map them to controllers.
- **Controllers** handle HTTP-level concerns (parsing the request, invoking validation, calling the service, returning the response). They do not contain business rules or database queries.
- **Services** contain business rules and orchestration logic, including tenant-isolation checks. This is where domain decisions are made.
- **Repositories** handle persistence and query logic. This is the only layer that talks to Mongoose models directly.
- **Models** define Mongoose schemas and expose the collection to repositories.
- **Validation** (Zod) validates external input before it reaches the service layer.
- **Integrations** (S3, Resend, Google Places, YouTube) are accessed through the backend integration abstractions described below, not called directly from controllers or scattered through domain modules.

## Integration structure

```text
backend/src/integrations/
  s3/
  resend/
  google-places/
```

Provider-specific code (SDK calls, API keys, request/response shapes specific to a third party) stays behind these integration boundaries. Domain modules call an integration's exported interface rather than importing a provider SDK or making provider HTTP calls themselves. This keeps provider details out of business logic and makes providers easier to change or mock in tests.

## Wedding-scoped authorization

The wedding is the tenant boundary for this application. The following rules apply to all domain modules:

- Every private domain query must be wedding-scoped.
- Never trust a client-provided `weddingId` for authorization decisions.
- Wedding access must be derived from the authenticated user's session/membership, not from request input.
- Cross-entity references must belong to the same wedding (e.g. a task, guest, vendor, or expense must reference a wedding the acting user is a member of).

## Architectural rules

- Business rules belong in services, not route handlers or controllers.
- External input must be validated with Zod at the API boundary.
- Do not put MongoDB queries directly inside controllers; queries belong in repositories.
- Do not put provider-specific API calls directly inside controllers or services when an integration abstraction is appropriate; provider code belongs in `backend/src/integrations/`.
- Do not introduce microservices, GraphQL, Redis, Kafka, RabbitMQ, WebSockets, Kubernetes, or other infrastructure not specified by the current architecture.
- Do not introduce JWT authentication; the architecture uses server-side sessions carried in HTTP-only, Secure, SameSite cookies.

## Frontend structure

```text
frontend/src/
  app/         Application shell
  components/  Shared UI components
  features/    Feature areas
  layouts/     Page layouts
  pages/       Route-level pages
  services/    API and external service clients
  hooks/       Shared React hooks
  lib/         Shared client utilities
  types/       Shared client types
```

This is a high-level directory convention only. No further frontend conventions are established yet beyond this structure.

## Current status

- The project scaffold is complete: separate frontend and backend applications with their own tooling (ESLint, TypeScript, Vitest).
- The architecture foundation described in this document is in place structurally (module and integration directories exist as placeholders).
- Product and domain features are not implemented yet: there are no domain models, no authentication implementation, and no endpoints beyond `GET /api/v1/health`.
- This document describes the intended conventions for upcoming implementation work, so that future modules are built consistently.
