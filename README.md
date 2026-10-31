# Employee Request Management System

A full-stack enterprise web application for managing employee requests with Role-Based Access Control (Admin, Manager, Employee), automated request approval workflows, audit trails, and 24-hour reminder scheduling.

## 🚀 Key Features

### 👑 Admin
- Complete employee lifecycle management (Create, Edit, Activate/Deactivate).
- Assign and reassign employees to managers.
- Organization-wide request monitoring with multi-parameter search, filtering, and pagination.
- System activity audit logs & metrics.

### 👔 Manager
- Dedicated view of assigned team members and requests.
- Streamlined approval/rejection workflows with mandatory rejection justification.
- Notifications and overdue warning banners (>24 hours pending).

### 💼 Employee
- Intuitive request submission with category, priority, and date tracking.
- Real-time status tracker (Pending, Approved, Rejected) with manager feedback.
- Instant notifications upon request decisions.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, React Router
- **Backend:** Node.js, Express.js (Modular MVC + Service architecture)
- **Database:** MongoDB & Mongoose ODM
- **Authentication:** JWT with secure cookies & role-based middleware
- **Scheduled Jobs:** node-cron for automated reminders

---

## 📂 Project Architecture

```text
employee-request-management/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── assets/         # Static assets and icons
│   │   ├── components/     # Common and reusable UI components
│   │   ├── pages/          # Admin, Manager, Employee & Auth pages
│   │   ├── layouts/        # Responsive App & Auth layouts
│   │   ├── routes/         # Route definitions and guards
│   │   ├── services/       # API integration client
│   │   └── context/        # Authentication & Notification state
├── server/                 # Backend Node/Express Application
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Request/Response handlers
│   │   ├── models/         # Mongoose database models
│   │   ├── routes/         # Express API routes
│   │   ├── middlewares/    # Auth, Role & Validation middlewares
│   │   ├── services/       # Business logic layer
│   │   └── jobs/           # node-cron scheduled tasks
├── docs/                   # System & Database specifications
└── postman/                # API collections & testing suites
```

---

## 💻 Quick Start

See [docs/SETUP.md](docs/SETUP.md) for full installation and execution instructions.
