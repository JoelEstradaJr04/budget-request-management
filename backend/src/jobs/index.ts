// src/jobs/index.ts
/**
 * Job Scheduler Index
 * 
 * Initializes and manages all scheduled jobs
 */

import { startExpiryCheckerJob } from './expiryChecker.job';

export function startAllJobs() {
  console.log('🚀 Initializing scheduled jobs...\n');

  try {
    // Start expiry checker job (daily at midnight)
    const expiryCheckerJob = startExpiryCheckerJob();

    console.log('\n✅ All scheduled jobs initialized successfully\n');

    return {
      expiryCheckerJob
    };
  } catch (error) {
    console.error('❌ Failed to initialize scheduled jobs:', error);
    throw error;
  }
}

export function stopAllJobs(jobs: ReturnType<typeof startAllJobs>) {
  console.log('🛑 Stopping all scheduled jobs...');
  
  jobs.expiryCheckerJob.stop();

  console.log('✅ All scheduled jobs stopped');
}
