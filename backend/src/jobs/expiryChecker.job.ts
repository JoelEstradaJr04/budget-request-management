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
    console.log('🕐 [Expiry Checker Job] Starting...');
    
    try {
      // TODO: Implement expiry checking once reservation fields are added to schema
      // Required fields: isReserved, isExpired, reservationExpiry, isOverdue, slaDeadline
      console.log('  ℹ️  Expiry checking not yet implemented');
      console.log('✅ [Expiry Checker Job] Completed');
    } catch (error) {
      console.error('❌ [Expiry Checker Job] Fatal error:', error);
    }
  });

  console.log('📅 Expiry Checker Job scheduled (daily at midnight)');
  return job;
}
