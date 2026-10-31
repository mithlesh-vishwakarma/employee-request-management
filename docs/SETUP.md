# System Setup & Environment Guide

## Prerequisites
- Node.js LTS (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)
- npm or pnpm

---

## Workspace Layout
```text
employee-request-management/
|-- client/          # Vite + React + Tailwind CSS frontend
|-- server/          # Node.js + Express + Mongoose backend
|-- docs/            # Database and API specifications
|-- postman/         # Postman API test collections
|-- PROJECT_PROGRESS.md
|-- README.md
```

---

## Frontend Setup (`client`)
1. Change directory to `client`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables (`.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

---

## Backend Setup (`server`)
1. Change directory to `server`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables (`.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/employee_request_management
   JWT_SECRET=super_secret_jwt_key_employee_mgmt_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   COOKIE_SECURE=false
   REMINDER_CRON="*/15 * * * *"
   ```
4. Start server:
   ```bash
   npm run dev
   ```
