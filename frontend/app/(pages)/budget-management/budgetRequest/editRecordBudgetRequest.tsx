'use client';

import React, { useState, useEffect } from 'react';
import "../../../styles/budget-management/addBudgetRequest.css";
import { formatDate } from '../../../utils/formatting';
import { showSuccess, showError, showConfirmation } from '../../../utils/Alerts';
import { validateField, isValidAmount, ValidationRule } from "../../../utils/validation";
import ModalHeader from '../../../Components/ModalHeader';
import ItemTableModal, { ItemField } from '../../../Components/ItemTableModal';

// Types - Same as recordBudgetRequest but with onUpdate
interface BudgetItem {
    id?: number; // Added id for existing items
    category_id?: number;
    description?: string;
    requested_amount: number;
    notes?: string;
    // Enhanced item fields
    item_code?: string;
    item_name?: string;
    department?: string;
    unit_measure?: string;
    supplier_code?: string;
    supplier_name?: string;
    supplier_unit_measure?: string;
    conversion_factor?: number;
    unit_cost?: number;
    quantity?: number;
}

// Interface matching the structure of an existing request from the list
interface ExistingBudgetRequest {
    id: number;
    request_code: string;
    department_name?: string;
    requested_by: string;
    created_at: string;
    total_amount: number;
    status: string;
    purpose?: string;
    remarks?: string;
    request_type: string;
    pr_reference_code?: string;
    items?: BudgetItem[];
    // Add other fields that might come from the API
    fiscal_year?: number;
    fiscal_period?: string;
    category?: string;
    priority?: string;
    urgency_reason?: string;
    start_date?: string;
    end_date?: string;
    requested_for?: string;
    position?: string;
}

interface EditBudgetRequestProps {
    request: ExistingBudgetRequest;
    onClose: () => void;
    onUpdate: (id: number, formData: any) => void;
    currentUser?: string;
}

type FieldName = 'purpose' | 'justification' | 'amountRequested' | 'start_date' | 'end_date' | 'fiscalPeriod' | 'category' | 'priority' | 'urgencyReason';

const mockPrCodes = [
    'PR-2024-001',
    'PR-2024-002',
    'PR-2024-003',
    'PR-2024-004',
    'PR-2024-005',
    'PR-2024-006',
    'PR-2024-007',
    'PR-2024-008',
    'PR-2024-009',
    'PR-2024-010',
];

