// src/controllers/budgetRequest.controller.ts
import { Request, Response } from 'express';
import * as service from '../services/budgetRequest.service';
import auditLogger from '../services/auditLogger.service';
import webhookDispatcher from '../webhooks/dispatcher';
import { applyAccessFilter } from '../middlewares/permission.middleware';
import { successResponse, successResponseWithPagination, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.util';
import cache from '../utils/cache.util';
import { BudgetRequestCreate, BudgetRequestUpdate, BudgetRequestApproval, BudgetRequestRejection } from '../types/budgetRequest.types';

export async function listBudgetRequests(req: Request, res: Response) {
  try {
    const { 
      page = 1,
      limit = 20,
      status,
      department,
      dateFrom,
      dateTo,
      priority,
      search 
    } = req.query;

    // Helper function to check if value is valid (not undefined, null, empty, or string "undefined")
    const isValidValue = (value: any): boolean => {
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             value !== 'undefined' && 
             value !== 'null';
    };

    // Build base filter (schema uses snake_case)
    let filter: any = {
      is_deleted: false
    };

    // Apply filters - only if values are valid
    if (isValidValue(status)) filter.status = status;
    if (isValidValue(department)) filter.department_id = department;

    // Apply search filter
    if (isValidValue(search)) {
      filter.OR = [
        { purpose: { contains: search as string, mode: 'insensitive' } },
        { remarks: { contains: search as string, mode: 'insensitive' } },
        { request_code: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Apply date range filter
    if (isValidValue(dateFrom) || isValidValue(dateTo)) {
      filter.created_at = {};
      if (isValidValue(dateFrom)) filter.created_at.gte = new Date(dateFrom as string);
      if (isValidValue(dateTo)) filter.created_at.lte = new Date(dateTo as string);
    }

    // Apply role-based access control
    filter = applyAccessFilter(filter, req.user!);

    // Generate user-aware cache key (different users may see different data based on role/department)
    const cacheKey = cache.generateUserCacheKey(
      'requests:list',
      req.user!.id.toString(),
      req.user!.role,
      {
        page: Number(page),
        limit: Number(limit),
        status,
        department,
        priority,
        dateFrom,
        dateTo,
        search
      }
    );

    // Try cache first, then fetch from DB if miss
    const result = await cache.withCache(
      cacheKey,
      async () => {
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = await Promise.all([
            service.findMany(filter, {
              skip,
              take: Number(limit),
              orderBy: { created_at: 'desc' }
            }),
            service.count(filter)
          ]);
        return { data, total };
      },
      180 // Cache for 3 minutes (balance between freshness and performance)
    );

    return successResponseWithPagination(
      res,
      result.data,
      {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit))
      },
      'Budget requests retrieved successfully'
    );
  } catch (error: any) {
    console.error('List budget requests error:', error);
    return errorResponse(res, error.message || 'Failed to retrieve budget requests');
  }
}

export async function getBudgetRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Generate cache key for this specific budget request
    const cacheKey = cache.generateCacheKey('requests:detail', { id: Number(id) });

    // Try cache first, then fetch from DB if miss
    const budgetRequest = await cache.withCache(
      cacheKey,
      async () => await service.findById(Number(id)),
      600 // Cache for 10 minutes (details are relatively stable)
    );

    if (!budgetRequest) {
      return notFoundResponse(res, 'Budget request');
    }

    // Verify access rights
    const hasAccess = service.checkAccess(budgetRequest, req.user!);
    if (!hasAccess) {
      return forbiddenResponse(res, 'You do not have permission to view this budget request');
    }

    // Log view action (don't await - fire and forget for performance)
    auditLogger.view({
      id: budgetRequest.id,
      requestCode: budgetRequest.request_code
    }, req.user!).catch(err => {
      console.error('Audit log error:', err.message);
    });

    return successResponse(res, budgetRequest, 'Budget request retrieved successfully');
  } catch (error: any) {
    console.error('Get budget request error:', error);
    return errorResponse(res, error.message || 'Failed to retrieve budget request');
  }
}

export async function createBudgetRequest(req: Request, res: Response) {
  try {
    console.log('Creating budget request with data:', JSON.stringify(req.body, null, 2));
    
    const budgetRequest = await service.create(req.body, req.user!);

    // Log creation
    await auditLogger.create({
      id: budgetRequest.id,
      requestCode: budgetRequest.request_code,
      department: budgetRequest.department_id,
      amountRequested: budgetRequest.total_amount
    }, req.user!).catch(err => console.error('Audit log error:', err.message));

    // Invalidate related caches
    await cache.invalidateBudgetRequests();
    await cache.invalidateAnalytics();

    // Dispatch webhook (fire and forget)
    webhookDispatcher.dispatch('budget_request.created', {
      budgetRequestId: budgetRequest.id,
      requestCode: budgetRequest.request_code,
      department: budgetRequest.department_id,
      amountRequested: Number(budgetRequest.total_amount)
    }).catch(err => console.error('Webhook error:', err.message));

    return successResponse(
      res,
      budgetRequest,
      'Budget request created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create budget request error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body was:', JSON.stringify(req.body, null, 2));
    return errorResponse(res, error.message || 'Failed to create budget request');
  }
}

