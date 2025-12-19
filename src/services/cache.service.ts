// src/services/cache.service.ts
import redis from '../config/redis';
import { CACHE_TTL } from '../config/constants';

class CacheService {
  // Generic cache operations
  async cacheGeneric(key: string, data: any, ttl?: number) {
    if (!redis) return; // Skip if Redis is disabled
    const cacheTTL = ttl || CACHE_TTL.BUDGET_REQUEST || 300;
    await redis.setex(key, cacheTTL, JSON.stringify(data));
  }

  async getGeneric(key: string) {
    if (!redis) return null; // Skip if Redis is disabled
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async deleteGeneric(key: string) {
    if (!redis) return; // Skip if Redis is disabled
    await redis.del(key);
  }

  // Cache budget request details (5 min TTL)
  async cacheBudgetRequest(id: number, data: any) {
    if (!redis) return; // Skip if Redis is disabled
    const key = `br:${id}`;
    await redis.setex(key, CACHE_TTL.BUDGET_REQUEST || 300, JSON.stringify(data));
  }

  async getBudgetRequest(id: number) {
    if (!redis) return null; // Skip if Redis is disabled
    const key = `br:${id}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Invalidate cache
  async invalidateBudgetRequest(id: number) {
    if (!redis) return; // Skip if Redis is disabled
    await redis.del(`br:${id}`);
  }

  // Cache user permissions (1 hour TTL)
  async cacheUserPermissions(userId: string, permissions: any) {
    if (!redis) return; // Skip if Redis is disabled
    const key = `perm:${userId}`;
    await redis.setex(key, CACHE_TTL.USER_PERMISSIONS || 3600, JSON.stringify(permissions));
  }

  async getUserPermissions(userId: string) {
    if (!redis) return null; // Skip if Redis is disabled
    const key = `perm:${userId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Clear all cache (use with caution)
  async clearAll() {
    if (!redis) return; // Skip if Redis is disabled
    await redis.flushdb();
  }
}

export default new CacheService();
