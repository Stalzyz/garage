# Grekam OS - System Architecture

This document provides a deep dive into the technical architecture of Grekam OS.

## 1. Monorepo Structure (TurboRepo)

Grekam OS is built using a modern Monorepo structure powered by **TurboRepo**. This allows us to share code, configurations, and typing between the frontend and the backend effortlessly.

```text
grekam-os/
├── apps/
│   ├── web/        # Next.js Frontend App
│   ├── api/        # Fastify Backend Service
│   └── e2e/        # Playwright E2E Tests
├── packages/
│   ├── db/         # Prisma Schema & Database Client
│   ├── config/     # Shared ESLint/TS configs
│   └── ui/         # (Optional) Shared UI component library
└── turbo.json      # TurboRepo configuration
```

## 2. Frontend Application (`apps/web`)

The frontend is a **Next.js 14 App Router** application.

- **Routing:** All authenticated pages sit under the `/app/dashboard/` route group. Public-facing verification pages sit under `/app/verify/` to bypass internal layout and authentication middleware. The LMS Academy sits under `/app/academy/` to maintain a whitelabeled, distraction-free environment.
- **State Management:** The frontend uses a custom `useApi` hook (wrapping SWR or similar) to fetch data from the API layer. Transient UI states (like the Live Tracker stopwatch or UI toggles) use React's built-in `useState`.
- **Styling:** We use standard Tailwind CSS. The design language strictly adheres to a premium dark-mode aesthetic featuring glassmorphism (e.g. `bg-white/5 backdrop-blur-md border-white/10`), vibrant accent colors (Violet, Blue, Emerald), and smooth micro-animations.

## 3. Backend API Service (`apps/api`)

The backend is built with **Fastify**, chosen for its extreme performance and low overhead.

- **Architecture:** The API is structured modularly. Every major domain (CRM, HR, Finance, LMS) has its own directory with distinct `.router.ts` files (e.g., `src/hr/time.router.ts`).
- **Validation:** We use **Zod** alongside `fastify-type-provider-zod` to validate all incoming request bodies and query parameters natively at the route level.
- **Database Access:** The Fastify instance has Prisma attached to it via a decorator (`app.prisma`), allowing routes to directly interact with the database.

## 4. Database Layer (`packages/db`)

We use **Prisma ORM** connecting to a PostgreSQL database. 

The schema is incredibly extensive, supporting over 60 relational models across:
- **Core:** Users, Agencies, Audit Logs
- **CRM:** Leads, Proposals, Pipelines
- **HR:** Employees, TimeLogs, LeaveRequests, Candidates, PerformanceCycles
- **Finance:** Invoices, Expenses, Payroll
- **LMS:** Students, Courses, Modules, Submissions

## 5. Security & Public Links

To allow external clients to interact with the system securely without needing user accounts, we employ a "Public Token" strategy.
- When an Invoice or Proposal is created, a unique `publicToken` is generated.
- The external URL looks like: `https://grekam.com/verify/proposal/[token]`.
- The frontend calls a public API route (`GET /api/v1/crm/proposals/verify/:token`) which bypasses the standard JWT authentication layer to serve read-only (or localized write, like E-Signature) access.

## 6. Real-time & Automations (Future Scope)

While currently functioning via REST API polling, the architecture is designed to support WebSockets for real-time Team Chat and workflow automations (via webhooks).
