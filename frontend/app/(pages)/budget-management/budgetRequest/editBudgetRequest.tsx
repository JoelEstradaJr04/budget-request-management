'use client';

import React, { useState, useEffect } from 'react';
import "@/styles/budget-management/addBudgetRequest.css";
import { formatDate } from '../../../utils/dateFormatter';
import { showSuccess, showError, showConfirmation } from '../../../utils/Alerts';
import { validateField, isValidAmount, ValidationRule } from "../../../utils/validation";
import ModalHeader from '../../../Components/ModalHeader';
import ItemTableModal, { ItemField } from '../../../Components/ItemTableModal';
import ModalManager from '../../../Components/modalManager';

// Types
interface BudgetItem {
  id?: number;
  category_id?: number;
  description?: string;
  requested_amount: number;
  notes?: string;
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
  status: string;
  purpose?: string;
  remarks?: string;
  request_type: string;
  pr_reference_code?: string;
  fiscalYear?: number;
  fiscalPeriod?: string;
  category?: string;
  priority?: string;
  urgencyReason?: string;
  start_date?: string;
  end_date?: string;
  items?: BudgetItem[];
  created_at: string;
  updated_at?: string;
}

interface EditBudgetRequestProps {
  request: BudgetRequest;
  onClose: () => void;
  onUpdate: (id: number, formData: any) => void;
}

type FieldName = 'purpose' | 'justification' | 'amountRequested' | 'start_date' | 'end_date' | 'fiscalPeriod' | 'category' | 'priority' | 'urgencyReason';

