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

### 📚 Deployment Documentation

For complete deployment instructions, see:
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed step-by-step deployment guide
- **[DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md)** - Configuration summary and quick reference

### Frontend (Vercel)
The frontend is configured for deployment on Vercel. 

**Quick Setup:**
1. Import repository to Vercel
2. Set root directory to `frontend/`
3. Configure environment variable from `frontend/vercel.env.txt`
4. Deploy automatically using `vercel.json`

### Backend (Railway)
The backend is configured for deployment on Railway.

**Quick Setup:**
1. Create Railway project with PostgreSQL
2. Connect GitHub repository
3. Configure environment variables from `backend/railway.env.txt`
4. Deploy automatically using `railway.json`

**Template Files:**
- `backend/railway.env.txt` - Railway environment variables template
- `frontend/vercel.env.txt` - Vercel environment variables template
- `railway.json` - Backend deployment configuration
- `vercel.json` - Frontend deployment configuration
- `.vercelignore` - Files excluded from Vercel deployment

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

