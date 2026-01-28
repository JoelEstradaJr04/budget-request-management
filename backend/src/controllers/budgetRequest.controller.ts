// src/controllers/budgetRequest.controller.ts
import { Request, Response } from 'express';
import * as service from '../services/budgetRequest.service';
import webhookDispatcher from '../webhooks/dispatcher';
import { applyAccessFilter } from '../middlewares/permission.middleware';
import { successResponse, successResponseWithPagination, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.util';
import { BudgetRequestCreate, BudgetRequestUpdate, BudgetRequestApproval, BudgetRequestRejection } from '../types/budgetRequest.types';
import { logAction } from '../services/audit.service';

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
    if (isValidValue(status)) {
      filter.status = Array.isArray(status) ? { in: status } : status;
    }
    if (isValidValue(department)) {
      filter.department_id = Array.isArray(department) ? { in: department } : department;
    }
    if (isValidValue(priority)) {
      // Priority maps to request_type in some contexts, but if it's a separate field or logic:
      // Checking schema, there isn't a dedicated priority column, but request_type acts as priority.
      // Assuming priority filter maps to request_type or ignores if not part of schema used here.
      // If request_type is used:
    }
    // Note: request_type wasn't in list destructuring but might be passed?
    // Destructuring included: status, department, dateFrom, dateTo, priority, search.
    // If request_type is passed, let's include it.
    const { request_type } = req.query;
    if (isValidValue(request_type)) {
      filter.request_type = Array.isArray(request_type) ? { in: request_type } : request_type;
    }

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

    console.log('List Filter:', JSON.stringify(filter, null, 2));

    // Fetch from database
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      service.findMany(filter, {
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      service.count(filter)
    ]);

    return successResponseWithPagination(
      res,
      data,
      {
        page: Number(page),
        limit: Number(limit),
        total: total,
        totalPages: Math.ceil(total / Number(limit))
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

    // Fetch from database
    const budgetRequest = await service.findById(Number(id));

    if (!budgetRequest) {
      return notFoundResponse(res, 'Budget request');
    }

    // Verify access rights
    const hasAccess = service.checkAccess(budgetRequest, req.user!);
    if (!hasAccess) {
      return forbiddenResponse(res, 'You do not have permission to view this budget request');
    }

    return successResponse(res, budgetRequest, 'Budget request retrieved successfully');
  } catch (error: any) {
    console.error('Get budget request error:', error);
    return errorResponse(res, error.message || 'Failed to retrieve budget request');
  }
}

export async function createBudgetRequest(req: Request, res: Response) {
  try {
    console.log('Creating budget request with data:', JSON.stringify(req.body, null, 2));

    // Force status to PENDING if not valid enum
    if (req.body.status !== 'PENDING' && req.body.status !== 'APPROVED' && req.body.status !== 'REJECTED' && req.body.status !== 'ADJUSTED' && req.body.status !== 'CLOSED') {
      req.body.status = 'PENDING';
    }

    const budgetRequest = await service.create(req.body, req.user!);

    // Dispatch webhook (fire and forget)
    webhookDispatcher.dispatch('budget_request.created', {
      budgetRequestId: budgetRequest.id,
      requestCode: budgetRequest.request_code,
      department: budgetRequest.department_id,
      amountRequested: Number(budgetRequest.total_amount)
    }).catch(err => console.error('Webhook error:', err.message));

    // Audit Log
    logAction({
      entity_type: 'BUDGET_REQUEST',
      entity_id: budgetRequest.id.toString(),
      action_type_code: 'CREATE',
      action_by: req.user!.id,
      new_data: budgetRequest,
      ip_address: req.ip
    });

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

    // Dispatch webhook
    webhookDispatcher.dispatch('budget_request.submitted', {
      budgetRequestId: updated.id,
      requestCode: updated.request_code,
      department: updated.department_id,
      amountRequested: Number(updated.total_amount),
      createdBy: updated.requested_by
    }).catch(err => console.error('Webhook error:', err.message));

    // Audit Log
    logAction({
      entity_type: 'BUDGET_REQUEST',
      entity_id: updated.id.toString(),
      action_type_code: 'UPDATE', // Or SUBMIT if available
      action_by: req.user!.id,
      previous_data: { status: existing.status },
      new_data: { status: updated.status },
      ip_address: req.ip
    });

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

    // Dispatch webhook
    webhookDispatcher.dispatch('budget_request.approved', {
      budgetRequestId: approved.id,
      requestCode: approved.request_code,
      department: approved.department_id,
      amountRequested: Number(approved.total_amount),
      approvedBy: req.user!.id
    }).catch(err => console.error('Webhook error:', err.message));

    // Audit Log
    logAction({
      entity_type: 'BUDGET_REQUEST',
      entity_id: approved.id.toString(),
      action_type_code: 'APPROVE',
      action_by: req.user!.id,
      previous_data: { status: existing.status },
      new_data: { status: approved.status, approval_notes: req.body.comments },
      ip_address: req.ip
    });

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

    // Dispatch webhook
    webhookDispatcher.dispatch('budget_request.rejected', {
      budgetRequestId: rejected.id,
      requestCode: rejected.request_code,
      department: rejected.department_id,
      amountRequested: Number(rejected.total_amount),
      rejectedBy: req.user!.id,
      reason: req.body.rejection_reason
    }).catch(err => console.error('Webhook error:', err.message));

    // Audit Log
    logAction({
      entity_type: 'BUDGET_REQUEST',
      entity_id: rejected.id.toString(),
      action_type_code: 'REJECT',
      action_by: req.user!.id,
      previous_data: { status: existing.status },
      new_data: { status: rejected.status, rejection_reason: req.body.rejection_reason },
      ip_address: req.ip
    });

    return successResponse(res, rejected, 'Budget request rejected successfully');
  } catch (error: any) {
    console.error('Reject budget request error:', error);
    return errorResponse(res, error.message || 'Failed to reject budget request');
  }
}
