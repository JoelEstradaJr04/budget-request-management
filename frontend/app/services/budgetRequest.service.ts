// app/services/budgetRequest.service.ts
// Budget Request API service layer - Updated to match backend schema

import apiService, { ApiResponse } from './api.service';

export interface BudgetRequestItem {
  id?: number;
  budget_request_id?: number;
  category_id?: number;
  description?: string;
  requested_amount: number;
  approved_amount?: number;
  notes?: string;
  pr_item_id?: number;
}

export interface BudgetRequest {
  id: number;
  request_code: string;
  department_id: string;
  department_name?: string;
  requested_by: string;
  requested_for?: string;
  request_date: string;
  total_amount: number;
  aggregated_requested_amount?: number;
  aggregated_approved_amount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADJUSTED' | 'CLOSED';
  purpose?: string;
  remarks?: string;
  request_type: 'REGULAR' | 'PROJECT_BASED' | 'URGENT' | 'EMERGENCY';
  pr_reference_code?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  items?: BudgetRequestItem[];
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
}

export interface CreateBudgetRequestDto {
  department_id: string;
  department_name?: string;
  requested_by: string;
  requested_for?: string;
  total_amount: number;
  purpose?: string;
  remarks?: string;
  request_type?: 'REGULAR' | 'PROJECT_BASED' | 'URGENT' | 'EMERGENCY';
  pr_reference_code?: string;
  items?: BudgetRequestItem[];
}

export interface UpdateBudgetRequestDto {
  purpose?: string;
  remarks?: string;
  total_amount?: number;
  request_type?: 'REGULAR' | 'PROJECT_BASED' | 'URGENT' | 'EMERGENCY';
  items?: BudgetRequestItem[];
}

export interface ApprovalDto {
  rejection_reason?: string; // Used for approval notes
}

export interface RejectionDto {
  rejection_reason: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  fiscalYear?: number;
  fiscalPeriod?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class BudgetRequestService {
  /**
   * Get the appropriate API endpoint based on user role and department
   */
  private getBaseEndpoint(): string {
    const role = apiService.getMockRole() || 'Finance Admin';
    const department = apiService.getMockDepartment() || 'finance';

    // Finance Admin has access to all departments
    if (department === 'finance' && role.toLowerCase().includes('admin')) {
      return '/finance/admin/budget-requests';
    }

    // Department Admin routes
    if (role.toLowerCase().includes('admin')) {
      return `/${department}/admin/budget-requests`;
    }

    // Non-Admin routes (department-specific)
    return `/${department}/non-admin/budget-requests`;
  }

  /**
   * Get approval endpoint (Finance Admin only)
   */
  private getApprovalEndpoint(): string {
    return '/finance/admin/approvals';
  }

  /**
   * List budget requests with filters and pagination
   */
  async list(params?: ListParams): Promise<ApiResponse<BudgetRequest[]>> {
    const endpoint = this.getBaseEndpoint();
    return apiService.get<BudgetRequest[]>(endpoint, params);
  }

  /**
   * Get single budget request by ID
   */
  async getById(id: number): Promise<ApiResponse<BudgetRequest>> {
    const endpoint = this.getBaseEndpoint();
    return apiService.get<BudgetRequest>(`${endpoint}/${id}`);
  }

  /**
   * Create new budget request
   */
  async create(data: CreateBudgetRequestDto): Promise<ApiResponse<BudgetRequest>> {
    const endpoint = this.getBaseEndpoint();
    return apiService.post<BudgetRequest>(endpoint, data);
  }

  /**
   * Update budget request (only DRAFT status)
   */
  async update(id: number, data: UpdateBudgetRequestDto): Promise<ApiResponse<BudgetRequest>> {
    const endpoint = this.getBaseEndpoint();
    return apiService.put<BudgetRequest>(`${endpoint}/${id}`, data);
  }

  /**
   * Delete budget request (only DRAFT status)
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const endpoint = this.getBaseEndpoint();
    return apiService.delete<void>(`${endpoint}/${id}`);
  }

  /**
   * Submit budget request (updates status to PENDING)
   * In the new schema, requests are created with PENDING status by default
   */
  async submit(id: number): Promise<ApiResponse<BudgetRequest>> {
    const endpoint = this.getBaseEndpoint();
    return apiService.patch<BudgetRequest>(`${endpoint}/${id}/status`, { status: 'PENDING' });
  }

  /**
   * Approve budget request (Finance Admin only)
   */
  async approve(id: number, approvalData?: ApprovalDto): Promise<ApiResponse<BudgetRequest>> {
    const endpoint = this.getApprovalEndpoint();
    return apiService.post<BudgetRequest>(`${endpoint}/${id}/approve`, approvalData);
  }

  /**
   * Reject budget request (Finance Admin only)
   */
  async reject(id: number, rejectionData: RejectionDto): Promise<ApiResponse<BudgetRequest>> {
    const endpoint = this.getApprovalEndpoint();
    return apiService.post<BudgetRequest>(`${endpoint}/${id}/reject`, rejectionData);
  }

  /**
   * Get audit trail for budget request
   */
  async getAuditTrail(_id: number): Promise<ApiResponse<any[]>> {
    // This would call the audit logs service
    // For now, return mock data
    return {
      success: true,
      data: [
        {
          action: 'CREATED',
          user: 'John Doe',
          timestamp: new Date().toISOString(),
          details: 'Budget request created'
        }
      ]
    };
  }

  /**
   * Export budget request (CSV/Excel/PDF)
   */
  async export(_id: number, _format: 'csv' | 'excel' | 'pdf'): Promise<ApiResponse<Blob>> {
    // This would handle file download
    // Implementation depends on backend export endpoint
    return {
      success: false,
      error: 'Export not implemented yet'
    };
  }
}

// Export singleton instance
export const budgetRequestService = new BudgetRequestService();
export default budgetRequestService;