const EditRecordBudgetRequest: React.FC<EditBudgetRequestProps> = ({
    request,
    onClose,
    onUpdate,
    currentUser
}) => {
    console.log('EditBudgetRequest component mounted', { request, currentUser });

    const [formData, setFormData] = useState({
        purpose: '',
        justification: '',
        department: 'Finance',
        createdByName: '',
        createdByPosition: '',
        fiscalYear: 2025,
        fiscalPeriod: '',
        category: '',
        priority: '',
        urgencyReason: '',
        amountRequested: 0,
        start_date: '',
        end_date: '',
        createdBy: 999
    });

    const [items, setItems] = useState<BudgetItem[]>([]);
    const [showItems, setShowItems] = useState(false); // Initially false, can enable if items exist? Or keep hidden as per Add form default?
    const [isPRLinked, setIsPRLinked] = useState(false);
    const [prReferenceCode, setPrReferenceCode] = useState('');
    const [prCodeSearch, setPrCodeSearch] = useState('');
    const [showPrDropdown, setShowPrDropdown] = useState(false);
    const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]); // Handling existing docs might be tricky without URL
    const [dragOver, setDragOver] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [requestDate, setRequestDate] = useState('');

    // Populate form data from request prop
    useEffect(() => {
        if (request) {
            setFormData({
                purpose: request.purpose || '',
                justification: request.remarks || '',
                department: request.department_name || 'Finance',
                createdByName: request.requested_by || '',
                createdByPosition: request.position || 'Admin',
                fiscalYear: request.fiscal_year || 2025,
                fiscalPeriod: request.fiscal_period || '',
                category: request.category || '',
                priority: mapRequestTypeToPriority(request.request_type) || '',
                urgencyReason: request.urgency_reason || '',
                amountRequested: request.total_amount || 0,
                start_date: request.start_date ? new Date(request.start_date).toISOString().split('T')[0] : '',
                end_date: request.end_date ? new Date(request.end_date).toISOString().split('T')[0] : '',
                createdBy: 999
            });

            setRequestDate(request.created_at || new Date().toISOString());

            if (request.items && request.items.length > 0) {
                setItems(request.items);
                setShowItems(true);
            }

            if (request.pr_reference_code) {
                setIsPRLinked(true);
                setPrReferenceCode(request.pr_reference_code);
                setPrCodeSearch(request.pr_reference_code);
            }
        }
    }, [request]);

    const mapRequestTypeToPriority = (type: string) => {
        switch (type) {
            case 'URGENT': return 'urgent';
            case 'PROJECT_BASED': return 'high'; // Assuming mapping based on add logic
            case 'REGULAR': return 'medium'; // Default?
            case 'EMERGENCY': return 'urgent'; // Another mapping?
            default: return 'medium';
        }
    };

    const validationRules: Record<FieldName, ValidationRule> = {
        purpose: {
            required: true,
            label: "Budget Purpose",
            min: 10,
            max: 500
        },
        justification: {
            required: true,
            label: "Justification",
            max: 5000
        },
        amountRequested: {
            required: true,
            min: 0.01,
            max: 10000000,
            label: "Amount Requested",
            custom: (v: unknown) => {
                const numValue = typeof v === 'number' ? v : Number(v);
                if (!isValidAmount(numValue)) return "Amount must be greater than 0.";
                if (numValue > 10000000) return "Amount must not exceed ₱10,000,000.";
                return null;
            }
        },
        start_date: { required: false, label: "Start Date" },
        end_date: { required: false, label: "End Date" },
        fiscalPeriod: { required: true, label: "Fiscal Period" },
        category: { required: true, label: "Category" },
        priority: { required: false, label: "Priority" },
        urgencyReason: {
            required: false,
            label: "Urgency Reason",
            max: 1000
        }
    };

    // Comprehensive validation function
    const validateForm = (data: typeof formData, checkAllFields: boolean = false): Record<string, string> => {
        const errors: Record<string, string> = {};

        // Validate purpose
        if (!data.purpose || data.purpose.trim() === '') {
            if (checkAllFields) errors.purpose = 'Budget purpose is required';
        } else if (data.purpose.length < 10) {
            errors.purpose = 'Purpose must be at least 10 characters';
        } else if (data.purpose.length > 500) {
            errors.purpose = 'Purpose must not exceed 500 characters';
        }

        // Validate justification
        if (!data.justification || data.justification.trim() === '') {
            if (checkAllFields) errors.justification = 'Justification is required';
        } else if (data.justification.length > 5000) {
            errors.justification = 'Justification must not exceed 5000 characters';
        }

        // Validate amount
        if (data.amountRequested <= 0) {
            if (checkAllFields) errors.amountRequested = 'Amount must be greater than 0';
        } else if (data.amountRequested > 10000000) {
            errors.amountRequested = 'Amount must not exceed ₱10,000,000';
        }

        // Validate amount against items total
        if (showItems && items.length > 0) {
            const itemsTotal = calculateTotalFromItems();
            if (data.amountRequested < itemsTotal) {
                errors.amountRequested = `Amount must be at least ₱${itemsTotal.toLocaleString()} (items total)`;
            }
        }

        // Validate fiscal period
        if (!data.fiscalPeriod || data.fiscalPeriod === '') {
            if (checkAllFields) errors.fiscalPeriod = 'Fiscal period is required';
        }

        // Validate category
        if (!data.category || data.category === '') {
            if (checkAllFields) errors.category = 'Category is required';
        }

        // Validate urgency reason if priority is high or urgent
        if ((data.priority === 'high' || data.priority === 'urgent') && (!data.urgencyReason || data.urgencyReason.trim() === '')) {
            errors.urgencyReason = 'Urgency reason is required for high/urgent priority';
        } else if (data.urgencyReason && data.urgencyReason.length > 1000) {
            errors.urgencyReason = 'Urgency reason must not exceed 1000 characters';
        }

        // Validate date range
        if (data.start_date && data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            if (startDate >= endDate) {
                errors.end_date = 'End date must be after start date';
            }
        }

        return errors;
    };

    // Update validation state whenever form data changes
    useEffect(() => {
        const errors = validateForm(formData, false);
        setValidationErrors(errors);

        // Form is valid if there are no errors
        setIsFormValid(Object.keys(errors).length === 0);
    }, [formData, items, showItems]);

    // Calculate total from items
    const calculateTotalFromItems = () => {
        return items.reduce((total, item) => total + item.requested_amount, 0);
    };

    // Update amount requested when items change
    useEffect(() => {
        if (showItems && items.length > 0) {
            const itemsTotal = calculateTotalFromItems();

            // Auto-fill if amountRequested is 0 or less than items total
            if (formData.amountRequested === 0 || formData.amountRequested < itemsTotal) {
                setFormData(prev => ({ ...prev, amountRequested: itemsTotal }));
            }
        }
    }, [items, showItems]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newValue: string | number = value;

        if (name === 'amountRequested') {
            newValue = parseFloat(value) || 0;
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    // Item management functions
    // Note: addItem, removeItem, updateItem logic remains same
    const addItem = () => {
        setItems(prev => [...prev, {
            category_id: undefined,
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
            unit_cost: 0,
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

            // Auto-calculate requested_amount (subtotal) when quantity or unit_cost changes
            if (field === 'quantity' || field === 'unit_cost') {
                const item = updated[index];
                const qty = field === 'quantity' ? Number(value) : (item.quantity || 0);
                const price = field === 'unit_cost' ? Number(value) : (item.unit_cost || 0);
                updated[index].requested_amount = qty * price;
            }

            return updated;
        });
    };

    // File handling functions
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        addFiles(files);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const addFiles = (files: File[]) => {
        // Filter for allowed file types (documents and images)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        const validFiles = files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                showError(`File type not allowed: ${file.name}`, 'Invalid File');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showError(`File too large: ${file.name}. Maximum size is 10MB.`, 'File Too Large');
                return false;
            }
            return true;
        });

        setSupportingDocuments(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setSupportingDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();

        // Validate required fields
        const requiredFieldsToCheck: (keyof typeof formData)[] = ['purpose', 'justification', 'amountRequested', 'fiscalPeriod', 'category'];
        const missingFields = requiredFieldsToCheck.filter(field => {
            const value = formData[field];
            if (field === 'amountRequested') {
                return !value || Number(value) <= 0;
            }
            return !value || value === '';
        });



        if (missingFields.length > 0) {
            const fieldLabels = missingFields.map(f => validationRules[f as FieldName]?.label || f).join(', ');
            showError(`Please fill in all required fields: ${fieldLabels}`, 'Validation Error');
            return;
        }

        // Validate amount
        if (formData.amountRequested <= 0) {
            showError('Amount requested must be greater than 0', 'Invalid Amount');
            return;
        }

        // Validate amount against items total
        if (showItems && items.length > 0) {
            const itemsTotal = calculateTotalFromItems();
            if (formData.amountRequested < itemsTotal) {
                showError(
                    `Amount requested (₱${formData.amountRequested.toLocaleString()}) must be greater than or equal to items total (₱${itemsTotal.toLocaleString()})`,
                    'Invalid Amount'
                );
                return;
            }
        }

        const action = 'update request';
        console.log('Showing confirmation dialog for:', action);

        const result = await showConfirmation(
            `Are you sure you want to ${action}?`,
            `Confirm Update`
        );

        console.log('Confirmation result:', result);

        if (result.isConfirmed) {
            try {
                const payload = {
                    ...formData,
                    // Map back to API field names
                    total_amount: formData.amountRequested,
                    remarks: formData.justification,
                    status: 'PENDING', // Or keep existing status?
                    items: showItems && items.length > 0 ? items : undefined,
                    // New fields mapping
                    fiscal_year: formData.fiscalYear,
                    fiscal_period: formData.fiscalPeriod,
                    urgency_reason: formData.urgencyReason,
                    // Category, start_date, end_date are already in formData with correct keys
                };

                console.log('Sending payload:', payload);
                await onUpdate(request.id, payload);
                // showSuccess handled by parent
                // onClose handled by parent
            } catch (error: unknown) {
                console.error('Error updating budget request:', error);
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                showError('Failed to update budget request: ' + errorMessage, 'Error');
            }
        }
    };

    // Map budget items to ItemTableModal format
    const mapItemsToTableFormat = (): ItemField[] => {
        return items.map(item => ({
            item_name: item.item_name || '',
            unit_measure: item.unit_measure || '',
            quantity: item.quantity || 0,
            unit_cost: item.unit_cost || 0,
            supplier_name: item.supplier_name || '',
            subtotal: item.requested_amount || 0
        }));
    };

    // Handle saving items from modal
    const handleSaveItems = (updatedItems: ItemField[]) => {
        const mappedItems: BudgetItem[] = updatedItems.map(item => ({
            category_id: undefined, // Or preserve existing if editing existing item logic was there
            description: item.item_name || '',
            requested_amount: item.subtotal || 0,
            notes: '',
            item_code: '',
            item_name: item.item_name || '',
            department: formData.department,
            unit_measure: item.unit_measure || '',
            supplier_code: '',
            supplier_name: item.supplier_name || '',
            supplier_unit_measure: '',
            conversion_factor: 1,
            unit_cost: item.unit_cost || 0,
            quantity: item.quantity || 0
        }));
        setItems(mappedItems);
    };

    return (
        <div className="modalOverlay">
            <div className="addBudgetRequestModal">
                <ModalHeader
                    title="Edit Budget Request"
                    onClose={onClose}
                    showDateTime={true}
                />

                <form onSubmit={handleSubmit}>
                    <div className="modalContent">
                        <div className="formInputs">

                            {/* Basic Information Section */}
                            <div className="sectionHeader">Request Information</div>

                            <div className="formRow">
                                <div className="formField formFieldHalf">
                                    <label htmlFor="department">Department<span className='requiredTags'> *</span></label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                        className="formSelect"
                                        disabled={true}
                                    >
                                        <option value="Finance">Finance</option>
                                        <option value="HR">HR</option>
                                        <option value="Operational">Operational</option>
                                        <option value="Inventory">Inventory</option>
                                        {/* Add fallback option if current department is not in list */}
                                        <option value={formData.department} hidden>{formData.department}</option>
                                    </select>
                                </div>

                                <div className="formField formFieldHalf">
                                    <label htmlFor="createdByName">Requester Name</label>
                                    <input
                                        type="text"
                                        id="createdByName"
                                        name="createdByName"
                                        value={formData.createdByName}
                                        readOnly
                                        className="formInput"
                                    />
                                    <span className="autofill-note">Auto-filled based on requester</span>
                                </div>
                            </div>

                            <div className="formRow">
                                <div className="formField formFieldHalf">
                                    <label htmlFor="createdByPosition">Requester Position</label>
                                    <input
                                        type="text"
                                        id="createdByPosition"
                                        name="createdByPosition"
                                        value={formData.createdByPosition}
                                        readOnly
                                        className="formInput"
                                    />
                                    <span className="autofill-note">Auto-filled based on requester</span>
                                </div>

                                <div className="formField formFieldHalf">
                                    <label htmlFor="requestDate">Date of Request</label>
                                    <input
                                        type="text"
                                        id="requestDate"
                                        name="requestDate"
                                        value={formatDate(new Date(requestDate))}
                                        readOnly
                                        className="formInput"
                                    />
                                    <span className="autofill-note">Original request date</span>
                                </div>
                            </div>

                            <div className="formRow">
                                <div className="formField formFieldHalf">
                                    <label htmlFor="fiscalYear">Fiscal Year</label>
                                    <input
                                        type="number"
                                        id="fiscalYear"
                                        name="fiscalYear"
                                        value={formData.fiscalYear}
                                        readOnly
                                        className="formInput"
                                    />
                                    <span className="autofill-note">Auto-filled</span>
                                </div>
                            </div>

                            {/* Budget Details Section */}
                            <div className="sectionHeader">Budget Details</div>

                            <div className="formRow">
                                <div className="formField formFieldHalf">
                                    <label htmlFor="fiscalPeriod">Fiscal Period<span className='requiredTags'> *</span></label>
                                    <select
                                        id="fiscalPeriod"
                                        name="fiscalPeriod"
                                        value={formData.fiscalPeriod}
                                        onChange={handleInputChange}
                                        required
                                        className="formSelect"
                                    >
                                        <option value="">Select Fiscal Period</option>
                                        <option value="Q1">Quarter 1 (Q1)</option>
                                        <option value="Q2">Quarter 2 (Q2)</option>
                                        <option value="Q3">Quarter 3 (Q3)</option>
                                        <option value="Q4">Quarter 4 (Q4)</option>
                                        <option value="H1">Half 1 (H1)</option>
                                        <option value="H2">Half 2 (H2)</option>
                                        <option value="FY">Full Year (FY)</option>
                                    </select>
                                    {validationErrors.fiscalPeriod && (
                                        <div className="error-message">{validationErrors.fiscalPeriod}</div>
                                    )}
                                </div>

                                <div className="formField formFieldHalf">
                                    <label htmlFor="category">Category<span className='requiredTags'> *</span></label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="formSelect"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="operational">Operational</option>
                                        <option value="capital">Capital</option>
                                        <option value="administrative">Administrative</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                    {validationErrors.category && (
                                        <div className="error-message">{validationErrors.category}</div>
                                    )}
                                </div>
                            </div>

                            <div className="formRow">
                                <div className="formField formFieldHalf">
                                    <label htmlFor="priority">Priority</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="formSelect"
                                    >
                                        <option value="">Select Priority</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    {validationErrors.priority && (
                                        <div className="error-message">{validationErrors.priority}</div>
                                    )}
                                </div>

                                {(formData.priority === 'urgent' || formData.priority === 'high') && (
                                    <div className="formField formFieldHalf">
                                        <label htmlFor="urgencyReason">Urgency Reason<span className='requiredTags'> *</span></label>
                                        <input
                                            type="text"
                                            id="urgencyReason"
                                            name="urgencyReason"
                                            value={formData.urgencyReason}
                                            onChange={handleInputChange}
                                            className="formInput"
                                            placeholder="Explain why this is urgent"
                                            maxLength={1000}
                                        />
                                        {validationErrors.urgencyReason && (
                                            <div className="error-message">{validationErrors.urgencyReason}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="formField">
                                <label htmlFor="amountRequested">Amount Requested<span className='requiredTags'> *</span></label>
                                <input
                                    type="number"
                                    id="amountRequested"
                                    name="amountRequested"
                                    value={formData.amountRequested}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                    className="formInput"
                                    placeholder="0.00"
                                />
                                {showItems && items.length > 0 && (
                                    <span className="autofill-note">
                                        Auto-filled from items total: ₱{calculateTotalFromItems().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        {formData.amountRequested > calculateTotalFromItems() && (
                                            <span style={{ color: '#28a745', marginLeft: '8px' }}>
                                                (includes buffer: ₱{(formData.amountRequested - calculateTotalFromItems()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                            </span>
                                        )}
                                    </span>
                                )}
                                {validationErrors.amountRequested && (
                                    <div className="error-message">{validationErrors.amountRequested}</div>
                                )}
                            </div>

                            <div className="formField">
                                <label htmlFor="purpose">Budget Purpose / Project Name<span className='requiredTags'> *</span></label>
                                <input
                                    type="text"
                                    id="purpose"
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    required
                                    className="formInput"
                                    placeholder="Enter budget purpose or project name"
                                    minLength={10}
                                    maxLength={500}
                                />
                                <span className="helper-text">{formData.purpose.length}/500 characters (min: 10)</span>
                                {validationErrors.purpose && (
                                    <div className="error-message">{validationErrors.purpose}</div>
                                )}
                            </div>

                            <div className="formField">
                                <label htmlFor="justification">Justification<span className='requiredTags'> *</span></label>
                                <textarea
                                    id="justification"
                                    name="justification"
                                    value={formData.justification}
                                    onChange={handleInputChange}
                                    required
                                    className="formInput"
                                    placeholder="Provide detailed justification for this budget request"
                                    rows={4}
                                    maxLength={5000}
                                />
                                <span className="helper-text">{formData.justification.length}/5000 characters</span>
                                {validationErrors.justification && (
                                    <div className="error-message">{validationErrors.justification}</div>
                                )}
                            </div>

                            <div className="formRow">
                                <div className="formField formFieldHalf">
                                    <label htmlFor="start_date">Start Date<span className='requiredTags'> *</span></label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        required
                                        className="formInput"
                                    // Removed min constraint to allow old dates if needed in edit
                                    />
                                    {validationErrors.start_date && (
                                        <div className="error-message">{validationErrors.start_date}</div>
                                    )}
                                </div>

                                <div className="formField formFieldHalf">
                                    <label htmlFor="end_date">End Date<span className='requiredTags'> *</span></label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                        className="formInput"
                                        min={formData.start_date || new Date().toISOString().split('T')[0]} // Ensure end date is after start date
                                    />
                                    {validationErrors.end_date && (
                                        <div className="error-message">{validationErrors.end_date}</div>
                                    )}
                                </div>
                            </div>

                            {/* Items Section - Temporarily Disabled */}
                            {false && (
                                <div className="itemsSection">
                                    <div className="itemsHeader">
                                        <h3>Budget Items</h3>
                                    </div>

                                    {isPRLinked && (
                                        <div className="prLinkSection">
                                            <div className="formField" style={{ position: 'relative' }}>
                                                <label htmlFor="prReferenceCode">Purchase Request Code<span className='requiredTags'> *</span></label>
                                                <div className="prSearchContainer">
                                                    <input
                                                        type="text"
                                                        id="prReferenceCode"
                                                        value={prCodeSearch || prReferenceCode}
                                                        onChange={e => {
                                                            setPrCodeSearch(e.target.value);
                                                            setShowPrDropdown(true);
                                                        }}
                                                        onFocus={() => setShowPrDropdown(true)}
                                                        placeholder="Search or select PR code"
                                                        className="formInput"
                                                        autoComplete="off"
                                                    />
                                                    <button type="button" className="prSearchBtn" title="Search PR" tabIndex={-1}>
                                                        <i className="ri-search-line" />
                                                    </button>
                                                    {showPrDropdown && (
                                                        <div className="dropdown pr-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#fff', border: '1px solid #ccc', maxHeight: 180, overflowY: 'auto' }}>
                                                            {mockPrCodes.filter(code => (prCodeSearch ? code.toLowerCase().includes(prCodeSearch.toLowerCase()) : true)).length === 0 ? (
                                                                <div className="dropdown-item" style={{ padding: 8, color: '#888' }}>No results</div>
                                                            ) : (
                                                                mockPrCodes
                                                                    .filter(code => (prCodeSearch ? code.toLowerCase().includes(prCodeSearch.toLowerCase()) : true))
                                                                    .map(code => (
                                                                        <div
                                                                            key={code}
                                                                            className="dropdown-item"
                                                                            style={{ padding: 8, cursor: 'pointer' }}
                                                                            onMouseDown={() => {
                                                                                setPrReferenceCode(code);
                                                                                setPrCodeSearch(code);
                                                                                setShowPrDropdown(false);
                                                                            }}
                                                                        >
                                                                            {code}
                                                                        </div>
                                                                    ))
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="field-note">Select the Purchase Request code to link items</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Embedded ItemTableModal - shows different fields based on PR link status */}
                                    <ItemTableModal
                                        isOpen={true}
                                        onClose={() => { }}
                                        mode={isPRLinked ? "view" : "add"}
                                        title={isPRLinked ? "PR Items (View Only)" : "Manage Budget Items"}
                                        items={mapItemsToTableFormat()}
                                        onSave={handleSaveItems}
                                        readOnlyFields={isPRLinked ? ['code', 'department', 'item_code', 'supplier_code'] : []}
                                        requiredFields={['item_name', 'quantity', 'unit_measure', 'unit_cost', 'supplier_name']}
                                        isLinkedToPurchaseRequest={isPRLinked}
                                        embedded={true}
                                    />

                                    {items.length > 0 && (
                                        <div className="totalAmountDisplay">
                                            <h3>Total from {items.length} item(s)</h3>
                                            <div className="totalAmountValue">
                                                ₱{calculateTotalFromItems().toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Supporting Documents Section */}
                            <div className="sectionHeader">Supporting Documents (Optional)</div>

                            <div
                                className={`fileUploadSection ${dragOver ? 'dragOver' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <div className="fileUploadIcon">
                                    <i className="ri-upload-cloud-line" />
                                </div>
                                <div className="fileUploadText">
                                    Drag and drop files here, or click to select files
                                    <br />
                                    <small>Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 10MB each)</small>
                                </div>
                                <input
                                    type="file"
                                    className="fileInput"
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                    onChange={handleFileSelect}
                                    id="supportingDocuments"
                                />
                                <label htmlFor="supportingDocuments" className="fileUploadBtn">
                                    <i className="ri-attachment-line" /> Choose Files
                                </label>

                                {supportingDocuments.length > 0 && (
                                    <div className="fileList">
                                        <h4>Selected Files:</h4>
                                        {supportingDocuments.map((file, index) => (
                                            <div key={index} className="fileItem">
                                                <div>
                                                    <div className="fileName">{file.name}</div>
                                                    <div className="fileSize">{formatFileSize(file.size)}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="removeFileBtn"
                                                    onClick={() => removeFile(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modalButtons">
                        <button
                            type="button"
                            className="submitButton"
                            title={!isFormValid ? "Please fix all validation errors before updating" : "Update Request"}
                            onClick={handleSubmit}
                        >
                            <i className="ri-send-plane-line" /> Update Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRecordBudgetRequest;
