// src/services/budgetRequest.service.ts
import { prisma } from '../config/database';
import notificationService from './notification.service';
import { UserContext } from '../types/express';

export async function findMany(filter: any, options: any = {}) {
  const budgetRequests = await prisma.budget_request.findMany({
    where: filter,
    include: {
      items: {
        include: {
          category: true
        }
      }
    },
    ...options
  });

  // Calculate aggregated amounts from items
  const requestsWithAggregates = budgetRequests.map((request: any) => {
    const aggregatedRequestedAmount = request.items.reduce((sum: number, item: any) => {
      return sum + Number(item.requested_amount);
    }, 0);

    const aggregatedApprovedAmount = request.items.reduce((sum: number, item: any) => {
      return sum + Number(item.approved_amount || 0);
    }, 0);

    return {
      ...request,
      aggregated_requested_amount: aggregatedRequestedAmount,
      aggregated_approved_amount: aggregatedApprovedAmount
    };
  });

  return requestsWithAggregates;
}

export async function count(filter: any) {
  return prisma.budget_request.count({ where: filter });
}

export async function findById(id: number, options: any = {}) {
  // Fetch from database
  const budgetRequest = await prisma.budget_request.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          category: true
        }
      }
    },
    ...options
  });

  return budgetRequest;
}

export async function create(data: any, user: UserContext) {
  console.log('Service create called with data:', JSON.stringify(data, null, 2));

  // Calculate total amount from items if not provided
  let totalAmount = data.total_amount || data.amountRequested || 0;
  if ((!totalAmount || totalAmount === 0) && data.items && data.items.length > 0) {
    totalAmount = data.items.reduce((sum: number, item: any) => {
      return sum + (item.requested_amount || item.totalCost || item.subtotal || 0);
    }, 0);
  }

  // Create budget request with items in transaction
  const budgetRequest = await prisma.$transaction(async (tx: any) => {
    // Create main budget request using schema field names
    const br = await tx.budget_request.create({
      data: {
        department_id: data.department || data.department_id,
        department_name: data.department_name || null,
        requested_by: user.id,
        requester_position: data.requester_position || data.position || 'Staff', // Default to Staff if missing
        requested_for: data.requested_for || null,
        total_amount: totalAmount,
        purpose: data.purpose || null,
        remarks: data.remarks || null,
        request_type: data.request_type || data.requestType || 'REGULAR',
        pr_reference_code: data.pr_reference_code || data.linkedPurchaseRequestRefNo || null,
        status: data.status || 'PENDING'
      }
    });

    // Create request items if provided
    if (data.items && data.items.length > 0) {
      const mappedItems = data.items.map((item: any) => ({
        budget_request_id: br.id,
        category_id: item.category_id || null,
        description: item.description || item.itemName || item.item_name || null,
        requested_amount: item.requested_amount || item.totalCost || item.subtotal || 0,
        approved_amount: item.approved_amount || 0,
        notes: item.notes || null,
        pr_item_id: item.pr_item_id || null
      }));

      await tx.budget_request_item.createMany({ data: mappedItems });
    }

    // Fetch the complete budget request with items
    const completeRequest = await tx.budget_request.findUnique({
      where: { id: br.id },
      include: {
        items: {
          include: {
            category: true
          }
        }
      }
    });

    return completeRequest;
  });

  console.log('Budget request created successfully:', budgetRequest.id);
  return budgetRequest;
}

export async function submit(id: number, user: UserContext) {
  const updated = await prisma.budget_request.update({
    where: { id },
    data: {
      status: 'PENDING'
    },
    include: {
      items: {
        include: {
          category: true
        }
      }
    }
  });

  // Send notification to admins
  await notificationService.notifyAdminsNewRequest(updated);

  return updated;
}

export async function approve(id: number, approvalData: any, user: UserContext) {
  const existingRequest = await findById(id);
  if (!existingRequest) {
    throw new Error('Budget request not found');
  }

  const approved = await prisma.budget_request.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approved_by: user.id,
      approved_at: new Date(),
      remarks: approvalData.remarks || existingRequest.remarks
    },
    include: {
      items: {
        include: {
          category: true
        }
      }
    }
  });

  // Send approval notification
  await notificationService.notifyRequestApproved(approved);

  return approved;
}

export async function reject(id: number, rejectionData: any, user: UserContext) {
  const existingRequest = await findById(id);
  if (!existingRequest) {
    throw new Error('Budget request not found');
  }

  const rejected = await prisma.budget_request.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejected_by: user.id,
      rejected_at: new Date(),
      rejection_reason: rejectionData.rejection_reason || null
    },
    include: {
      items: {
        include: {
          category: true
        }
      }
    }
  });

  // Send rejection notification
  await notificationService.notifyRequestRejected(rejected);

  return rejected;
}

export function checkAccess(budgetRequest: any, user: UserContext): boolean {
  // SuperAdmin: full access
  if (user.role === 'SuperAdmin') return true;

  // Finance Admin: full access to all budget requests
  if (user.role.includes('Finance') && user.role.includes('Admin')) {
    return true;
  }

  // Department Admin: own department only
  if (user.role.includes('Admin')) {
    return budgetRequest.department_id === user.department;
  }

  // Regular user: own requests only
  return budgetRequest.requested_by === user.id;
}

export async function updateBudgetRequest(id: number, data: any, user: UserContext) {
  const existingRequest = await findById(id);
  if (!existingRequest) {
    throw new Error('Budget request not found');
  }

  // Only allow updates on pending requests
  if (existingRequest.status !== 'PENDING') {
    throw new Error('Can only update pending budget requests');
  }

  const updated = await prisma.budget_request.update({
    where: { id },
    data: {
      total_amount: data.total_amount,
      purpose: data.purpose,
      remarks: data.remarks,
      request_type: data.request_type,
      department_name: data.department_name
    },
    include: {
      items: {
        include: {
          category: true
        }
      }
    }
  });

  return updated;
}

export async function deleteBudgetRequest(id: number, user: UserContext) {
  const existingRequest = await findById(id);
  if (!existingRequest) {
    throw new Error('Budget request not found');
  }

  // Soft delete
  const deleted = await prisma.budget_request.update({
    where: { id },
    data: {
      is_deleted: true
    }
  });

  return deleted;
}
