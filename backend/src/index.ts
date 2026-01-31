// src/index.ts
import os from 'os';
import app from './app';
import { env } from './config/env';
import { startAllJobs, stopAllJobs } from './jobs';
// Redis cache has been removed
import { prisma } from './config/database';

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

// Get network IP address
function getNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start scheduled jobs
let scheduledJobs: ReturnType<typeof startAllJobs>;

app.listen(PORT, () => {
  const networkIP = getNetworkIP();
  // Minimal startup message
  console.log(`[BACKEND] Local:    http://localhost:${PORT}`);
  console.log(`[BACKEND] Network:  http://${networkIP}:${PORT}`);
  console.log(`[BACKEND] Env:      .env`);

  // Initialize scheduled jobs after server starts (silently)
  try {
    scheduledJobs = startAllJobs();
  } catch (error) {
    console.error('[Budget Service] Failed to start jobs:', error);
  }
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`[Budget Service] ${signal} - shutting down...`);
  
  // Stop all scheduled jobs
  if (scheduledJobs) {
    stopAllJobs(scheduledJobs);
  }

  // Disconnect from database
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('[Budget Service] Database disconnect error:', error);
  }

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
