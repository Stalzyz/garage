# Grekam OS - Enterprise Collaboration Hub

Welcome to Grekam OS! This repository contains the source code for a massive, all-encompassing enterprise operating system tailored to creative agencies and service-based businesses.

## Overview
Grekam OS was built to replace an entire stack of SaaS tools (Monday, Notion, Zoho, Slack, Stripe). It consolidates Sales, Operations, HR, Education, and Finance under one flawlessly designed, premium glassmorphic interface.

### Key Modules
1. **Sales & CRM (`/dashboard/crm`)**: Manage Leads, Contacts, and an Interactive Proposal Builder that generates secure, public-facing proposal links (`/verify/proposal/[token]`) for clients to review and sign via HTML5 Canvas.
2. **Operations & Projects (`/dashboard/projects`)**: A central hub to manage client projects, task pipelines, and internal briefs.
3. **HR & Performance (`/dashboard/hr`)**: 
   - **ATS Kanban:** Drag-and-drop recruitment pipeline for managing candidate interviews.
   - **Performance Hub:** 360-degree reviews with a visual Spider Web Skill Matrix.
   - **Time Tracker:** A live, radar-ping stopwatch and telemetry viewer to log remote employee productivity.
4. **Finance Engine (`/dashboard/finance`)**: An interactive Invoice Builder that generates HTML invoices. Clients receive a public secure link (`/verify/invoice/[token]`) to execute Stripe checkouts.
5. **Student LMS Academy (`/academy`)**: A completely whitelabeled, distraction-free cinematic video learning portal for students. Includes skill progression tracking and assignment submissions.
6. **Support Hub (`/dashboard/support`)**: A beautiful Kanban board for tracking support tickets, complete with an AI drafting assistant for replies.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, Framer Motion (Micro-animations).
- **Backend**: Fastify API Engine, Prisma ORM, Zod Validation.
- **Architecture**: TurboRepo (Monorepo architecture separating `apps/web` and `apps/api`).
- **Testing**: Playwright End-to-End tests (`apps/e2e`).

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database

### Installation
1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Set up environment variables by copying the example files in `apps/api` and `apps/web`.
3. Push the Prisma schema to your database:
   ```bash
   pnpm db:push
   ```
4. Start the development server (runs both frontend and backend):
   ```bash
   pnpm dev:all
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## End-to-End Testing
We use Playwright to ensure critical flows remain stable. To run the test suite:
```bash
pnpm test:e2e
```

## Contributing
Please refer to the `ARCHITECTURE.md` file for deep-dive technical details on how the TurboRepo monorepo routes requests and manages state.

---
*Built with ❤️ for Grekam Visuals.*
