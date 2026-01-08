// src/routes/health.routes.ts
import express, { Request, Response } from 'express';
import { prisma } from '../config/database';

const router: any = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      service: 'budget-request-microservice',
      checks: {
        database: 'healthy'
      }
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      message: 'Service is unhealthy',
      timestamp: new Date().toISOString(),
      service: 'budget-request-microservice',
      error: error.message
    });
  }
});

export default router;
