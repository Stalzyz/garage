# Grekam OS

Enterprise operating platform for **Grekam Visuals** (creative agency) + **Grekam Academy** (design school).

## Architecture

```
grekam-os/
├── apps/
│   ├── web/          # Next.js 14 — Frontend (App Router)
│   └── api/          # Node.js + Fastify — Backend API
├── packages/
│   ├── db/           # Prisma schema + migrations
│   ├── ui/           # Shared React component library
│   ├── types/        # Shared TypeScript types/interfaces
│   └── config/       # Shared ESLint, TypeScript, Tailwind configs
```

## Getting Started

### Prerequisites
- Node.js >= 22
- pnpm >= 11
- PostgreSQL (local or Neon)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start all apps in development
pnpm dev
```

### Individual Apps

```bash
# Web only
pnpm dev --filter=@grekam/web

# API only  
pnpm dev --filter=@grekam/api

# Prisma Studio
pnpm db:studio
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Fastify |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 + JWT + RBAC |
| File Storage | AWS S3 / Cloudflare R2 |
| Video | Cloudflare Stream / Mux |
| Payments | Razorpay |
| Email | Resend |
| WhatsApp | Grafty API |
| Queue | Bull + Redis |
| Hosting | Vercel (web) + Railway (api) + Neon (db) |

## Modules

| # | Module | Status |
|---|--------|--------|
| 01 | CRM | 🔨 Building |
| 02 | Project Management | 📋 Planned |
| 03 | Staff & HR | 📋 Planned |
| 04 | Finance & Accounting | 📋 Planned |
| 05 | Student Management | 📋 Planned |
| 06 | LMS | 📋 Planned |
| 07 | Mentor & Educator | 📋 Planned |
| 08 | Internship Bridge | 📋 Planned |
| 09 | Vendor Management | 📋 Planned |
| 10 | Marketing Hub | 📋 Planned |
| 11 | Analytics Dashboard | 📋 Planned |
| 12 | Notifications Hub | 📋 Planned |
