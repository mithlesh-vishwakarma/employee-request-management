export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Employee Request Management API',
    version: '1.0.0',
    description: `Enterprise REST API for Employee Request Management System.
    
Supports multi-tier role-based access control (Admin, Manager, Employee), customizable request submission and review workflows, employee-manager hierarchy, in-app notifications, audit trail activity logging, and automated 24-hour pending review reminders.

### Authentication
Most endpoints require authentication via a JWT token.
- Pass the token in the **Authorize** dialog as \`Bearer <your_token>\` or via the \`Authorization: Bearer <token>\` header.
- Alternatively, the login endpoint automatically sets an HTTP-only \`token\` cookie.`,
    contact: {
      name: 'Employee Request Management Team',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current Host (Auto-detected)',
    },
    {
      url: 'https://employee-request-management.onrender.com/api/v1',
      description: 'Production Server (Render)',
    },
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'System', description: 'Health check and service diagnostics' },
    { name: 'Authentication', description: 'User login, logout, and active session retrieval' },
    { name: 'Employees', description: 'Employee directory management, CRUD, and status toggle (Admin)' },
    { name: 'Managers & Teams', description: 'Manager listing, team hierarchy, and manager assignment' },
    { name: 'Requests', description: 'Request lifecycle: creation, retrieval, filtering, and status tracking' },
    { name: 'Reviews & Comments', description: 'Approval/rejection workflows and discussion threads' },
    { name: 'Notifications', description: 'In-app notifications and read status updates' },
    { name: 'Activity Logs', description: 'Audit trail of administrative and operational events' },
    { name: 'Dashboard', description: 'Role-specific aggregated analytics and KPI summaries' },
    { name: 'Jobs & Automation', description: 'Background cron jobs and automated reminder dispatch' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from POST /api/v1/auth/login',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663158c385973210e7b99c1a' },
          id: { type: 'string', example: '663158c385973210e7b99c1a' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@company.com' },
          role: { type: 'string', enum: ['admin', 'manager', 'employee'], example: 'employee' },
          department: { type: 'string', example: 'Engineering' },
          employeeId: { type: 'string', example: 'EMP-1004' },
          isActive: { type: 'boolean', example: true },
          managerId: {
            type: 'object',
            nullable: true,
            properties: {
              _id: { type: 'string', example: '663158c385973210e7b99c1b' },
              name: { type: 'string', example: 'Sarah Manager' },
              email: { type: 'string', example: 'sarah.manager@company.com' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Request: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663158c385973210e7b99c2c' },
          id: { type: 'string', example: '663158c385973210e7b99c2c' },
          title: { type: 'string', example: 'Annual Leave Request' },
          description: { type: 'string', example: 'Requesting 3 days off for personal travel.' },
          category: {
            type: 'string',
            enum: ['Leave', 'Work From Home', 'Equipment', 'Expense Reimbursement', 'General'],
            example: 'Leave',
          },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
          employeeId: { $ref: '#/components/schemas/User' },
          managerId: { $ref: '#/components/schemas/User' },
          startDate: { type: 'string', format: 'date', nullable: true, example: '2026-11-10' },
          endDate: { type: 'string', format: 'date', nullable: true, example: '2026-11-13' },
          reviewedBy: { type: 'string', nullable: true, example: null },
          reviewedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
          reviewComment: { type: 'string', example: '' },
          reminderSentAt: { type: 'string', format: 'date-time', nullable: true },
          submittedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663158c385973210e7b99c3d' },
          requestId: { type: 'string', example: '663158c385973210e7b99c2c' },
          authorId: { $ref: '#/components/schemas/User' },
          message: { type: 'string', example: 'Please ensure project handover is completed before leaving.' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663158c385973210e7b99c4e' },
          recipientId: { type: 'string', example: '663158c385973210e7b99c1a' },
          type: {
            type: 'string',
            enum: ['new_request', 'request_approved', 'request_rejected', 'request_reminder', 'general'],
            example: 'request_approved',
          },
          title: { type: 'string', example: 'Request Approved' },
          message: { type: 'string', example: 'Your Annual Leave Request has been approved.' },
          link: { type: 'string', example: '/employee/my-requests' },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663158c385973210e7b99c5f' },
          actorId: { $ref: '#/components/schemas/User' },
          action: {
            type: 'string',
            example: 'REQUEST_APPROVED',
          },
          entityType: { type: 'string', example: 'Request' },
          entityId: { type: 'string', example: '663158c385973210e7b99c2c' },
          description: { type: 'string', example: "Sarah Manager approved Jane Doe's request: Annual Leave Request" },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Service Health Check',
        description: 'Verify server health, uptime, and database connectivity.',
        responses: {
          200: {
            description: 'API is running and healthy.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employee Request Management API is healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 124.5 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in user',
        description: 'Authenticates user with email and password. Returns JWT token and sets an HTTP-only session cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@company.com' },
                  password: { type: 'string', format: 'password', example: 'Admin123!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged in successfully' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials or inactive account' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out user',
        security: [{ bearerAuth: [] }],
        description: 'Clears the authentication cookie and ends session.',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        description: 'Returns profile details and permissions for the currently authenticated user.',
        responses: {
          200: {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profile retrieved successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized / Token expired' },
        },
      },
    },
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List all employees (Admin)',
        security: [{ bearerAuth: [] }],
        description: 'Retrieve a paginated and filtered list of organization employees.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, email, or employeeId' },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'manager', 'employee'] } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'List of employees retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employees retrieved successfully' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden - requires Admin role' },
        },
      },
      post: {
        tags: ['Employees'],
        summary: 'Create employee or manager account (Admin)',
        security: [{ bearerAuth: [] }],
        description: 'Create a new employee, manager, or admin user.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'role', 'department'],
                properties: {
                  name: { type: 'string', example: 'Alex Smith' },
                  email: { type: 'string', format: 'email', example: 'alex.smith@company.com' },
                  password: { type: 'string', minLength: 6, example: 'SecurePassword123!' },
                  role: { type: 'string', enum: ['admin', 'manager', 'employee'], example: 'employee' },
                  department: { type: 'string', example: 'Engineering' },
                  employeeId: { type: 'string', example: 'EMP-1005' },
                  managerId: { type: 'string', nullable: true, example: '663158c385973210e7b99c1b' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Employee created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employee created successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or email already in use' },
        },
      },
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Employees'],
        summary: 'Update employee profile (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alex Smith' },
                  email: { type: 'string', format: 'email', example: 'alex.smith@company.com' },
                  password: { type: 'string', minLength: 6, example: 'NewSecret123!' },
                  role: { type: 'string', enum: ['admin', 'manager', 'employee'] },
                  department: { type: 'string', example: 'Engineering' },
                  managerId: { type: 'string', nullable: true, example: '663158c385973210e7b99c1b' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Employee profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employee updated successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/employees/{id}/status': {
      patch: {
        tags: ['Employees'],
        summary: 'Toggle active/inactive status (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Employee status toggled',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employee deactivated successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/managers': {
      get: {
        tags: ['Managers & Teams'],
        summary: 'List all managers (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of managers retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/managers/{id}/team': {
      get: {
        tags: ['Managers & Teams'],
        summary: 'Get assigned team members for manager',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Team members retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/managers/{id}/manager': {
      patch: {
        tags: ['Managers & Teams'],
        summary: 'Assign or reassign manager to employee (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['managerId'],
                properties: {
                  managerId: { type: 'string', example: '663158c385973210e7b99c1b' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Manager assigned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Manager assigned successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests': {
      get: {
        tags: ['Requests'],
        summary: 'List all requests (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } },
        ],
        responses: {
          200: {
            description: 'All requests retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Request' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Requests'],
        summary: 'Submit new request (Employee)',
        security: [{ bearerAuth: [] }],
        description: 'Creates a new request automatically assigned to the employee\'s manager.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'category'],
                properties: {
                  title: { type: 'string', minLength: 5, maxLength: 150, example: 'WFH Request for Friday' },
                  description: { type: 'string', minLength: 10, example: 'Need to work from home to attend delivery.' },
                  category: {
                    type: 'string',
                    enum: ['Leave', 'Work From Home', 'Equipment', 'Expense Reimbursement', 'General'],
                    example: 'Work From Home',
                  },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
                  startDate: { type: 'string', format: 'date', nullable: true, example: '2026-11-06' },
                  endDate: { type: 'string', format: 'date', nullable: true, example: '2026-11-06' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Request submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Request submitted successfully' },
                    data: { $ref: '#/components/schemas/Request' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests/my-requests': {
      get: {
        tags: ['Requests'],
        summary: 'List my requests (Employee)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Request' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests/team-requests': {
      get: {
        tags: ['Requests'],
        summary: 'List team requests pending manager review (Manager)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Request' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests/{id}': {
      get: {
        tags: ['Requests'],
        summary: 'Get request details and timeline',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Request' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests/{id}/approve': {
      patch: {
        tags: ['Reviews & Comments'],
        summary: 'Approve request (Manager)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  comment: { type: 'string', example: 'Approved, enjoy your time off!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Request approved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Request approved successfully' },
                    data: { $ref: '#/components/schemas/Request' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests/{id}/reject': {
      patch: {
        tags: ['Reviews & Comments'],
        summary: 'Reject request (Manager)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['comment'],
                properties: {
                  comment: { type: 'string', minLength: 3, example: 'Declined due to conflicting sprint releases.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Request rejected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Request rejected successfully' },
                    data: { $ref: '#/components/schemas/Request' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/requests/{id}/comments': {
      get: {
        tags: ['Reviews & Comments'],
        summary: 'Get request comments',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comment' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Reviews & Comments'],
        summary: 'Post comment on request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', minLength: 1, example: 'Can you provide the invoice receipt?' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Comment created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        count: { type: 'integer', example: 3 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/activity-logs': {
      get: {
        tags: ['Activity Logs'],
        summary: 'Get audit activity logs (Admin / Manager)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'entityType', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ActivityLog' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dashboard/admin': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Admin dashboard metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Organization metrics summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalEmployees: { type: 'integer', example: 25 },
                        totalRequests: { type: 'integer', example: 84 },
                        pendingRequests: { type: 'integer', example: 12 },
                        approvedRequests: { type: 'integer', example: 62 },
                        rejectedRequests: { type: 'integer', example: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dashboard/manager': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Manager dashboard metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        teamSize: { type: 'integer', example: 6 },
                        pendingApprovals: { type: 'integer', example: 3 },
                        reviewedTotal: { type: 'integer', example: 28 },
                        overdue24h: { type: 'integer', example: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/dashboard/employee': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Employee dashboard metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalSubmitted: { type: 'integer', example: 8 },
                        pending: { type: 'integer', example: 2 },
                        approved: { type: 'integer', example: 5 },
                        rejected: { type: 'integer', example: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/jobs/trigger-reminders': {
      post: {
        tags: ['Jobs & Automation'],
        summary: 'Trigger 24-hour pending review reminder check (Admin / Manager)',
        security: [{ bearerAuth: [] }],
        description: 'Immediately scans for pending requests older than 24 hours without notification, dispatches reminder notifications, and logs execution audit.',
        responses: {
          200: {
            description: 'Reminder job executed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Reminder check completed successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        totalChecked: { type: 'integer', example: 3 },
                        remindersSent: { type: 'integer', example: 1 },
                        skippedAlreadySent: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

