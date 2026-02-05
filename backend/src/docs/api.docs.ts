// ============================================================================
// API DOCUMENTATION - BUDGET REQUEST MICROSERVICE
// ============================================================================
// This file contains comprehensive JSDoc/Swagger annotations for all API endpoints.

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: System health check
 *     description: Returns the health status of the Budget Request Microservice including database connectivity.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               success: true
 *               message: Service is healthy
 *               timestamp: '2026-01-22T10:30:00Z'
 *               service: budget-request-microservice
 *               checks:
 *                 database: healthy
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Service is unhealthy
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */

/**
 * @swagger
 * /api:
 *   get:
 *     tags:
 *       - Health
 *     summary: API information
 *     description: Returns API version and available endpoints information.
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget Request Microservice API
 *                 version:
 *                   type: string
 *                   example: '2.0.0'
 *                 endpoints:
 *                   type: object
 */

// ============================================================================
// FINANCE ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/finance/admin/budget-requests:
 *   get:
 *     tags:
 *       - Finance Admin
 *     summary: Get all budget requests
 *     description: |
 *       Retrieves all budget requests from all departments. 
 *       Finance Admin has full visibility across all departments.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Records per page (max 100)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *         description: Filter by status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [REGULAR, PROJECT_BASED, URGENT, EMERGENCY]
 *         description: Filter by request type/priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in purpose, remarks, and request code
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget requests retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BudgetRequest'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - Finance Admin
 *     summary: Create budget request
 *     description: Creates a new budget request for the Finance department.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *           example:
 *             department_id: FINANCE
 *             department_name: Finance Department
 *             requested_by: user-123
 *             total_amount: 50000
 *             purpose: Office equipment purchase for Q1 2026
 *             remarks: Urgent requirement for new hires
 *             request_type: REGULAR
 *             items:
 *               - description: Laptop computers
 *                 requested_amount: 25000
 *                 notes: 5 units @ 5000 each
 *               - description: Office furniture
 *                 requested_amount: 25000
 *                 notes: Desks and chairs for new employees
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget request created successfully
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/finance/admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - Finance Admin
 *     summary: Get budget request by ID
 *     description: Retrieves a specific budget request by ID. Finance Admin can view requests from any department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget request ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget request retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/finance/admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - Finance Admin
 *     summary: Submit budget request
 *     description: Submits a DRAFT budget request for approval. Finance Admin can submit requests from any department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget request ID
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget request submitted successfully
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         description: Request is not in DRAFT status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// FINANCE ADMIN APPROVAL ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/finance/admin/approvals/{id}/approve:
 *   post:
 *     tags:
 *       - Finance Admin
 *     summary: Approve budget request
 *     description: Approves a PENDING budget request. Only Finance Admin can approve budget requests.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalRequest'
 *           example:
 *             remarks: Approved as requested
 *     responses:
 *       200:
 *         description: Budget request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget request approved successfully
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         description: Only pending budget requests can be approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/finance/admin/approvals/{id}/reject:
 *   post:
 *     tags:
 *       - Finance Admin
 *     summary: Reject budget request
 *     description: Rejects a PENDING budget request. A rejection reason is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Budget request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectionRequest'
 *           example:
 *             rejection_reason: Budget exceeds department allocation for this quarter
 *     responses:
 *       200:
 *         description: Budget request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget request rejected successfully
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         description: Only pending budget requests can be rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// FINANCE NON-ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/finance/non-admin/budget-requests:
 *   get:
 *     tags:
 *       - Finance Non-Admin
 *     summary: Get own budget requests
 *     description: Retrieves budget requests created by the authenticated user only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - Finance Non-Admin
 *     summary: Create budget request
 *     description: Creates a new budget request for the Finance department.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/finance/non-admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - Finance Non-Admin
 *     summary: Get own budget request by ID
 *     description: Retrieves a specific budget request if it belongs to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/finance/non-admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - Finance Non-Admin
 *     summary: Submit own budget request
 *     description: Submits the user's own DRAFT budget request for approval.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// HR ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/hr/admin/budget-requests:
 *   get:
 *     tags:
 *       - HR Admin
 *     summary: Get HR department budget requests
 *     description: Retrieves all budget requests from the HR department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - HR Admin
 *     summary: Create HR budget request
 *     description: Creates a new budget request for the HR department.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/hr/admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - HR Admin
 *     summary: Get HR budget request by ID
 *     description: Retrieves a specific HR department budget request by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/hr/admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - HR Admin
 *     summary: Submit HR budget request
 *     description: Submits an HR department DRAFT budget request for approval.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// HR NON-ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/hr/non-admin/budget-requests:
 *   get:
 *     tags:
 *       - HR Non-Admin
 *     summary: Get own HR budget requests
 *     description: Retrieves budget requests created by the authenticated HR user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - HR Non-Admin
 *     summary: Create HR budget request
 *     description: Creates a new budget request for the HR department.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/hr/non-admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - HR Non-Admin
 *     summary: Get own HR budget request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BudgetRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/hr/non-admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - HR Non-Admin
 *     summary: Submit own HR budget request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// INVENTORY ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/inventory/admin/budget-requests:
 *   get:
 *     tags:
 *       - Inventory Admin
 *     summary: Get Inventory department budget requests
 *     description: Retrieves all budget requests from the Inventory department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - Inventory Admin
 *     summary: Create Inventory budget request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/inventory/admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - Inventory Admin
 *     summary: Get Inventory budget request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/inventory/admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - Inventory Admin
 *     summary: Submit Inventory budget request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// INVENTORY NON-ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/inventory/non-admin/budget-requests:
 *   get:
 *     tags:
 *       - Inventory Non-Admin
 *     summary: Get own Inventory budget requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - Inventory Non-Admin
 *     summary: Create Inventory budget request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/inventory/non-admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - Inventory Non-Admin
 *     summary: Get own Inventory budget request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/inventory/non-admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - Inventory Non-Admin
 *     summary: Submit own Inventory budget request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// OPERATIONS ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/operations/admin/budget-requests:
 *   get:
 *     tags:
 *       - Operations Admin
 *     summary: Get Operations department budget requests
 *     description: Retrieves all budget requests from the Operations department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - Operations Admin
 *     summary: Create Operations budget request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/operations/admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - Operations Admin
 *     summary: Get Operations budget request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/operations/admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - Operations Admin
 *     summary: Submit Operations budget request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// OPERATIONS NON-ADMIN ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/operations/non-admin/budget-requests:
 *   get:
 *     tags:
 *       - Operations Non-Admin
 *     summary: Get own Operations budget requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ADJUSTED, CLOSED]
 *     responses:
 *       200:
 *         description: Budget requests retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags:
 *       - Operations Non-Admin
 *     summary: Create Operations budget request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget request created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/operations/non-admin/budget-requests/{id}:
 *   get:
 *     tags:
 *       - Operations Non-Admin
 *     summary: Get own Operations budget request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/operations/non-admin/budget-requests/{id}/submit:
 *   post:
 *     tags:
 *       - Operations Non-Admin
 *     summary: Submit own Operations budget request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget request submitted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/analytics/department/{department}/summary:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get department budget summary
 *     description: Returns aggregate statistics for a specific department's budget requests.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID (e.g., FINANCE, HR, INVENTORY, OPERATIONS)
 *         example: FINANCE
 *       - in: query
 *         name: fiscalYear
 *         schema:
 *           type: string
 *         description: Filter by fiscal year
 *         example: '2026'
 *       - in: query
 *         name: fiscalPeriod
 *         schema:
 *           type: string
 *         description: Filter by fiscal period
 *         example: Q1
 *     responses:
 *       200:
 *         description: Department summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Department summary retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/analytics/department/summary:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get current user's department summary
 *     description: Returns aggregate statistics for the authenticated user's department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fiscalYear
 *         schema:
 *           type: string
 *         example: '2026'
 *       - in: query
 *         name: fiscalPeriod
 *         schema:
 *           type: string
 *         example: Q1
 *     responses:
 *       200:
 *         description: Department summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DepartmentSummary'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/analytics/spending-trends:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get spending trends over time
 *     description: Returns budget spending trends grouped by time period.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department (Admin/SuperAdmin only)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the trend analysis
 *         example: '2026-01-01'
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the trend analysis
 *         example: '2026-12-31'
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: How to group the trend data
 *     responses:
 *       200:
 *         description: Spending trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Spending trends retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SpendingTrends'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/analytics/approval-metrics:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get approval performance metrics
 *     description: Returns metrics on budget request approval performance.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Approval metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ApprovalMetrics'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/analytics/top-requesters:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get top requesters
 *     description: Returns top budget requesters ranked by count and amount.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top requesters to return
 *     responses:
 *       200:
 *         description: Top requesters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       requestCount:
 *                         type: integer
 *                       totalAmount:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/analytics/category-breakdown:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get budget breakdown by category
 *     description: Returns budget allocation breakdown by category.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Category breakdown retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: integer
 *                       categoryName:
 *                         type: string
 *                       totalRequested:
 *                         type: number
 *                       totalApproved:
 *                         type: number
 *                       requestCount:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
