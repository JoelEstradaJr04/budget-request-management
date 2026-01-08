# Budget Request Management System

A full-stack budget request management application built as a monorepo with separate frontend and backend services.

## Architecture

This project follows a monorepo structure:

- **frontend/** - Next.js 15 application (deployed on Vercel)
- **backend/** - Express.js API server (deployed on Railway)

## Tech Stack

### Frontend
- Next.js 15.3
- React 19
- TypeScript
- Tailwind CSS
- Chart.js
- React Hook Form

### Backend
- Express.js 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL database

### Installation

Install all dependencies for both frontend and backend:

```bash
pnpm install:all
```

Or run the setup script which also initializes the database:

```bash
pnpm setup
```

### Development

Run both frontend and backend concurrently:

```bash
pnpm dev
```

Or run them separately:

```bash
# Terminal 1 - Frontend
pnpm dev:frontend

# Terminal 2 - Backend
pnpm dev:backend
```

The frontend will run on [http://localhost:3001](http://localhost:3001)  
The backend API will run on [http://localhost:4005](http://localhost:4005)

### Environment Variables

1. **Frontend**: Copy `frontend/.env.example` to `frontend/.env`
2. **Backend**: Copy `backend/.env.example` to `backend/.env`

Configure the variables according to your environment.

## Building

```bash
# Build frontend
pnpm build:frontend

# Build backend
pnpm build:backend

# Build both
pnpm build
```

## Deployment

### Frontend (Vercel)

**Vercel Configuration:**
1. **Framework Preset**: Select **Next.js**
2. **Root Directory**: Select **`frontend`** (NOT root `./`)
3. **Environment Variables**: Add from `frontend/vercel.env.txt`
   ```
   NEXT_PUBLIC_API_BASE_URL=<your-railway-backend-url>
   ```

The deployment will:
- Install dependencies from `frontend/package.json`
- Build the Next.js app with `pnpm build`
- Output to `.next` directory
- Automatically exclude backend files

**Configuration Files:**
- `vercel.json` - Vercel deployment settings
- `.vercelignore` - Excludes backend from deployment
- `frontend/vercel.env.txt` - Environment variables template

### Backend (Railway)

**Railway Configuration:**
1. Create new project with PostgreSQL database
2. Connect your GitHub repository
3. Railway will auto-detect `railway.json`
4. Add environment variables from `backend/railway.env.txt`

The deployment will:
- Install dependencies with `cd backend && pnpm install`
- Generate Prisma client with `pnpm prisma:generate`
- Build TypeScript with `pnpm build`
- Run migrations with `pnpm prisma:migrate:prod`
- Start server with `pnpm start`
- Health check at `/api/health`

**Configuration Files:**
- `railway.json` - Railway deployment settings
- `backend/railway.env.txt` - Environment variables template

## Project Structure

```
budget-request-monorepo/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js app directory
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Express.js backend API
│   ├── src/              # Source code
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Express middlewares
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── prisma/           # Database schema & migrations
│   └── package.json
├── package.json          # Root package.json (workspace)
├── pnpm-workspace.yaml   # PNPM workspace configuration
├── railway.json          # Railway deployment config
└── vercel.json           # Vercel deployment config
```

## Scripts

- `pnpm dev` - Run both frontend and backend in development mode
- `pnpm dev:frontend` - Run only frontend
- `pnpm dev:backend` - Run only backend
- `pnpm build` - Build frontend for production
- `pnpm build:frontend` - Build only frontend
- `pnpm build:backend` - Build only backend
- `pnpm install:all` - Install all dependencies
- `pnpm setup` - Complete setup including database migrations

## License

Private

