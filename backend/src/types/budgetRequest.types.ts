// src/types/budgetRequest.types.ts
// Type definitions matching schema.prisma

// Enum types matching schema.prisma (updated to match current schema)
export type BudgetRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADJUSTED' | 'CLOSED';
export type RequestType = 'REGULAR' | 'PROJECT_BASED' | 'URGENT' | 'EMERGENCY';
export type UserRole = 'ADMIN' | 'NON_ADMIN';

export interface BudgetRequestCreate {
  // Request Info (aligned with schema fields)
  department_id: string;
  department_name?: string;
  requested_by: string;  // User ID
  requested_for?: string;  // Optional: for whom the budget is requested
  total_amount: number;
  purpose?: string;
  remarks?: string;
  request_type?: RequestType;
  pr_reference_code?: string;  // Link to Purchase Request
  status?: BudgetRequestStatus;

  // Item Allocations
  items?: BudgetRequestItemCreate[];
}

export interface BudgetRequestItemCreate {
  category_id?: number;  // Links to budget_category
  description?: string;
  requested_amount: number;
  approved_amount?: number;  // Optional, only set during approval
  notes?: string;
  pr_item_id?: number;  // Optional link to purchase_request_item
}

export interface BudgetRequestUpdate {
  total_amount?: number;
  purpose?: string;
  remarks?: string;
  request_type?: RequestType;
  department_name?: string;
}

export interface BudgetRequestApproval {
  remarks?: string;
}

export interface BudgetRequestRejection {
  rejection_reason: string; // Required
}

export interface BudgetRequestFilters {
  page?: number;
  limit?: number;
  status?: BudgetRequestStatus | string;
  department?: string;
  request_type?: RequestType | string;
  dateFrom?: string;
  dateTo?: string;
  pr_reference_code?: string;
  requested_by?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BudgetRequestResponse {
  id: number;
  request_code: string;
  
  // Department and requester info
  department_id: string;
  department_name: string | null;
  requested_by: string;
  requested_for: string | null;
  request_date: Date;
  
  // Request Details
  total_amount: number;
  status: BudgetRequestStatus;
  purpose: string | null;
  remarks: string | null;
  request_type: RequestType;
  pr_reference_code: string | null;

  // Approval fields
  approved_by: string | null;
  approved_at: Date | null;
  rejected_by: string | null;
  rejected_at: Date | null;
  rejection_reason: string | null;

  // Audit Trail
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;

  // Aggregated amounts from items (calculated from budget_request_item)
  aggregated_requested_amount?: number;
  aggregated_approved_amount?: number;

  // Relations (optional, included with specific queries)
  items?: BudgetRequestItemResponse[];
}

export interface BudgetRequestItemResponse {
  id: number;
  budget_request_id: number;
  category_id: number | null;
  description: string | null;
  requested_amount: number;
  approved_amount: number;
  notes: string | null;
  pr_item_id: number | null;
  category?: BudgetCategoryResponse;
}

export interface BudgetCategoryResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AttachmentResponse {
  id: number;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  meta: {
    timestamp: string;
    version: string;
  };
}
