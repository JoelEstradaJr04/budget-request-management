'use client';

import React, { useState } from 'react';
import "../../../styles/budget-management/viewBudgetRequest.css";
import { formatDate } from '../../../utils/formatting';
import ModalHeader from '../../../Components/ModalHeader';
import ItemTableModal, { ItemField } from '../../../Components/ItemTableModal';

// Types - using the same as your existing BudgetRequest interface
interface BudgetItem {
  id?: number;
  budget_request_id?: number;
  category_id?: number;
  description?: string;
  requested_amount: number;
  notes?: string;
  pr_item_id?: number;
  // Enhanced item fields for PR integration
  item_code?: string;
  item_name?: string;
  department?: string;
  unit_measure?: string;
  supplier_code?: string;
  supplier_name?: string;
  supplier_unit_measure?: string;
  conversion_factor?: number;
  unit_price?: number;
  quantity?: number;
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
  items?: BudgetItem[];
  created_at: string;
  updated_at?: string;
  is_deleted: boolean;
}

interface ViewBudgetRequestProps {
  request: BudgetRequest;
  onClose: () => void;
  onEdit?: (request: BudgetRequest) => void;
  onExport?: (request: BudgetRequest) => void;
  showActions?: boolean;
}

const ViewBudgetRequest: React.FC<ViewBudgetRequestProps> = ({ 
  request, 
  onClose, 
  onEdit, 
  onExport,
  showActions = true 
}) => {
  const [showItemsModal, setShowItemsModal] = useState(false);
  const isPRLinked = !!request.pr_reference_code;
  
  // Status badge component (reuse from your main page)
  const StatusBadge = ({ status }: { status: string }) => {
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

    const getStatusClass = (status: string) => {
      switch (status) {
        case 'PENDING': return 'pending-approval';
        case 'APPROVED': return 'Approved';
        case 'REJECTED': return 'Rejected';
        case 'ADJUSTED': return 'Draft';
        case 'CLOSED': return 'Closed';
        default: return 'pending-approval';
      }
    };

    return (
      <span className={`chip ${getStatusClass(status)}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Get items from request (simplified for new schema)
  const getItems = (): BudgetItem[] => {
    if (request.items && request.items.length > 0) {
      return request.items;
    }
    return [];
  };

  const items = getItems();

  // Calculate total from items if available
  const calculateItemsTotal = () => {
    if (items.length === 0) return 0;
    return items.reduce((total, item) => total + item.requested_amount, 0);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file download (placeholder)
  const handleFileDownload = (file: File | string, index: number) => {
    console.log('Download file:', file);
    // Implement actual download logic here
  };

  // Generate action history based on request status
  const getActionHistory = () => {
    const history = [
      {
        action: 'Request Created',
        user: request.requested_by,
        date: request.created_at,
        details: `Created with status ${request.status}`
      }
    ];

    if (request.status === 'APPROVED' && request.approved_at && request.approved_by) {
      history.push({
        action: 'Request Approved',
        user: request.approved_by,
        date: request.approved_at,
        details: 'Budget request approved'
      });
    }

    if (request.status === 'REJECTED' && request.rejected_by) {
      history.push({
        action: 'Request Rejected',
        user: request.rejected_by,
        date: request.rejected_at || request.updated_at || '',
        details: request.rejection_reason || 'No reason provided'
      });
    }

    if (request.status === 'CLOSED') {
      history.push({
        action: 'Request Closed',
        user: request.approved_by || 'System',
        date: request.updated_at || '',
        details: 'Budget request closed'
      });
    }

    return history;
  };

  // Map budget items to ItemTableModal format
  const mapItemsToTableFormat = (): ItemField[] => {
    if (!items || items.length === 0) return [];
    
    return items.map(item => ({
      code: request.pr_reference_code || '',
      department: item.department || request.department_name || '',
      item_code: item.item_code || 'N/A',
      item_name: item.item_name || item.description || '',
      unit_measure: item.unit_measure || '',
      supplier_code: item.supplier_code || 'N/A',
      supplier_name: item.supplier_name || '',
      supplier_unit_measure: item.supplier_unit_measure || '',
      conversion: item.conversion_factor || 1,
      unit_price: item.unit_price || 0,
      subtotal: item.requested_amount || 0,
      quantity: item.quantity || 0
    }));
  };

  return (
    <div className="modalOverlay">
      <div className="viewBudgetRequestModal">
        {/* Use ModalHeader component with custom content */}
        <div className="modalHeader">
          <div className="header-left">
            <h1>Budget Request Details</h1>
            <div className="statusBadgeHeader">
              <span className="statusLabel">Status:</span>
              <StatusBadge status={request.status} />
            </div>

            <div className="header-right">
                <button type="button" className="closeButton" onClick={onClose}>
                    <i className="ri-close-line"></i>
                </button>
            </div>
          </div>
          
          
        </div>

        <div className="modalContent">
          <div className="displayInputs">
            
            {/* Request Information Section */}
            <div className="sectionHeader">Request Information</div>
            
            <div className="displayRow">
              <div className="displayField displayFieldHalf">
                <label>Request Code</label>
                <div className="displayValue highlightValue">{request.request_code}</div>
              </div>
              
              <div className="displayField displayFieldHalf">
                <label>Date of Request</label>
                <div className="displayValue">{formatDate(new Date(request.request_date))}</div>
              </div>
            </div>

            <div className="displayRow">
              <div className="displayField displayFieldHalf">
                <label>Department</label>
                <div className="displayValue">{request.department_name || request.department_id}</div>
              </div>
              
              <div className="displayField displayFieldHalf">
                <label>Requested By</label>
                <div className="displayValue">{request.requested_by}</div>
              </div>
            </div>

            {request.requested_for && (
              <div className="displayRow">
                <div className="displayField">
                  <label>Requested For</label>
                  <div className="displayValue">{request.requested_for}</div>
                </div>
              </div>
            )}

            <div className="displayRow">
              <div className="displayField displayFieldHalf">
                <label>Request Type</label>
                <div className="displayValue">
                  <span className={`priority-badge priority-${request.request_type.toLowerCase()}`}>
                    {request.request_type}
                  </span>
                </div>
              </div>
              
              {request.pr_reference_code && (
                <div className="displayField displayFieldHalf">
                  <label>PR Reference</label>
                  <div className="displayValue">{request.pr_reference_code}</div>
                </div>
              )}
            </div>

            {/* Budget Details Section */}
            <div className="sectionHeader">Budget Details</div>
            
            <div className="displayRow">
              <div className="displayField">
                <label>Total Amount</label>
                <div className="displayValue highlightValue">
                  ₱{Number(request.total_amount).toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
            </div>

            {request.purpose && (
              <div className="displayField">
                <label>Purpose</label>
                <div className="displayValue highlightValue">{request.purpose}</div>
              </div>
            )}

            {request.remarks && (
              <div className="displayField">
                <label>Remarks</label>
                <div className="displayValue displayValueTextarea">{request.remarks}</div>
              </div>
            )}

            {/* Items Section */}
            {items && items.length > 0 && (
              <div className="itemsDisplaySection">
                <div className="itemsDisplayHeader">
                  <h3>Budget Items</h3>
                  <div className="itemsCount">{items.length} item{items.length !== 1 ? 's' : ''}</div>
                </div>

                <button
                  type="button"
                  className="showItemsBtn"
                  onClick={() => setShowItemsModal(true)}
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  <i className="ri-eye-line" /> View All Items
                </button>

                <div className="totalAmountDisplayView" style={{ marginTop: '15px' }}>
                  <h3>Total Amount from Items</h3>
                  <div className="totalAmountValueView">
                    ₱{calculateItemsTotal().toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                </div>
              </div>
            )}



            {/* Review Information */}
            {(request.status === 'APPROVED' || request.status === 'REJECTED') && (
              <>
                <div className="sectionHeader">Review Information</div>
                <div className="displayRow">
                  <div className="displayField displayFieldHalf">
                    <label>{request.status === 'APPROVED' ? 'Approved By' : 'Rejected By'}</label>
                    <div className="displayValue">{request.approved_by || request.rejected_by || 'Not specified'}</div>
                  </div>
                  
                  <div className="displayField displayFieldHalf">
                    <label>{request.status === 'APPROVED' ? 'Approval Date' : 'Rejection Date'}</label>
                    <div className="displayValue">
                      {request.status === 'APPROVED' && request.approved_at ? formatDate(new Date(request.approved_at)) :
                       request.status === 'REJECTED' && request.rejected_at ? formatDate(new Date(request.rejected_at)) :
                       <span className="displayValueEmpty">Not specified</span>}
                    </div>
                  </div>
                </div>

                {request.rejection_reason && (
                  <div className="displayField">
                    <label>{request.status === 'REJECTED' ? 'Rejection Reason' : 'Review Notes'}</label>
                    <div className="displayValue displayValueTextarea">{request.rejection_reason}</div>
                  </div>
                )}
              </>
            )}

            {/* Action History */}
            <div className="actionHistorySection">
              <div className="actionHistoryHeader">
                <h3>Action History</h3>
              </div>
              {getActionHistory().map((action, index) => (
                <div key={index} className="actionHistoryItem">
                  <div className="actionHistoryDetails">
                    <div className="actionHistoryAction">{action.action}</div>
                    <div className="actionHistoryMeta">
                      by {action.user} - {action.details}
                    </div>
                  </div>
                  <div className="actionHistoryDate">
                    {formatDate(new Date(action.date))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="modalButtons">
            {onExport && (
              <button className="exportButton" onClick={() => onExport(request)}>
                <i className="ri-download-line" /> Export
              </button>
            )}
            {onEdit && request.status === 'PENDING' && (
              <button className="editButton" onClick={() => onEdit(request)}>
                <i className="ri-edit-line" /> Edit
              </button>
            )}
          </div>
        )}
      </div>

      <ItemTableModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        mode="view"
        title="Budget Request Items"
        items={mapItemsToTableFormat()}
        isLinkedToPurchaseRequest={isPRLinked}
      />
    </div>
  );
};

export default ViewBudgetRequest;