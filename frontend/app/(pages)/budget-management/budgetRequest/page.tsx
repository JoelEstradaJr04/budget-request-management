"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import "../../../styles/components/table.css";
import "../../../styles/components/chips.css";
import "../../../styles/budget-management/budgetRequest.css";
import PaginationComponent from "../../../Components/pagination";
import Swal from 'sweetalert2';
import { formatDate, formatDateTime } from '../../../utils/dateFormatter';
import Loading from '../../../Components/loading';
import { showSuccess, showError } from '../../../utils/Alerts';
import FilterDropdown, { FilterSection } from "../../../Components/filter";
import AddBudgetRequest from './recordBudgetRequest';
import EditBudgetRequest from './editBudgetRequest';
import ViewBudgetRequest from './viewBudgetRequest';
import AuditTrailBudgetRequest from './auditTrailBudgetRequest';
import budgetRequestService, { 
  CreateBudgetRequestDto, 
  ApprovalDto, 
  RejectionDto 
} from '../../../services/budgetRequest.service';
import { useAuth } from '../../../contexts/AuthContext';
import { BackButton } from '../../../Components/backButton';



interface BudgetRequestItem {
  id?: number;
  budget_request_id?: number;
  category_id?: number;
  description?: string;
  requested_amount: number;
  notes?: string;
  pr_item_id?: number;
}

interface BudgetRequest {
  id: number;
  request_code: string;
  department_id: string;
  department_name?: string;
  requested_by: string;
  requested_for?: string;
  request_date: string;
  total_amount: number;
  approved_amount?: number;
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
  itemAllocations?: any[];
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
}

const BudgetRequestPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [activeRow, setActiveRow] = useState<BudgetRequest | null>(null);
  const [availableCategories] = useState([
    'Operations',
    'Maintenance',
    'Marketing',
    'Training',
    'Equipment',
    'Infrastructure',
    'Other'
  ]);
  const [sortField, setSortField] = useState<keyof BudgetRequest>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filterSections: FilterSection[] = [
    {
      id: 'dateRange',
      title: 'Date Range',
      type: 'dateRange',
      defaultValue: { from: dateFrom, to: dateTo }
    },
    {
      id: 'status',
      title: 'Status',
      type: 'checkbox',
      options: [
        { id: 'PENDING', label: 'Pending' },
        { id: 'APPROVED', label: 'Approved' },
        { id: 'REJECTED', label: 'Rejected' },
        { id: 'ADJUSTED', label: 'Adjusted' },
        { id: 'CLOSED', label: 'Closed' }
      ]
    },
    {
      id: 'category',
      title: 'Category',
      type: 'checkbox',
      options: availableCategories.map(cat => ({
        id: cat,
        label: cat
      }))
    }
  ];

  // Handle filter application
  const handleFilterApply = (filterValues: Record<string, string | string[] | {from: string; to: string}>) => {
    // Date range filter
    if (filterValues.dateRange && typeof filterValues.dateRange === 'object') {
      const dateRange = filterValues.dateRange as { from: string; to: string};
      setDateFrom(dateRange.from);
      setDateTo(dateRange.to);
    }
    
    // Status filter
    if (filterValues.status && Array.isArray(filterValues.status)) {
      setStatusFilter(filterValues.status.join(','));
    } else {
      setStatusFilter('');
    }

    // Category filter
    if (filterValues.category && Array.isArray(filterValues.category)) {
      setCategoryFilter(filterValues.category.join(','));
    } else {
      setCategoryFilter('');
    }

    // Reset pagination
    setCurrentPage(1);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build params object, only include defined values
        const params: any = {
          page: currentPage,
          limit: pageSize,
          sortBy: sortField,
          sortOrder: sortOrder
        };
        
        // Only add optional params if they have values
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        
        const response = await budgetRequestService.list(params);
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          showError(response.error || 'Failed to load budget requests', 'Error');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        showError(error.message || 'Failed to load budget requests', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, search, statusFilter, categoryFilter, dateFrom, dateTo, sortField, sortOrder]);

  // Helper function to get primary category from items
  const getBudgetCategory = (items?: BudgetRequestItem[]) => {
    if (!items || items.length === 0) return 'Uncategorized';
    
    // Get unique categories from items
    const categories = items
      .map(item => item.category_id)
      .filter(cat => cat !== null && cat !== undefined);
    
    if (categories.length === 0) return 'Uncategorized';
    
    // Map category IDs to names (you may need to adjust based on your category mapping)
    const categoryNames = availableCategories;
    const firstCategoryId = categories[0];
    
    // If all items have the same category, return that category
    if (categories.every(cat => cat === firstCategoryId)) {
      return categoryNames[firstCategoryId - 1] || 'Other';
    }
    
    // If items have different categories, return "Multiple"
    return 'Multiple Categories';
  };

  // Filter and sort logic
  const filteredData = data.filter((item: BudgetRequest) => {
    const searchLower = search.toLowerCase();
    const categoryName = getBudgetCategory(item.items);

    const matchesSearch = search === '' || 
      (item.purpose && item.purpose.toLowerCase().includes(searchLower)) ||
      (item.remarks && item.remarks.toLowerCase().includes(searchLower)) ||
      item.status.toLowerCase().includes(searchLower) ||
      item.requested_by.toLowerCase().includes(searchLower) ||
      (item.department_name && item.department_name.toLowerCase().includes(searchLower)) ||
      categoryName.toLowerCase().includes(searchLower) ||
      item.total_amount.toString().includes(searchLower) ||
      item.request_code.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter ? 
      statusFilter.split(',').some(status => item.status === status.trim()) : true;

    const itemDate = new Date(item.created_at).toISOString().split('T')[0];
    const matchesDate = (!dateFrom || itemDate >= dateFrom) && 
      (!dateTo || itemDate <= dateTo);

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const indexOfLastRecord = currentPage * pageSize;
  const indexOfFirstRecord = indexOfLastRecord - pageSize;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Status badge component using unified chip styling
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusClass = (status: string) => {
      switch (status) {
        case 'PENDING': return 'pending-approval';
        case 'APPROVED': return 'Approved';
        case 'REJECTED': return 'Rejected';
        case 'ADJUSTED': return 'Draft'; // Use Draft style for Adjusted
        case 'CLOSED': return 'Closed';
        default: return 'pending-approval';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'PENDING': return 'Pending';
        case 'APPROVED': return 'Approved';
        case 'REJECTED': return 'Rejected';
        case 'ADJUSTED': return 'Adjusted';
        case 'CLOSED': return 'Closed';
        default: return status;
      }
    };

    return (
      <span className={`chip ${getStatusClass(status)}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Action buttons based on status (Admin View)
  const getActionButtons = (item: BudgetRequest) => {
    const buttons = [];

    // View button (always available)
    buttons.push(
      <button 
        key="view"
        className="viewBtn" 
        onClick={() => handleView(item)}
        title="View Request"
      >
        <i className="ri-eye-line" />
      </button>
    );

    switch (item.status) {
      case 'PENDING':
        // Pending requests can be edited or deleted before approval
        buttons.push(
          <button 
            key="edit"
            className="editBtn" 
            onClick={() => handleEdit(item)}
            title="Edit Request"
          >
            <i className="ri-edit-2-line" />
          </button>,
          <button 
            key="delete"
            className="deleteBtn" 
            onClick={() => handleDelete(item.id)}
            title="Delete Request"
          >
            <i className="ri-delete-bin-line" />
          </button>
        );
        break;
    }

    return buttons;
  };


  // Add Budget Request - Updated to match new schema
  const handleAddBudgetRequest = async (newRequest: any) => {
    setLoading(true);
    try {
      console.log('Original newRequest received:', newRequest);
      console.log('Items from newRequest:', newRequest.items);
      
      const createDto: CreateBudgetRequestDto = {
        department_id: user?.department || 'operations',
        department_name: user?.department || 'Operations',
        requested_by: user?.username || 'Unknown User',
        requested_for: newRequest.requested_for,
        total_amount: newRequest.amountRequested || newRequest.total_amount || 0,
        purpose: newRequest.purpose,
        remarks: newRequest.justification || newRequest.remarks,
        request_type: (newRequest.priority === 'urgent' ? 'URGENT' : 
                      newRequest.priority === 'high' ? 'PROJECT_BASED' : 
                      'REGULAR') as 'REGULAR' | 'PROJECT_BASED' | 'URGENT' | 'EMERGENCY',
        pr_reference_code: newRequest.pr_reference_code,
        items: newRequest.items
      };
      
      console.log('CreateDTO being sent:', createDto);
      console.log('Items in DTO:', createDto.items);
      
      const response = await budgetRequestService.create(createDto);
      
      if (response.success && response.data) {
        // Refresh the list by re-fetching
        const listResponse = await budgetRequestService.list({
          page: currentPage,
          limit: pageSize
        });
        
        if (listResponse.success && listResponse.data) {
          setData(listResponse.data);
        }
        
        showSuccess('Budget request created successfully', 'Success');
        closeModal();
      } else {
        showError(response.error || 'Failed to create budget request', 'Error');
      }
    } catch (error: any) {
      console.error('Error creating budget request:', error);
      showError(error.message || 'Failed to create budget request', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, formData: any) => {
    console.log('handleUpdate called with:', id, formData);
    
    try {
      setLoading(true);
      
      const response = await budgetRequestService.update(id, formData);
      
      if (response.success) {
        // Refresh the list
        const listResponse = await budgetRequestService.list({
          page: currentPage,
          limit: pageSize
        });
        
        if (listResponse.success && listResponse.data) {
          setData(listResponse.data);
        }
        
        showSuccess('Budget request updated successfully', 'Success');
        closeModal();
      } else {
        showError(response.error || 'Failed to update budget request', 'Error');
      }
    } catch (error: any) {
      console.error('Error updating budget request:', error);
      showError(error.message || 'Failed to update budget request', 'Error');
    } finally {
      setLoading(false);
    }
  };


  // Modal Manager Functions
  const openModal = (mode: 'view' | 'add' | 'edit' | 'audit', rowData?: BudgetRequest) => {
    let content;

    switch (mode) {
      case 'view':
        content = (
          <ViewBudgetRequest
            request={rowData!}
            onClose={closeModal}
            onEdit={(request) => {
              console.log('Edit request:', request);
              closeModal();
              // You can open edit modal here if needed
            }}
            onExport={(request) => {
              console.log('Export request:', request);
            }}
            showActions={true}
          />
        );
        break;
      case 'add':
        content = (
          <AddBudgetRequest
            onClose={closeModal}
            onAddBudgetRequest={handleAddBudgetRequest}
            currentUser="ftms_user"
          />
        );
        break;
      case 'audit':
        content = (
          <AuditTrailBudgetRequest
            requestId={rowData!.request_code}
            requestTitle={rowData!.purpose || 'Budget Request'}
            onClose={closeModal}
          />
        );
        break;
      case 'edit':
        content = (
          <EditBudgetRequest
            request={rowData!}
            onClose={closeModal}
            onUpdate={handleUpdate}
          />
        );
        break;
      default:
        content = null;
    }

    setModalContent(content);
    setActiveRow(rowData || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setActiveRow(null);
  };


  // Action handlers
  const handleView = async (item: BudgetRequest) => {
    try {
      // Fetch full details including itemAllocations
      console.log('Fetching full budget request details for ID:', item.id);
      const response = await budgetRequestService.getById(item.id);
      
      if (response.success && response.data) {
        openModal('view', response.data);
      } else {
        showError('Failed to load budget request details', 'Error');
      }
    } catch (error: any) {
      console.error('Error fetching budget request details:', error);
      showError('Failed to load budget request details', 'Error');
    }
  };

  const handleEdit = (item: BudgetRequest) => {
    console.log('Edit:', item);
    openModal('edit', item);
  };

  const handleDelete = async (requestId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the budget request permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#961C1E',
      cancelButtonColor: '#FEB71F',
      reverseButtons: true,
      confirmButtonText: 'Yes, delete it!',
      background: 'white',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await budgetRequestService.delete(requestId);
        
        if (response.success) {
          setData(prev => prev.filter(item => item.id !== requestId));
          showSuccess('Request deleted successfully', 'Deleted');
        } else {
          showError(response.error || 'Failed to delete request', 'Error');
        }
      } catch (error: any) {
        console.error('Delete error:', error);
        showError(error.message || 'Failed to delete request', 'Error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (requestId: number) => {
    const result = await Swal.fire({
      title: 'Submit for Approval?',
      text: 'Once submitted, you cannot edit this request.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#13CE66',
      cancelButtonColor: '#FEB71F',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Submit',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await budgetRequestService.submit(requestId);
        
        if (response.success && response.data) {
          setData(prev => prev.map(item => 
            item.id === requestId ? response.data! : item
          ));
          showSuccess('Request submitted for approval', 'Success');
        } else {
          showError(response.error || 'Failed to submit request', 'Error');
        }
      } catch (error: any) {
        console.error('Submit error:', error);
        showError(error.message || 'Failed to submit request', 'Error');
      } finally {
        setLoading(false);
      }
    }
  };

  // New admin functions
  const handleApprove = async (requestId: number) => {
    const result = await Swal.fire({
      title: 'Approve Budget Request?',
      text: 'This will approve the budget request and allocate funds.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#13CE66',
      cancelButtonColor: '#FEB71F',
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Approve',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const approvalData: ApprovalDto = {
          rejection_reason: 'Approved by Finance Admin'
        };
        
        const response = await budgetRequestService.approve(requestId, approvalData);
        
        if (response.success && response.data) {
          setData(prev => prev.map(item => 
            item.id === requestId ? response.data! : item
          ));
          showSuccess('Request approved successfully', 'Approved');
        } else {
          showError(response.error || 'Failed to approve request', 'Error');
        }
      } catch (error: any) {
        console.error('Approve error:', error);
        showError(error.message || 'Failed to approve request', 'Error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (requestId: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Budget Request',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter reason for rejection...',
      inputAttributes: {
        'aria-label': 'Enter reason for rejection'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#FF4949',
      cancelButtonColor: '#FEB71F',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason for rejection!'
        }
      }
    });

    if (reason) {
      setLoading(true);
      try {
        const rejectionData: RejectionDto = {
          rejection_reason: reason
        };
        
        const response = await budgetRequestService.reject(requestId, rejectionData);
        
        if (response.success && response.data) {
          setData(prev => prev.map(item => 
            item.id === requestId ? response.data! : item
          ));
          showSuccess('Request rejected successfully', 'Rejected');
        } else {
          showError(response.error || 'Failed to reject request', 'Error');
        }
      } catch (error: any) {
        console.error('Reject error:', error);
        showError(error.message || 'Failed to reject request', 'Error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportSingle = (item: BudgetRequest) => {
    console.log('Export single:', item);
    showSuccess(`Exporting request ${item.request_code}...`, 'Export Started');
    // Implement single request export
  };

    const handleAuditTrail = (requestId: number) => {
        const request = data.find(item => item.id === requestId);
        if (request) {
            openModal('audit', request);
        }
    };

  // Export functions
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log('Export format:', format);
    showSuccess(`Exporting data as ${format.toUpperCase()}...`, 'Export Started');
    // Implement export functionality based on format
  };

  // Sort handler
  const handleSort = (field: keyof BudgetRequest) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };


  if (loading) {
    return (
      <>
        {/* Back Button */}
      {/* Back Button */}
      <div style={{display: 'flex', flex: 1, width:'100%', paddingLeft: 30, paddingTop: 10, paddingBottom: 10}}>
        <div style={{ display: 'flex', top: '1rem', left: '1rem', zIndex: 10 }}>
          <BackButton variant="default" size="default" aria-label="Go back" />
        </div>
      </div>
        <div className="card">
          <h1 className="title">Budget Request</h1>
          <Loading />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Back Button */}
      <div style={{display: 'flex', flex: 1, width:'100%', paddingLeft: 30, paddingTop: 10, paddingBottom: 10}}>
        <div style={{ display: 'flex', top: '1rem', left: '1rem', zIndex: 10 }}>
          <BackButton variant="default" size="default" aria-label="Go back" />
        </div>
      </div>
     
      
      <div className="card">
      <div className="elements">
        <div className="title">
          <h1>Budget Requests</h1>
        </div>
        
        <div className="settings">
          <div className="search-filter-container">
            {/* Search bar */}
            <div className="searchBar">
              <i className="ri-search-line" />
              <input
                className="searchInput"
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <FilterDropdown
              sections={filterSections}
              onApply={handleFilterApply}
              initialValues={{
                dateRange: { from: dateFrom, to: dateTo },
                status: statusFilter ? statusFilter.split(',') : [],
                category: categoryFilter ? categoryFilter.split(',') : []
              }}
            />
          </div>

          <div className="filters">
            {/* Add New Request */}
            <button onClick={() => openModal('add')} id="addButton" className="addButton">
                <i className="ri-add-line" />New Request
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th onClick={() => handleSort('department_name')} className="sortable">
                    Department
                    {sortField === 'department_name' && (
                      <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('created_at')} className="sortable">
                    Request Date
                    {sortField === 'created_at' && (
                      <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('request_type')} className="sortable">
                    Request Type
                    {sortField === 'request_type' && (
                      <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('aggregated_requested_amount')} className="sortable">
                    Requested Amount
                    {sortField === 'aggregated_requested_amount' && (
                      <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('aggregated_approved_amount')} className="sortable">
                    Approved Amount
                    {sortField === 'aggregated_approved_amount' && (
                      <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable sticky-status">
                    Status
                    {sortField === 'status' && (
                      <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`} />
                    )}
                  </th>
                  <th className="sticky-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((item, index) => (
                  <tr 
                    key={item.id}
                    onClick={(e) => {
                        // Prevent row click when clicking on action buttons
                        if (!(e.target as HTMLElement).closest('.actionButtonsContainer')) {
                        handleView(item);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{item.department_name || 'N/A'}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <span className={`priority-badge priority-${item.request_type?.toLowerCase()}`}>
                        {item.request_type}
                      </span>
                    </td>
                    <td className="amount-cell">
                      ₱{Number(item.aggregated_requested_amount || item.total_amount).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </td>
                    <td className="amount-cell">
                      {item.aggregated_approved_amount !== null && item.aggregated_approved_amount !== undefined && item.aggregated_approved_amount > 0 ? (
                        <span className="approved-amount">
                          ₱{Number(item.aggregated_approved_amount).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>
                      ) : (
                        <span className="not-approved">-</span>
                      )}
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="actionButtons">
                      <div className="actionButtonsContainer">
                        {getActionButtons(item)}
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
            {currentRecords.length === 0 && !loading && (
              <p className="noRecords">No budget requests found.</p>
            )}
          </div>
        </div>

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

        {/* Modal Manager - Render active modal */}
        {isModalOpen && modalContent}
      </div>
    </div>
    </>
  );
};

export default BudgetRequestPage;