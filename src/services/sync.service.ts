// src/services/sync.service.ts
import axios from 'axios';
import { prisma } from '../config/database';
import cacheService from './cache.service';
import { FINANCE_API_URL, FINANCE_API_KEY } from '../config/constants';

class SyncService {
  // Sync department budget from Finance Main (simplified - just returns data without caching in DB)
  async syncDepartmentBudget(department: string, fiscalYear: number, fiscalPeriod: string) {
    try {
      // Check cache first
      const cacheKey = `dept_budget:${department}:${fiscalYear}:${fiscalPeriod}`;
      const cached = await cacheService.getGeneric(cacheKey);
      if (cached) return cached;

      // Fetch from Finance API
      const response = await axios.get(
        `${FINANCE_API_URL}/api/budgets/department/${department}`,
        {
          params: { fiscalYear, fiscalPeriod },
          headers: {
            'x-api-key': FINANCE_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      const financeData = (response.data as any).data;

      const budgetData = {
        id: financeData.id,
        department,
        fiscalYear,
        fiscalPeriod,
        allocatedAmount: financeData.allocatedAmount,
        usedAmount: financeData.usedAmount,
        reservedAmount: financeData.reservedAmount,
        remainingAmount: financeData.remainingAmount,
        periodStart: new Date(financeData.periodStart),
        periodEnd: new Date(financeData.periodEnd),
        lastSyncedAt: new Date(),
        isStale: false
      };

      // Cache the result
      await cacheService.cacheGeneric(cacheKey, budgetData, 900); // 15 minutes TTL

      return budgetData;
    } catch (error: any) {
      console.error('Budget sync failed:', error.message);
      
      // Return a default mock budget as fallback
      console.warn(`No budget data available for ${department}. Using default values.`);
      const now = new Date();
      const yearStart = new Date(fiscalYear, 0, 1);
      const yearEnd = new Date(fiscalYear, 11, 31);

      const defaultBudget = {
        id: -1,
        department,
        fiscalYear,
        fiscalPeriod,
        allocatedAmount: 10000000, // 10M default allocation
        usedAmount: 0,
        reservedAmount: 0,
        remainingAmount: 10000000,
        periodStart: yearStart,
        periodEnd: yearEnd,
        lastSyncedAt: now,
        isStale: true
      };

      return defaultBudget;
    }
  }

  // Notify Finance Main of budget reservation
  async notifyBudgetReservation(
    budgetRequestId: number,
    authToken?: string
  ) {
    try {
      const budgetRequest = await prisma.budget_request.findUnique({
        where: { id: budgetRequestId }
      });

      if (!budgetRequest) {
        throw new Error('Budget request not found');
      }

      // Make request with headers
      const headers: any = {
        'x-api-key': FINANCE_API_KEY,
        'Content-Type': 'application/json'
      };

      if (authToken) {
        headers['Authorization'] = authToken;
      }

      await axios.post(
        `${FINANCE_API_URL}/api/integration/budgets/reserve`,
        {
          budgetRequestId: budgetRequest.id,
          department: budgetRequest.department_id,
          amount: Number(budgetRequest.total_amount),
          requestCode: budgetRequest.request_code
        },
        { headers }
      );

      console.log(`✅ Budget reservation notified for BR-${budgetRequestId}`);
    } catch (error: any) {
      console.error('❌ Budget reservation notification failed:', error.message);
      // Don't throw - notification failure shouldn't break the approval flow
    }
  }
}

export default new SyncService();
