// src/controllers/itemAllocation.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.util';
import auditLogger from '../services/auditLogger.service';

/**
 * Get all item allocations for a budget request
 */
export async function getItemAllocations(req: Request, res: Response) {
  try {
    const { requestId } = req.params;

    const request = await prisma.budget_request.findUnique({
      where: { id: parseInt(requestId) },
      include: {
        items: {
          include: { category: true },
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!request) {
      return notFoundResponse(res, 'Budget request not found');
    }

    return successResponse(res, request.items, 'Item allocations retrieved successfully');
  } catch (error) {
    console.error('Error fetching item allocations:', error);
    return errorResponse(res, 'Failed to retrieve item allocations');
  }
}

/**
 * Get a specific item allocation
 */
export async function getItemAllocation(req: Request, res: Response) {
  try {
    const { requestId, itemId } = req.params;

    const item = await prisma.budget_request_item.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        budget_request: {
          select: {
            id: true,
            request_code: true,
            department_id: true,
            status: true
          }
        },
        category: true
      }
    });

    if (!item || item.budget_request_id !== parseInt(requestId)) {
      return notFoundResponse(res, 'Item allocation not found');
    }

    return successResponse(res, item, 'Item allocation retrieved successfully');
  } catch (error) {
    console.error('Error fetching item allocation:', error);
    return errorResponse(res, 'Failed to retrieve item allocation');
  }
}

/**
 * Add item allocation to a budget request
 */
export async function addItemAllocation(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const { category_id, description, requested_amount, notes } = req.body;

    // Check if budget request exists and is in PENDING status
    const budgetRequest = await prisma.budget_request.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!budgetRequest) {
      return notFoundResponse(res, 'Budget request not found');
    }

    if (budgetRequest.status !== 'PENDING') {
      return errorResponse(res, 'Can only add items to pending requests', 400);
    }

    // Check if user has permission to modify this request
    if (req.user?.role !== 'SuperAdmin' && 
        req.user?.department !== budgetRequest.department_id) {
      return errorResponse(res, 'You do not have permission to modify this request', 403);
    }

    // Create item allocation
    const item = await prisma.budget_request_item.create({
      data: {
        budget_request_id: parseInt(requestId),
        category_id,
        description,
        requested_amount,
        approved_amount: requested_amount,
        notes
      },
      include: {
        category: true
      }
    });

    // Recalculate request total
    const items = await prisma.budget_request_item.findMany({
      where: { budget_request_id: parseInt(requestId) }
    });

    const newTotal = items.reduce((sum, item) => sum + Number(item.requested_amount), 0);

    await prisma.budget_request.update({
      where: { id: parseInt(requestId) },
      data: {
        total_amount: newTotal
      }
    });

    // Log audit activity
    await auditLogger.log('ITEM_ADDED', {
      requestId: budgetRequest.id,
      itemId: item.id,
      amount: requested_amount
    }, {
      id: req.user?.id || 'system',
      username: req.user?.username || 'system',
      role: req.user?.role || 'user',
      department: req.user?.department || 'system'
    });

    return successResponse(res, item, 'Item allocation added successfully', 201);
  } catch (error) {
    console.error('Error adding item allocation:', error);
    return errorResponse(res, 'Failed to add item allocation');
  }
}

/**
 * Update an item allocation
 */
