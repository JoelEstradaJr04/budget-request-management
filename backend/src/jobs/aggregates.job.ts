// src/jobs/aggregates.job.ts
/**
 * Aggregates Generator Job
 * 
 * Generates and caches aggregated statistics for dashboards
 * Runs every 30 minutes to pre-compute heavy analytics queries
 */

import cron from 'node-cron';
import { prisma } from '../config/database';
import { DEPARTMENTS } from '../config/constants';

export function startAggregatesJob() {
  // Run every 30 minutes
  const job = cron.schedule('*/30 * * * *', async () => {
    console.log('📊 [Aggregates Job] Starting...');
    
    try {
      const results: any[] = [];

      for (const department of DEPARTMENTS) {
        try {
          console.log(`  Generating aggregates for: ${department}`);

          // Count requests by status
          const [total, pending, approved, rejected] = await Promise.all([
            prisma.budget_request.count({
              where: { department_id: department, is_deleted: false }
            }),
            prisma.budget_request.count({
              where: { department_id: department, is_deleted: false, status: 'PENDING' }
            }),
            prisma.budget_request.count({
              where: { department_id: department, is_deleted: false, status: 'APPROVED' }
            }),
            prisma.budget_request.count({
              where: { department_id: department, is_deleted: false, status: 'REJECTED' }
            })
          ]);

          // Sum amounts
          const amountStats = await prisma.budget_request.aggregate({
            where: { department_id: department, is_deleted: false },
            _sum: {
              total_amount: true
            }
          });

          const aggregate = {
            department,
            totalRequests: total,
            pendingRequests: pending,
            approvedRequests: approved,
            rejectedRequests: rejected,
            totalAmount: Number(amountStats._sum.total_amount) || 0,
            approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : '0.00'
          };

          // Store in system config or cache
          // For now, just log
          console.log(`  ✅ ${department}:`, aggregate);
          
          results.push({ department, status: 'success' });
        } catch (error) {
          console.error(`  ❌ Failed to generate aggregates for ${department}:`, error);
          results.push({ 
            department, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown' 
          });
        }
      }

      console.log('✅ [Aggregates Job] Completed');
      console.log('  Results:', results);
    } catch (error) {
      console.error('❌ [Aggregates Job] Fatal error:', error);
    }
  });

  console.log('📅 Aggregates Job scheduled (every 30 minutes)');
  return job;
}
