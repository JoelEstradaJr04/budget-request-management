// src/jobs/index.ts
/**
 * Job Scheduler Index
 * 
 * Initializes and manages all scheduled jobs
 */

import { startExpiryCheckerJob } from './expiryChecker.job';

export function startAllJobs() {
  try {
    // Start expiry checker job (daily at midnight)
    const expiryCheckerJob = startExpiryCheckerJob();

    return {
      expiryCheckerJob
    };
  } catch (error) {
    console.error('[Budget Service] Failed to initialize jobs:', error);
    throw error;
  }
}

export function stopAllJobs(jobs: ReturnType<typeof startAllJobs>) {
  jobs.expiryCheckerJob.stop();
}
