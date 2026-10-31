# REST API Documentation

Base URL prefix: `/api/v1`

---

## 1. Authentication
- `POST /auth/login` (Public) - Authenticate user, set HTTP-only cookie / return user profile & token.
- `POST /auth/logout` (Authenticated) - Invalidate session / clear cookie.
- `GET /auth/me` (Authenticated) - Return authenticated user's profile and permissions.

---

## 2. Employee Management (Admin)
- `GET /employees` (Admin) - List all employees with pagination, search, role & department filters.
- `POST /employees` (Admin) - Create new employee or manager account.
- `GET /employees/:id` (Admin/Authorized) - Get single employee details.
- `PATCH /employees/:id` (Admin) - Update employee details (name, department, role, etc.).
- `PATCH /employees/:id/status` (Admin) - Toggle active/inactive status.
- `DELETE /employees/:id` (Admin) - Soft delete / deactivate employee.
- `GET /employees/me` (Authenticated) - Get current user profile details.

---

## 3. Manager & Team Management
- `GET /managers` (Admin) - List all available managers.
- `GET /managers/:id/team` (Admin / Assigned Manager) - Retrieve team members assigned to manager.
- `PATCH /employees/:id/manager` (Admin) - Assign or reassign manager to employee.

---

## 4. Requests
- `POST /requests` (Employee) - Submit a new request (auto-assigned to employee's manager).
- `GET /requests` (Admin) - List all organization requests with filters, search, and pagination.
- `GET /requests/my-requests` (Employee) - List requests submitted by logged-in employee.
- `GET /requests/team-requests` (Manager) - List requests submitted by manager's assigned team.
- `GET /requests/:id` (Authorized) - Get request details, timeline, and associated comments.

---

## 5. Review & Comments
- `PATCH /requests/:id/approve` (Assigned Manager) - Approve request with optional comment.
- `PATCH /requests/:id/reject` (Assigned Manager) - Reject request with mandatory comment.
- `POST /requests/:id/comments` (Authorized) - Post discussion comment on a request.
- `GET /requests/:id/comments` (Authorized) - List comments for a request.

---

## 6. Notifications
- `GET /notifications` (Authenticated) - Get logged-in user's notifications.
- `GET /notifications/unread-count` (Authenticated) - Get unread count.
- `PATCH /notifications/:id/read` (Recipient) - Mark single notification as read.
- `PATCH /notifications/read-all` (Recipient) - Mark all as read.

---

## 7. Activity Logs & Dashboard
- `GET /activity-logs` (Admin / Scoped Manager) - Retrieve audit logs with pagination and filters.
- `GET /dashboard/admin` (Admin) - Organization stats (users, requests by status, activity counts).
- `GET /dashboard/manager` (Manager) - Manager stats (team size, pending approvals, overdue count).
- `GET /dashboard/employee` (Employee) - Employee stats (total submitted, approved, pending, rejected).