const EditBudgetRequest: React.FC<EditBudgetRequestProps> = ({
  request,
  onClose,
  onUpdate
}) => {
  const isPRLinked = !!request.pr_reference_code;

  const [formData, setFormData] = useState({
    purpose: request.purpose || '',
    justification: request.remarks || '',
    department: request.department_name || '',
    createdByName: request.requested_by || '',
    createdByRole: 'Admin',
    fiscalYear: request.fiscalYear || new Date().getFullYear(),
    fiscalPeriod: request.fiscalPeriod || '',
    category: request.category || '',
    priority: request.priority || '',
    urgencyReason: request.urgencyReason || '',
    amountRequested: request.total_amount || 0,
    start_date: request.start_date || '',
    end_date: request.end_date || '',
  });

  const [items, setItems] = useState<BudgetItem[]>(request.items || []);
  const [showItems, setShowItems] = useState((request.items?.length || 0) > 0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  const validationRules: Record<FieldName, ValidationRule> = {
    purpose: { required: true, label: "Budget Purpose", min: 10, max: 500 },
    justification: { required: true, label: "Justification", max: 5000 },
    amountRequested: { required: true, min: 0.01, max: 10000000, label: "Amount Requested" },
    start_date: { required: false, label: "Start Date" },
    end_date: { required: false, label: "End Date" },
    fiscalPeriod: { required: true, label: "Fiscal Period" },
    category: { required: true, label: "Category" },
    priority: { required: false, label: "Priority" },
    urgencyReason: { required: false, label: "Urgency Reason", max: 1000 }
  };

  const validateForm = (data: typeof formData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (data.purpose.length < 10) errors.purpose = 'Purpose must be at least 10 characters';
    if (data.amountRequested <= 0) errors.amountRequested = 'Amount must be greater than 0';
    if (!data.fiscalPeriod) errors.fiscalPeriod = 'Fiscal period is required';
    if (!data.category) errors.category = 'Category is required';
    
    if (showItems && items.length > 0) {
      const itemsTotal = items.reduce((sum, item) => sum + item.requested_amount, 0);
      if (data.amountRequested < itemsTotal) {
        errors.amountRequested = `Amount must be at least ₱${itemsTotal.toLocaleString()}`;
      }
    }
    
    if (data.start_date && data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
      errors.end_date = 'End date must be after start date';
    }
    
    return errors;
  };

  useEffect(() => {
    const errors = validateForm(formData);
    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountRequested' ? parseFloat(value) || 0 : value
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      description: '',
      requested_amount: 0,
      notes: '',
      item_code: '',
      item_name: '',
      department: formData.department,
      unit_measure: '',
      supplier_code: '',
      supplier_name: '',
      supplier_unit_measure: '',
      conversion_factor: 1,
      unit_price: 0,
      quantity: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(value) : (updated[index].quantity || 0);
        const price = field === 'unit_price' ? Number(value) : (updated[index].unit_price || 0);
        updated[index].requested_amount = qty * price;
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      showError('Please fix all validation errors', 'Validation Error');
      return;
    }

    const result = await showConfirmation('Are you sure you want to save these changes?', 'Confirm Update');

    if (result.isConfirmed) {
      try {
        await onUpdate(request.id, {
          purpose: formData.purpose,
          remarks: formData.justification,
          total_amount: formData.amountRequested,
          fiscalPeriod: formData.fiscalPeriod,
          category: formData.category,
          priority: formData.priority,
          urgencyReason: formData.urgencyReason,
          start_date: formData.start_date,
          end_date: formData.end_date,
          items: showItems && items.length > 0 ? items : undefined
        });
        showSuccess('Budget request updated successfully', 'Success');
        onClose();
      } catch (error) {
        showError('Failed to update budget request: ' + (error instanceof Error ? error.message : ''), 'Error');
      }
    }
  };

  // Map budget items to ItemTableModal format
  const mapItemsToTableFormat = (): ItemField[] => {
    return items.map(item => ({
      code: request.pr_reference_code || '',
      department: item.department || formData.department,
      item_code: item.item_code || 'N/A',
      item_name: item.item_name || '',
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
      <div className="addBudgetRequestModal">
        <ModalHeader title="Edit Budget Request" onClose={onClose} showDateTime={true} />

        <form onSubmit={handleSubmit}>
          <div className="modalContent">
            <div className="formInputs">
              
              {/* Request Information - NOT EDITABLE */}
              <div className="sectionHeader">Request Information (Read-only)</div>
              
              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label>Department</label>
                  <input type="text" value={formData.department} readOnly disabled className="formInput" />
                </div>
                <div className="formField formFieldHalf">
                  <label>Requester Name</label>
                  <input type="text" value={formData.createdByName} readOnly disabled className="formInput" />
                </div>
              </div>

              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label>Request Date</label>
                  <input type="text" value={formatDate(request.request_date)} readOnly disabled className="formInput" />
                </div>
                <div className="formField formFieldHalf">
                  <label>Request Code</label>
                  <input type="text" value={request.request_code} readOnly disabled className="formInput" />
                </div>
              </div>

              {/* Budget Details - EDITABLE */}
              <div className="sectionHeader">Budget Details (Editable)</div>
              
              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label>Fiscal Period<span className='requiredTags'> *</span></label>
                  <select name="fiscalPeriod" value={formData.fiscalPeriod} onChange={handleInputChange} required className="formSelect">
                    <option value="">Select Period</option>
                    <option value="Q1">Quarter 1 (Q1)</option>
                    <option value="Q2">Quarter 2 (Q2)</option>
                    <option value="Q3">Quarter 3 (Q3)</option>
                    <option value="Q4">Quarter 4 (Q4)</option>
                    <option value="H1">Half 1 (H1)</option>
                    <option value="H2">Half 2 (H2)</option>
                    <option value="FY">Full Year (FY)</option>
                  </select>
                  {validationErrors.fiscalPeriod && <div className="error-message">{validationErrors.fiscalPeriod}</div>}
                </div>
                
                <div className="formField formFieldHalf">
                  <label>Category<span className='requiredTags'> *</span></label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="formSelect">
                    <option value="">Select Category</option>
                    <option value="operational">Operational</option>
                    <option value="capital">Capital</option>
                    <option value="administrative">Administrative</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  {validationErrors.category && <div className="error-message">{validationErrors.category}</div>}
                </div>
              </div>

              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="formSelect">
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {(formData.priority === 'urgent' || formData.priority === 'high') && (
                  <div className="formField formFieldHalf">
                    <label>Urgency Reason<span className='requiredTags'> *</span></label>
                    <input
                      type="text"
                      name="urgencyReason"
                      value={formData.urgencyReason}
                      onChange={handleInputChange}
                      className="formInput"
                      placeholder="Explain why this is urgent"
                      maxLength={1000}
                    />
                    {validationErrors.urgencyReason && <div className="error-message">{validationErrors.urgencyReason}</div>}
                  </div>
                )}
              </div>

              <div className="formField">
                <label>Amount Requested<span className='requiredTags'> *</span></label>
                <input
                  type="number"
                  name="amountRequested"
                  value={formData.amountRequested}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="formInput"
                />
                {showItems && items.length > 0 && (
                  <span className="autofill-note">
                    Items total: ₱{items.reduce((sum, item) => sum + item.requested_amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                {validationErrors.amountRequested && <div className="error-message">{validationErrors.amountRequested}</div>}
              </div>

              <div className="formField">
                <label>Budget Purpose / Project Name<span className='requiredTags'> *</span></label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  className="formInput"
                  minLength={10}
                  maxLength={500}
                />
                <span className="helper-text">{formData.purpose.length}/500 characters (min: 10)</span>
                {validationErrors.purpose && <div className="error-message">{validationErrors.purpose}</div>}
              </div>

              <div className="formField">
                <label>Justification<span className='requiredTags'> *</span></label>
                <textarea
                  name="justification"
                  value={formData.justification}
                  onChange={handleInputChange}
                  required
                  className="formInput"
                  rows={4}
                  maxLength={5000}
                />
                <span className="helper-text">{formData.justification.length}/5000 characters</span>
              </div>

              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="formInput"
                  />
                </div>
                
                <div className="formField formFieldHalf">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="formInput"
                    min={formData.start_date}
                  />
                  {validationErrors.end_date && <div className="error-message">{validationErrors.end_date}</div>}
                </div>
              </div>

              {/* Budget Items Section */}
              <div className="itemsSection">
                <div className="itemsHeader">
                  <h3>Budget Items</h3>
                  {!isPRLinked && (
                    <button
                      type="button"
                      className="itemsToggle"
                      onClick={() => setShowItems(!showItems)}
                    >
                      <i className={`ri-${showItems ? 'eye-off' : 'eye'}-line`} />
                      {showItems ? 'Hide Items' : 'Show Items'}
                    </button>
                  )}
                </div>

                {isPRLinked && (
                  <div className="prLinkSection">
                    <p className="info-message">
                      <i className="ri-information-line" /> This request is linked to Purchase Request: <strong>{request.pr_reference_code}</strong>
                      <br />Items from PR are not editable.
                    </p>
                    <button
                      type="button"
                      className="showItemsBtn"
                      onClick={() => setShowItemsModal(true)}
                      style={{ marginTop: '10px' }}
                    >
                      <i className="ri-eye-line" /> Show Items
                    </button>
                  </div>
                )}

                {showItems && (
                  <>
                    {items.map((item, index) => (
                      <div key={index} className="itemContainer">
                        <div className="itemHeader">
                          <h4>Item #{index + 1}</h4>
                          {!isPRLinked && (
                            <button
                              type="button"
                              className="removeItemBtn"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              title="Remove Item"
                            >
                              <i className="ri-close-line" />
                            </button>
                          )}
                        </div>

                        <div className="itemGrid">
                          {isPRLinked ? (
                            <>
                              <div className="itemField">
                                <label>Item Code</label>
                                <input type="text" value={item.item_code || ''} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Item Name</label>
                                <input type="text" value={item.item_name || ''} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Department</label>
                                <input type="text" value={item.department || ''} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Unit Measure</label>
                                <input type="text" value={item.unit_measure || ''} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Quantity</label>
                                <input type="number" value={item.quantity || 0} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Unit Price</label>
                                <input type="number" value={item.unit_price || 0} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Subtotal</label>
                                <input type="number" value={item.requested_amount} readOnly disabled className="formInput calculated" />
                              </div>
                              <div className="itemField">
                                <label>Supplier Code</label>
                                <input type="text" value={item.supplier_code || ''} readOnly disabled className="formInput" />
                              </div>
                              <div className="itemField">
                                <label>Supplier Name</label>
                                <input type="text" value={item.supplier_name || ''} readOnly disabled className="formInput" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="itemField">
                                <label>Item Name<span className='requiredTags'> *</span></label>
                                <input
                                  type="text"
                                  value={item.item_name || ''}
                                  onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                  placeholder="Enter item name"
                                  required
                                />
                              </div>
                              <div className="itemField">
                                <label>Unit Measure<span className='requiredTags'> *</span></label>
                                <input
                                  type="text"
                                  value={item.unit_measure || ''}
                                  onChange={(e) => updateItem(index, 'unit_measure', e.target.value)}
                                  placeholder="e.g., pcs, kg, L"
                                  required
                                />
                              </div>
                              <div className="itemField">
                                <label>Quantity<span className='requiredTags'> *</span></label>
                                <input
                                  type="number"
                                  value={item.quantity || 0}
                                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                              <div className="itemField">
                                <label>Unit Price<span className='requiredTags'> *</span></label>
                                <input
                                  type="number"
                                  value={item.unit_price || 0}
                                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                              <div className="itemField">
                                <label>Subtotal</label>
                                <input
                                  type="number"
                                  value={item.requested_amount}
                                  readOnly
                                  className="formInput calculated"
                                />
                              </div>
                              <div className="itemField">
                                <label>Supplier</label>
                                <input
                                  type="text"
                                  value={item.supplier_name || ''}
                                  onChange={(e) => updateItem(index, 'supplier_name', e.target.value)}
                                  placeholder="Enter supplier name"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {!isPRLinked && (
                      <button
                        type="button"
                        className="addItemBtn"
                        onClick={addItem}
                      >
                        <i className="ri-add-line" /> Add Another Item
                      </button>
                    )}

                    {items.length > 0 && (
                      <div className="totalAmountDisplay">
                        <h3>Total Amount from Items</h3>
                        <div className="totalAmountValue">
                          ₱{items.reduce((sum, item) => sum + item.requested_amount, 0).toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="modalButtons">
            <button type="button" className="cancelButton" onClick={onClose}>
              <i className="ri-close-line" /> Cancel
            </button>
            <button type="submit" className="submitButton" disabled={!isFormValid}>
              <i className="ri-save-line" /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* ItemTableModal for PR-linked items */}
      {isPRLinked && showItemsModal && (
        <ItemTableModal
          isOpen={showItemsModal}
          onClose={() => setShowItemsModal(false)}
          mode="view"
          title={`Items from PR: ${request.pr_reference_code}`}
          items={mapItemsToTableFormat()}
          readOnlyFields={[]}
          requiredFields={[]}
          displayMode="PRLinked"
        />
      )}
    </div>
  );
};

export default EditBudgetRequest;
