# Database Architecture & Specification

## Technology
- **Database:** MongoDB (via Mongoose ODM)
- **Target database name:** `employee_request_management`

---

## Collections & Schemas

### 1. `users`
Represents Admins, Managers, and Employees.

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'manager', 'employee'], required: true },
  employeeId: { type: String, unique: true, sparse: true, trim: true },
  department: { type: String, required: true, trim: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ employeeId: 1 }` (unique, sparse)
- `{ managerId: 1 }`
- `{ role: 1, isActive: 1 }`

---

### 2. `requests`
Represents submitted requests (Leave, Equipment, Expense, WFH, General).

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Leave', 'Work From Home', 'Equipment', 'Expense Reimbursement', 'General'],
    required: true 
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewComment: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ employeeId: 1, createdAt: -1 }`
- `{ managerId: 1, status: 1, submittedAt: -1 }`
- `{ status: 1, submittedAt: 1 }`

---

### 3. `requestcomments`
Discussion or clarification messages on a specific request.

```javascript
{
  _id: ObjectId,
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ requestId: 1, createdAt: 1 }`

---

### 4. `notifications`
In-app alerts for users regarding request submissions, approvals, rejections, and reminders.

```javascript
{
  _id: ObjectId,
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['new_request', 'request_approved', 'request_rejected', 'request_reminder', 'general'],
    required: true
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ recipientId: 1, isRead: 1, createdAt: -1 }`

---

### 5. `activitylogs`
Immutable audit log tracking major system events.

```javascript
{
  _id: ObjectId,
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}
```

**Indexes:**
- `{ actorId: 1, createdAt: -1 }`
- `{ action: 1, createdAt: -1 }`

---

### 6. `reminderlogs`
Ensures idempotency for background reminders (>24h pending requests) without duplicate alerts.

```javascript
{
  _id: ObjectId,
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reminderType: { type: String, required: true, default: 'pending_24h' },
  reminderWindow: { type: String, required: true }, // e.g. "2026-10-31" or request-level window
  sentAt: { type: Date, default: Date.now }
}
```

**Indexes:**
- Compound unique index: `{ requestId: 1, reminderType: 1, reminderWindow: 1 }` (unique: true)