export async function submitBudgetRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get existing budget request
    const existing = await service.findById(Number(id));
    
    if (!existing) {
      return notFoundResponse(res, 'Budget request');
    }

    // Verify ownership or admin role
    if (existing.requested_by !== req.user!.id && !req.user!.role.toLowerCase().includes('admin')) {
      return forbiddenResponse(res, 'Only the requester or admins can submit this request');
    }

    // Submit (schema uses PENDING as pending state)
    const updated = await service.submit(Number(id), req.user!);

    // Log submission
    await auditLogger.submit({
      id: updated.id,
      requestCode: updated.request_code,
      amountRequested: updated.total_amount
    }, req.user!).catch(err => console.error('Audit log error:', err.message));

    // Invalidate related caches
    await cache.deleteCache(cache.generateCacheKey('requests:detail', { id: Number(id) }));
    await cache.invalidateBudgetRequests();
    await cache.invalidateAnalytics();

    // Dispatch webhook
    webhookDispatcher.dispatch('budget_request.submitted', {
      budgetRequestId: updated.id,
      requestCode: updated.request_code,
      department: updated.department_id,
      amountRequested: Number(updated.total_amount),
      createdBy: updated.requested_by
    }).catch(err => console.error('Webhook error:', err.message));

    return successResponse(res, updated, 'Budget request submitted successfully');
  } catch (error: any) {
    console.error('Submit budget request error:', error);
    return errorResponse(res, error.message || 'Failed to submit budget request');
  }
}

export async function approveBudgetRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get existing budget request
    const existing = await service.findById(Number(id));
    
    if (!existing) {
      return notFoundResponse(res, 'Budget request');
    }

    // Can only approve pending requests
    if (existing.status !== 'PENDING') {
      return errorResponse(res, 'Only pending budget requests can be approved', 400);
    }

    // Approve budget request
    const approved = await service.approve(Number(id), req.body, req.user!);

    // Log approval
    await auditLogger.approve({
      id: approved.id,
      requestCode: approved.request_code,
      amountRequested: approved.total_amount,
      approvedBy: req.user!.id
    }, req.user!).catch(err => console.error('Audit log error:', err.message));

    // Invalidate related caches (specific detail + all lists + analytics)
    await cache.deleteCache(cache.generateCacheKey('requests:detail', { id: Number(id) }));
    await cache.invalidateBudgetRequests();
    await cache.invalidateAnalytics();

    // Dispatch webhook
    webhookDispatcher.dispatch('budget_request.approved', {
      budgetRequestId: approved.id,
      requestCode: approved.request_code,
      department: approved.department_id,
      amountRequested: Number(approved.total_amount),
      approvedBy: req.user!.id
    }).catch(err => console.error('Webhook error:', err.message));

    return successResponse(res, approved, 'Budget request approved successfully');
  } catch (error: any) {
    console.error('Approve budget request error:', error);
    return errorResponse(res, error.message || 'Failed to approve budget request');
  }
}

export async function rejectBudgetRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Get existing budget request
    const existing = await service.findById(Number(id));
    
    if (!existing) {
      return notFoundResponse(res, 'Budget request');
    }

    // Can only reject pending requests
    if (existing.status !== 'PENDING') {
      return errorResponse(res, 'Only pending budget requests can be rejected', 400);
    }

    // Reject budget request
    const rejected = await service.reject(Number(id), req.body, req.user!);

    // Log rejection
    await auditLogger.reject({
      id: rejected.id,
      requestCode: rejected.request_code,
      amountRequested: rejected.total_amount,
      rejectedBy: req.user!.id,
      reason: req.body.rejection_reason
    }, req.user!).catch(err => console.error('Audit log error:', err.message));

    // Invalidate related caches (specific detail + all lists + analytics)
    await cache.deleteCache(cache.generateCacheKey('requests:detail', { id: Number(id) }));
    await cache.invalidateBudgetRequests();
    await cache.invalidateAnalytics();

    // Dispatch webhook
    webhookDispatcher.dispatch('budget_request.rejected', {
      budgetRequestId: rejected.id,
      requestCode: rejected.request_code,
      department: rejected.department_id,
      amountRequested: Number(rejected.total_amount),
      rejectedBy: req.user!.id,
      reason: req.body.rejection_reason
    }).catch(err => console.error('Webhook error:', err.message));

    return successResponse(res, rejected, 'Budget request rejected successfully');
  } catch (error: any) {
    console.error('Reject budget request error:', error);
    return errorResponse(res, error.message || 'Failed to reject budget request');
  }
}
