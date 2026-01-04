# Budget Request Management - Backend

This is the backend API for the Budget Request Management System built with Express.js and Prisma.

## Tech Stack

- Express.js 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (caching & rate limiting)
- JWT Authentication
- Node-cron (scheduled jobs)
- Winston (logging)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- Redis (optional, for caching)

### Installation

```bash
pnpm install
```

### Database Setup

1. Copy `.env.example` to `.env` and configure your database connection:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/budget_db
```

2. Run Prisma migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### Development

```bash
pnpm dev
```

The API will run on [http://localhost:4005](http://localhost:4005).

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## API Endpoints

- Health: `GET /api/health`
- Budget Requests: `/api/budget-requests/*`
- (Add other endpoints as needed)

## Deployment

This backend is configured for deployment on Railway.

### Environment Variables

Ensure all required environment variables are set in your Railway deployment:
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_HOST` (if using Redis)
- Other variables from `.env.example`
