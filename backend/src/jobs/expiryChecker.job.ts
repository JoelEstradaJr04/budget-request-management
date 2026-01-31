// src/jobs/expiryChecker.job.ts
/**
 * Expiry Checker Job
 * 
 * Checks for budget reservations that have expired
 * Runs daily at midnight to mark expired reservations
 */

import cron from 'node-cron';
import { prisma } from '../config/database';

export function startExpiryCheckerJob() {
  // Run daily at midnight (00:00)
  const job = cron.schedule('0 0 * * *', async () => {
    try {
      // TODO: Implement expiry checking once reservation fields are added to schema
      // Required fields: isReserved, isExpired, reservationExpiry, isOverdue, slaDeadline
    } catch (error) {
      console.error('[Budget Service] Expiry Checker Job error:', error);
    }
  });

  return job;
}
