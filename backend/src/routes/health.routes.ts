// src/routes/health.routes.ts
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router: any = express.Router();

// Basic health check - always returns 200 (for Railway/container health checks)
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'budget-request-microservice'
  });
});

// Detailed health check with database connectivity
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString(),
      service: 'budget-request-microservice',
      checks: {
        database: 'healthy'
      }
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
      service: 'budget-request-microservice',
      error: error.message
    });
  }
});

export default router;
