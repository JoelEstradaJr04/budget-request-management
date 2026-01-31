// ============================================================================
// SWAGGER/OPENAPI CONFIGURATION - BUDGET REQUEST MICROSERVICE
// ============================================================================

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

/**
 * OpenAPI 3.0 Specification Configuration
 * 
 * This file defines the OpenAPI specification for the Budget Request Microservice API.
 * It includes security schemes, server configuration, and comprehensive documentation structure.
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Budget Request Microservice API',
    version: '2.0.0',
    description: `
# Budget Request Microservice - API Documentation

This is the comprehensive API documentation for the Budget Request Microservice.
The API provides endpoints for managing budget requests across different departments 
with role-based access control.

## Features
- Department-based budget request management
- Role-based access control (Admin vs Non-Admin)
- Multi-department support (Finance, HR, Inventory, Operations)
- Approval workflow management
- Budget analytics and reporting

## Architecture
The API uses a department-based route structure:
- **/api/{department}/admin/** - Admin routes with elevated permissions
- **/api/{department}/non-admin/** - Non-admin routes with limited scope

## Departments
- **Finance**: Full access to all departments' budget requests (approval authority)
- **HR**: Access to HR department budget requests
- **Inventory**: Access to Inventory department budget requests
- **Operations**: Access to Operations department budget requests

## Authentication
All endpoints require JWT Bearer token authentication. The token contains:
- User ID
- Department
- Role (Admin/Non-Admin)

## Base URL
- Development: \`http://localhost:${env.PORT}\`
- Production: Configure via environment variables
    `,
    contact: {
      name: 'Budget Request Development Team',
      email: 'budget@ftms.example.com',
    },
    license: {
      name: 'Proprietary',
      url: 'https://ftms.example.com/license',
    },
  },
  servers: [
    {
      url: '',
      description: 'Current server (auto-detected from request)',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Finance Admin',
      description: 'Finance Admin endpoints - Full access to all budget requests and approvals',
    },
    {
      name: 'Finance Non-Admin',
      description: 'Finance Non-Admin endpoints - Access to own budget requests only',
    },
    {
      name: 'HR Admin',
      description: 'HR Admin endpoints - Access to HR department budget requests',
    },
    {
      name: 'HR Non-Admin',
      description: 'HR Non-Admin endpoints - Access to own budget requests only',
    },
    {
      name: 'Inventory Admin',
      description: 'Inventory Admin endpoints - Access to Inventory department budget requests',
    },
    {
      name: 'Inventory Non-Admin',
      description: 'Inventory Non-Admin endpoints - Access to own budget requests only',
    },
    {
      name: 'Operations Admin',
      description: 'Operations Admin endpoints - Access to Operations department budget requests',
    },
    {
      name: 'Operations Non-Admin',
      description: 'Operations Non-Admin endpoints - Access to own budget requests only',
    },
    {
      name: 'Analytics',
      description: 'Budget analytics and reporting endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer {token}',
      },
    },
    schemas: {
      // ============================================================================
      // Common Response Schemas
      // ============================================================================
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
            description: 'Response data payload',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'An error occurred',
          },
          error: {
            type: 'string',
            example: 'Detailed error message',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Data retrieved successfully',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                example: 1,
              },
              limit: {
                type: 'integer',
                example: 20,
              },
              total: {
                type: 'integer',
                example: 100,
              },
              totalPages: {
                type: 'integer',
                example: 5,
              },
            },
          },
        },
      },

      // ============================================================================
      // Budget Request Schemas
      // ============================================================================
      BudgetRequest: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          request_code: {
            type: 'string',
            example: 'BR-2026-001',
            description: 'Unique budget request code',
          },
          department_id: {
            type: 'string',
            example: 'FINANCE',
            description: 'Department identifier',
          },
          department_name: {
            type: 'string',
            nullable: true,
            example: 'Finance Department',
          },
          requested_by: {
            type: 'string',
            example: 'user-123',
            description: 'User ID who created the request',
          },
          requested_for: {
            type: 'string',
            nullable: true,
            example: 'John Doe',
            description: 'Person for whom the budget is requested',
          },
          request_date: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-22T10:30:00Z',
          },
          total_amount: {
            type: 'number',
            format: 'decimal',
            example: 50000.00,
            description: 'Total requested amount',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'ADJUSTED', 'CLOSED'],
            example: 'PENDING',
            description: 'Current status of the budget request',
          },
          purpose: {
            type: 'string',
            nullable: true,
            example: 'Office equipment purchase for Q1 2026',
          },
          remarks: {
            type: 'string',
            nullable: true,
            example: 'Urgent requirement for new hires',
          },
          request_type: {
            type: 'string',
            enum: ['REGULAR', 'PROJECT_BASED', 'URGENT', 'EMERGENCY'],
            example: 'REGULAR',
          },
          pr_reference_code: {
            type: 'string',
            nullable: true,
            example: 'PR-2026-001',
            description: 'Link to Purchase Request (if any)',
          },
          approved_by: {
            type: 'string',
            nullable: true,
            example: 'admin-456',
          },
          approved_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          rejected_by: {
            type: 'string',
            nullable: true,
          },
          rejected_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          rejection_reason: {
            type: 'string',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-22T10:30:00Z',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/BudgetRequestItem',
            },
          },
        },
      },
      BudgetRequestItem: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          category_id: {
            type: 'integer',
            nullable: true,
            example: 1,
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Laptop computers',
          },
          requested_amount: {
            type: 'number',
            format: 'decimal',
            example: 25000.00,
          },
          approved_amount: {
            type: 'number',
            format: 'decimal',
            nullable: true,
            example: 25000.00,
          },
          notes: {
            type: 'string',
            nullable: true,
            example: '5 units @ 5000 each',
          },
        },
      },
      CreateBudgetRequest: {
        type: 'object',
        required: ['department_id', 'requested_by', 'total_amount'],
        properties: {
          department_id: {
            type: 'string',
            example: 'FINANCE',
            description: 'Department identifier',
          },
          department_name: {
            type: 'string',
            example: 'Finance Department',
          },
          requested_by: {
            type: 'string',
            example: 'user-123',
            description: 'User ID creating the request',
          },
          requested_for: {
            type: 'string',
            example: 'John Doe',
            description: 'Person for whom the budget is requested',
          },
          total_amount: {
            type: 'number',
            format: 'decimal',
            example: 50000.00,
            description: 'Total requested amount',
          },
          purpose: {
            type: 'string',
            example: 'Office equipment purchase for Q1 2026',
          },
          remarks: {
            type: 'string',
            example: 'Urgent requirement for new hires',
          },
          request_type: {
            type: 'string',
            enum: ['REGULAR', 'PROJECT_BASED', 'URGENT', 'EMERGENCY'],
            default: 'REGULAR',
          },
          pr_reference_code: {
            type: 'string',
            example: 'PR-2026-001',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CreateBudgetRequestItem',
            },
          },
        },
      },
      CreateBudgetRequestItem: {
        type: 'object',
        required: ['requested_amount'],
        properties: {
          category_id: {
            type: 'integer',
            example: 1,
          },
          description: {
            type: 'string',
            example: 'Laptop computers',
          },
          requested_amount: {
            type: 'number',
            format: 'decimal',
            example: 25000.00,
          },
          notes: {
            type: 'string',
            example: '5 units @ 5000 each',
          },
        },
      },
      ApprovalRequest: {
        type: 'object',
        properties: {
          remarks: {
            type: 'string',
            example: 'Approved as requested',
            description: 'Optional approval remarks',
          },
        },
      },
      RejectionRequest: {
        type: 'object',
        required: ['rejection_reason'],
        properties: {
          rejection_reason: {
            type: 'string',
            example: 'Budget exceeds department allocation for this quarter',
            description: 'Required reason for rejection',
          },
        },
      },

      // ============================================================================
      // Analytics Schemas
      // ============================================================================
      DepartmentSummary: {
        type: 'object',
        properties: {
          department: {
            type: 'string',
            example: 'FINANCE',
          },
          fiscalYear: {
            type: 'string',
            example: '2026',
          },
          fiscalPeriod: {
            type: 'string',
            example: 'Q1',
          },
          requests: {
            type: 'object',
            properties: {
              total: {
                type: 'integer',
                example: 50,
              },
              pending: {
                type: 'integer',
                example: 10,
              },
              approved: {
                type: 'integer',
                example: 35,
              },
              rejected: {
                type: 'integer',
                example: 5,
              },
            },
          },
          amounts: {
            type: 'object',
            properties: {
              totalRequested: {
                type: 'number',
                example: 500000.00,
              },
              totalApproved: {
                type: 'number',
                example: 420000.00,
              },
            },
          },
          metrics: {
            type: 'object',
            properties: {
              approvalRate: {
                type: 'string',
                example: '70.00%',
              },
              averageRequestAmount: {
                type: 'string',
                example: '10000.00',
              },
              averageApprovalAmount: {
                type: 'string',
                example: '12000.00',
              },
            },
          },
        },
      },
      SpendingTrends: {
        type: 'object',
        properties: {
          department: {
            type: 'string',
            example: 'All',
          },
          groupBy: {
            type: 'string',
            enum: ['day', 'week', 'month', 'quarter', 'year'],
            example: 'month',
          },
          trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                period: {
                  type: 'string',
                  example: '2026-01',
                },
                requestCount: {
                  type: 'integer',
                  example: 15,
                },
                totalRequested: {
                  type: 'number',
                  example: 150000.00,
                },
              },
            },
          },
        },
      },
      ApprovalMetrics: {
        type: 'object',
        properties: {
          totalRequests: {
            type: 'integer',
            example: 100,
          },
          approved: {
            type: 'integer',
            example: 70,
          },
          rejected: {
            type: 'integer',
            example: 20,
          },
          pending: {
            type: 'integer',
            example: 10,
          },
          approvalRate: {
            type: 'string',
            example: '70.00%',
          },
          averageApprovalTime: {
            type: 'string',
            example: '2.5 days',
          },
        },
      },

      // ============================================================================
      // Health Check Schema
      // ============================================================================
      HealthCheck: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Service is healthy',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-22T10:30:00Z',
          },
          service: {
            type: 'string',
            example: 'budget-request-microservice',
          },
          checks: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                example: 'healthy',
              },
            },
          },
        },
      },
    },
    responses: {
      Success: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SuccessResponse',
            },
          },
        },
      },
      BadRequest: {
        description: 'Bad request - Invalid input parameters',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Unauthorized - Invalid or missing token',
                },
              },
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Forbidden - Insufficient permissions',
                },
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false,
                },
                message: {
                  type: 'string',
                  example: 'Budget request not found',
                },
              },
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
    },
  },
  // Global security requirement (can be overridden per endpoint)
  security: [],
};

/**
 * Swagger JSDoc Options
 * Defines where to look for API documentation
 */
const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  // Path to the API routes where JSDoc comments are located
  apis: [
    './src/routes/**/*.ts',
    './src/controllers/**/*.ts',
    './src/docs/**/*.ts',
  ],
};

/**
 * Generate OpenAPI specification
 */
export const swaggerSpec = swaggerJsdoc(options);

/**
 * Export configuration for use in other modules
 */
export const swaggerConfig = {
  definition: swaggerDefinition,
  options,
};