export async function updateItemAllocation(req: Request, res: Response) {
  try {
    const { requestId, itemId } = req.params;
    const { description, category_id, requested_amount, notes } = req.body;

    // Get the item
    const item = await prisma.budget_request_item.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        budget_request: true
      }
    });

    if (!item || item.budget_request_id !== parseInt(requestId)) {
      return notFoundResponse(res, 'Item allocation not found');
    }

    // Check if request is editable
    if (item.budget_request.status !== 'PENDING') {
      return errorResponse(res, 'Can only update items in pending requests', 400);
    }

    // Check permissions
    if (req.user?.role !== 'SuperAdmin' && 
        req.user?.department !== item.budget_request.department_id) {
      return errorResponse(res, 'You do not have permission to modify this request', 403);
    }

    // Update item
    const updatedItem = await prisma.budget_request_item.update({
      where: { id: parseInt(itemId) },
      data: {
        description: description ?? item.description,
        category_id: category_id ?? item.category_id,
        requested_amount: requested_amount ?? item.requested_amount,
        approved_amount: requested_amount ?? item.approved_amount,
        notes: notes ?? item.notes
      },
      include: {
        category: true
      }
    });

    // Recalculate request total
    const items = await prisma.budget_request_item.findMany({
      where: { budget_request_id: parseInt(requestId) }
    });

    const newTotal = items.reduce((sum, item) => sum + Number(item.requested_amount), 0);

    await prisma.budget_request.update({
      where: { id: parseInt(requestId) },
      data: {
        total_amount: newTotal
      }
    });

    // Log audit activity
    await auditLogger.log('ITEM_UPDATED', {
      requestId: item.budget_request_id,
      itemId: item.id,
      changes: { requested_amount }
    }, {
      id: req.user?.id || 'system',
      username: req.user?.username || 'system',
      role: req.user?.role || 'user',
      department: req.user?.department || 'system'
    });

    return successResponse(res, updatedItem, 'Item allocation updated successfully');
  } catch (error) {
    console.error('Error updating item allocation:', error);
    return errorResponse(res, 'Failed to update item allocation');
  }
}

/**
 * Delete an item allocation
 */
export async function deleteItemAllocation(req: Request, res: Response) {
  try {
    const { requestId, itemId } = req.params;

    // Get the item
    const item = await prisma.budget_request_item.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        budget_request: true
      }
    });

    if (!item || item.budget_request_id !== parseInt(requestId)) {
      return notFoundResponse(res, 'Item allocation not found');
    }

    // Check if request is editable
    if (item.budget_request.status !== 'PENDING') {
      return errorResponse(res, 'Can only delete items from pending requests', 400);
    }

    // Check permissions
    if (req.user?.role !== 'SuperAdmin' && 
        req.user?.department !== item.budget_request.department_id) {
      return errorResponse(res, 'You do not have permission to modify this request', 403);
    }

    // Delete item
    await prisma.budget_request_item.delete({
      where: { id: parseInt(itemId) }
    });

    // Recalculate request total
    const items = await prisma.budget_request_item.findMany({
      where: { budget_request_id: parseInt(requestId) }
    });

    const newTotal = items.reduce((sum, item) => sum + Number(item.requested_amount), 0);

    await prisma.budget_request.update({
      where: { id: parseInt(requestId) },
      data: {
        total_amount: newTotal
      }
    });

    // Log audit activity
    await auditLogger.log('ITEM_DELETED', {
      requestId: item.budget_request_id,
      itemId: item.id
    }, {
      id: req.user?.id || 'system',
      username: req.user?.username || 'system',
      role: req.user?.role || 'user',
      department: req.user?.department || 'system'
    });

    return successResponse(res, null, 'Item allocation deleted successfully');
  } catch (error) {
    console.error('Error deleting item allocation:', error);
    return errorResponse(res, 'Failed to delete item allocation');
  }
}

/**
 * Approve an item allocation
 */
export async function approveItemAllocation(req: Request, res: Response) {
  try {
    const { requestId, itemId } = req.params;
    const { approved_amount, comments } = req.body;

    const item = await prisma.budget_request_item.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        budget_request: true
      }
    });

    if (!item || item.budget_request_id !== parseInt(requestId)) {
      return notFoundResponse(res, 'Item allocation not found');
    }

    // Only SuperAdmin can approve items
    if (req.user?.role !== 'SuperAdmin') {
      return errorResponse(res, 'Only SuperAdmin can approve items', 403);
    }

    const updatedItem = await prisma.budget_request_item.update({
      where: { id: parseInt(itemId) },
      data: {
        approved_amount: approved_amount || item.requested_amount,
        notes: comments || item.notes
      },
      include: {
        category: true
      }
    });

    // Log audit activity
    await auditLogger.log('ITEM_APPROVED', {
      requestId: item.budget_request_id,
      itemId: item.id,
      approvedAmount: approved_amount || item.requested_amount
    }, {
      id: req.user?.id || 'system',
      username: req.user?.username || 'system',
      role: req.user?.role || 'user',
      department: req.user?.department || 'system'
    });

    return successResponse(res, updatedItem, 'Item allocation approved successfully');
  } catch (error) {
    console.error('Error approving item allocation:', error);
    return errorResponse(res, 'Failed to approve item allocation');
  }
}

