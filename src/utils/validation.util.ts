// src/utils/validation.util.ts
import Joi from 'joi';

export const budgetRequestSchema = Joi.object({
  // Accept both formats for backwards compatibility
  department: Joi.string()
    .valid('finance', 'hr', 'inventory', 'operations')
    .optional(),
  
  department_id: Joi.string()
    .valid('finance', 'hr', 'inventory', 'operations')
    .optional(),
  
  department_name: Joi.string().optional(),
  
  // Accept both formats
  amountRequested: Joi.number()
    .positive()
    .max(10000000)
    .optional(),
  
  total_amount: Joi.number()
    .positive()
    .max(10000000)
    .optional(),
  
  purpose: Joi.string()
    .min(10)
    .max(500)
    .optional(),
  
  remarks: Joi.string()
    .max(5000)
    .optional(),
  
  request_type: Joi.string()
    .valid('REGULAR', 'PROJECT_BASED', 'URGENT', 'EMERGENCY')
    .optional(),
  
  requestType: Joi.string()
    .valid('REGULAR', 'PROJECT_BASED', 'URGENT', 'EMERGENCY')
    .optional(),
  
  status: Joi.string()
    .valid('PENDING', 'APPROVED', 'REJECTED', 'ADJUSTED', 'CLOSED')
    .optional(),
  
  requested_for: Joi.string().optional(),
  
  pr_reference_code: Joi.string().optional(),
  linkedPurchaseRequestRefNo: Joi.string().optional(),
  
  items: Joi.array()
    .items(
      Joi.object({
        // New schema fields
        category_id: Joi.number().optional(),
        description: Joi.string().optional(),
        requested_amount: Joi.number().min(0).optional(),
        notes: Joi.string().optional(),
        pr_item_id: Joi.number().optional(),
        
        // Old naming conventions for backward compatibility
        itemName: Joi.string().optional(),
        item_name: Joi.string().optional(),
        quantity: Joi.number().positive().optional(),
        unitCost: Joi.number().min(0).optional(),
        unit_cost: Joi.number().min(0).optional(),
        totalCost: Joi.number().min(0).optional(),
        subtotal: Joi.number().min(0).optional(),
        supplierId: Joi.string().optional(),
        supplier_id: Joi.string().optional(),
        supplierName: Joi.string().optional(),
        supplier: Joi.string().optional(),
        unit_measure: Joi.string().optional()
      })
    )
    .optional(),
  
  supporting_documents: Joi.array().optional(),
  attachments: Joi.array().optional()
}).unknown(true).or('department', 'department_id').or('amountRequested', 'total_amount'); // Allow additional fields and require at least one key field

export function validateBudgetRequest(data: any) {
  return budgetRequestSchema.validate(data, { abortEarly: false });
}

export const approvalSchema = Joi.object({
  remarks: Joi.string().min(10).max(2000).optional(),
  reviewNotes: Joi.string().min(10).max(2000).optional() // backward compatibility
});

export const rejectionSchema = Joi.object({
  rejection_reason: Joi.string().min(10).max(2000).required(),
  reviewNotes: Joi.string().min(10).max(2000).optional() // backward compatibility
});
