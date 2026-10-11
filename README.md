# Expense Voucher Management System
> **Full Stack Developer Internship Assignment — Prachay Securities Private Limited (Prachay Capital)**

A production-quality, responsive web application to digitize, review, approve, and track employee expense vouchers. Replaces manual paper expense claims with strict role-based access control, cryptographic workflow validation, dual electronic signatures, and audit tracking.

---

## 🌟 Key Features by Role

### 1. Employee
- **Authentication**: Secure JWT login with rate-limited brute-force protection.
- **Voucher Creation**: Create vouchers with mandatory department, expense title, expense date, category, and positive amount (> 0).
- **Draft Management**: Save vouchers as `DRAFT`, edit or delete only own draft vouchers.
- **Electronic Signatures**: Upload signature images (PNG/JPG/JPEG up to 2MB) or draw directly on a touch/mouse canvas pad, and register a default profile signature.
- **Submission Workflow**: Transition vouchers from `DRAFT` to `SUBMITTED` -> `PENDING_APPROVAL` with automatic signature verification.
- **Transparency & IDOR Prevention**: View **only** own vouchers (accessing others' vouchers yields 403 Forbidden). Track real-time status and view Director's rejection remarks.

### 2. Director (Admin)
- **Executive Review Queue**: View all organization vouchers and instant pending approval queues.
- **Approval Flow**: One-click approval requiring Director's electronic signature sign-off.
- **Rejection Flow**: Reject claims with mandatory justification feedback (min 5 characters) displayed directly to the claimant.
- **Data Integrity**: Cannot tamper with or edit employee-entered expense details.

### 3. Accounts Team
- **Organization-Wide Monitoring**: View all vouchers across all departments with search, category filtering, and status filters.
- **Audit Verification**: Inspect dual signatures (Employee Claimant + Director Approver) and approval timestamps.
- **Print & PDF Voucher**: Export / Print official corporate vouchers formatted with company header, itemized details, and dual signature verification blocks.
- **Read-Only Enforced**: Cannot create, edit, delete, approve, or reject vouchers.

---

## 🏗️ Architecture & Monorepo Structure

```
prachay-capital-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # MongoDB Atlas production schema
│   │   ├── schema.postgresql.prisma  # PostgreSQL production schema
│   │   ├── schema.sqlite.prisma      # SQLite local development schema
│   │   ├── migrations/               # SQL migrations for PostgreSQL
│   │   │   └── 0_init/migration.sql
│   │   └── seed.js                   # Seed script (5 users, 20 realistic vouchers)
│   ├── src/
│   │   ├── config/                   # Constants, Prisma client setup
│   │   ├── controllers/              # Auth, User, Voucher, Dashboard controllers
│   │   ├── middlewares/              # JWT auth, RBAC, Zod validator, Multer, Error handler
│   │   ├── repositories/             # Data access layer (User, Voucher, StatusHistory)
│   │   ├── routes/                   # API v1 routes (auth, user, voucher, dashboard)
│   │   ├── services/                 # Core business rules & workflow state machine
│   │   ├── utils/                    # Consistent JSON responses & sequential voucher generator
│   │   ├── validations/              # Zod validation schemas
│   │   ├── app.js                    # Express app with Helmet, CORS, and logging
│   │   └── server.js                 # HTTP server entrypoint
│   ├── tests/
│   │   └── api.test.js               # Jest + Supertest (24 tests covering auth, RBAC, IDOR, state machine)
│   ├── uploads/                      # Safely named signature images (.gitkeep preserved)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # StatusBadge, StatCard, FilterPanel, Pagination, Modals
│   │   │   ├── common/
│   │   │   └── auth/
│   │   ├── context/                  # AuthContext, ToastContext
│   │   ├── layouts/                  # DashboardLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/                 # LoginPage (with quick demo role buttons)
│   │   │   ├── employee/             # Dashboard, Create, Edit, My Vouchers, Details, Signature
│   │   │   ├── director/             # Dashboard, Pending Approvals, All Vouchers, Review Details
│   │   │   ├── accounts/             # Dashboard, All Vouchers, Details, Print Voucher
│   │   │   └── errors/               # 403 Forbidden, 404 Not Found
│   │   ├── services/                 # Axios client, authService, voucherService, dashboardService
│   │   ├── App.jsx                   # React Router v6 guarded route tree
│   │   ├── index.css                 # Tailwind CSS v4 + print media styles
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── screenshots/                  # Verified end-to-end screenshots
│   └── postman_collection.json       # Postman API Collection
├── docker-compose.yml                # PostgreSQL container specification
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19 (Vite), React Router v6, Tailwind CSS v4, Axios, React Hook Form, Zod, Lucide React |
| **Backend** | Node.js, Express.js, Layered Architecture (`routes -> controllers -> services -> repositories`) |
| **Security** | JWT (jsonwebtoken), bcryptjs, Helmet, CORS origin restriction, express-rate-limit |
| **Database** | Prisma ORM, MongoDB Atlas (active), PostgreSQL (ready via schema & migrations), SQLite |
| **Testing** | Jest, Supertest (24 comprehensive integration tests) |
| **File Storage** | Multer with MIME verification, 2MB size cap, cryptographically safe filenames |

---

## 🔐 Test Credentials

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Director (Admin)** | `director@abc.com` | `Director@123` | Executive Management |
| **Accounts** | `accounts@abc.com` | `Accounts@123` | Finance & Accounts |
| **Employee 1** | `employee1@abc.com` | `Employee@123` | Engineering |
| **Employee 2** | `employee2@abc.com` | `Employee@123` | Marketing |
| **Employee 3** | `employee3@abc.com` | `Employee@123` | Human Resources |

> **Pro Tip**: The login page includes **Quick Role Login** buttons so you can switch between Director, Accounts, and Employee with one click!

---

## 🔄 Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Employee creates Voucher
    DRAFT --> DRAFT: Employee edits or deletes
    DRAFT --> SUBMITTED: Employee clicks Submit (Signature verified)
    SUBMITTED --> PENDING_APPROVAL: Transactional state advance
    PENDING_APPROVAL --> APPROVED: Director approves (Signature attached)
    PENDING_APPROVAL --> REJECTED: Director rejects (Reason mandatory)
    APPROVED --> [*]: Visible to Accounts for reimbursement (Read-only)
    REJECTED --> [*]: Rejection reason displayed to Employee (Read-only)
```

---

## 📊 Database Schema & ER Diagram

```mermaid
erDiagram
    users ||--o{ vouchers : "submits (employee)"
    users ||--o{ vouchers : "approves/rejects (director)"
    users ||--o{ voucher_status_history : "records change"
    vouchers ||--o{ voucher_status_history : "audit events"

    users {
        string id PK
        string name
        string email UK
        string password_hash
        string role
        string employee_code
        string department
        string signature_path
        datetime created_at
        datetime updated_at
    }

    vouchers {
        string id PK
        string voucher_number UK
        datetime voucher_date
        datetime expense_date
        string department
        string expense_title
        string expense_category
        string expense_description
        float amount
        string employee_id FK
        string employee_name
        string employee_code
        string employee_signature_path
        string status
        string director_id FK
        string director_signature_path
        datetime approval_date
        string rejection_reason
        datetime created_at
        datetime updated_at
    }

    voucher_status_history {
        string id PK
        string voucher_id FK
        string from_status
        string to_status
        string changed_by FK
        string remarks
        datetime created_at
    }

    voucher_counters {
        string id PK
        int year UK
        int last_count
    }
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Step 1: Clone and Install
```bash
git clone <repo-url>
cd prachay-capital-project

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### Step 2: Environment Setup
Backend `.env` is already configured for the MongoDB Atlas database:
```env
PORT=5000
DATABASE_URL="mongodb+srv://rahulbha739_db_user:1M2ajl9xRWxkbFjr@cluster0.1ohm7kb.mongodb.net/expense_voucher_db?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET=prachay_jwt_secret_super_secure_key_2026
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE=2097152
NODE_ENV=development
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Step 3: Database Migration & Seeding
```bash
cd backend

# Sync schema with database
npx prisma db push

# Seed 5 users, sample signatures, and 20 realistic vouchers across all states
node prisma/seed.js
```

### Step 4: Run the Application
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

### Step 5: Run Automated Tests
```bash
cd backend
npm test
# Executes 24 integration tests covering auth, RBAC, IDOR, draft edits, signatures, and workflows
```

---

## 📡 API Documentation (`/api/v1`)

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates user; returns JWT token + profile (Rate-limited). |
| `GET` | `/auth/me` | Authenticated | Retrieves current authenticated user profile. |
| `POST` | `/auth/logout` | Authenticated | Logs out current session. |
| `POST` | `/users/me/signature` | Employee | Uploads user profile signature image (`multipart/form-data`). |
| `POST` | `/vouchers` | Employee | Creates draft voucher with unique auto-generated number. |
| `GET` | `/vouchers` | Authenticated | Lists vouchers (Role-scoped: employee sees own, director/accounts see all). Supports search, category, status, date range, amount range, and sort. |
| `GET` | `/vouchers/pending` | Director | Returns vouchers in `PENDING_APPROVAL` status. |
| `GET` | `/vouchers/:id` | Authenticated | Returns single voucher with audit history (403 on IDOR attempts). |
| `PUT` | `/vouchers/:id` | Employee | Edits draft voucher details (Draft only, owner only). |
| `DELETE` | `/vouchers/:id` | Employee | Deletes draft voucher (Draft only, owner only). |
| `POST` | `/vouchers/:id/signature` | Employee | Attaches signature image to draft voucher. |
| `POST` | `/vouchers/:id/submit` | Employee | Submits voucher; transitions `DRAFT` -> `SUBMITTED` -> `PENDING_APPROVAL`. |
| `POST` | `/vouchers/:id/approve` | Director | Approves voucher with director signature image or path. |
| `POST` | `/vouchers/:id/reject` | Director | Rejects voucher with mandatory rejection reason (body: `{ rejectionReason }`). |
| `GET` | `/dashboard/stats` | Authenticated | Returns role-specific analytics and recent activities. |

---

## 📸 Verified Screenshots

All screens have been verified end-to-end in the browser and saved under [`docs/screenshots/`](file:///e:/prachay%20capital%20project/docs/screenshots/):

1. **Login Page with Quick Switcher**: [`01_login_page.png`](file:///e:/prachay%20capital%20project/docs/screenshots/01_login_page.png)
2. **Employee Dashboard**: [`02_employee_dashboard.png`](file:///e:/prachay%20capital%20project/docs/screenshots/02_employee_dashboard.png)
3. **Director Dashboard**: [`03_director_dashboard.png`](file:///e:/prachay%20capital%20project/docs/screenshots/03_director_dashboard.png)
4. **Employee Rejection Reason Banner**: [`04_employee_rejection_reason.png`](file:///e:/prachay%20capital%20project/docs/screenshots/04_employee_rejection_reason.png)
5. **Director Approved Voucher Details**: [`05_director_approved_voucher.png`](file:///e:/prachay%20capital%20project/docs/screenshots/05_director_approved_voucher.png)
6. **Accounts Team Dashboard**: [`06_accounts_dashboard.png`](file:///e:/prachay%20capital%20project/docs/screenshots/06_accounts_dashboard.png)
7. **Print / PDF Corporate Voucher View**: [`07_print_voucher_view.png`](file:///e:/prachay%20capital%20project/docs/screenshots/07_print_voucher_view.png)
8. **RBAC 403 Forbidden Access Page**: [`08_rbac_403_forbidden.png`](file:///e:/prachay%20capital%20project/docs/screenshots/08_rbac_403_forbidden.png)

---

## ⚖️ Assumptions & Design Decisions
1. **Sequential Voucher Number**: Generated transactionally as `VCH-YYYY-XXXX` using a dedicated counter model to prevent race conditions and gaps.
2. **Signature Reuse**: If an employee has saved a signature on their profile, creating a voucher will automatically attach it by default, or they can upload/draw a specific one.
3. **Workflow Atomicity**: When submitting, the status moves from `DRAFT` to `SUBMITTED` then `PENDING_APPROVAL`, logging both transitions in `voucher_status_history`.
4. **Finality of Approvals & Rejections**: Once `APPROVED` or `REJECTED`, vouchers are strictly immutable.
5. **Multi-Database Support**: Application connects live to MongoDB Atlas while also providing production PostgreSQL schemas, migrations, and docker-compose.

---

## 📋 Requirements Compliance Matrix

| Requirement | Implementation Location | Status |
| :--- | :--- | :---: |
| **Monorepo (`/backend`, `/frontend`)** | Root workspace setup | ✅ Complete |
| **Layered Backend Architecture** | `routes/ -> controllers/ -> services/ -> repositories/` | ✅ Complete |
| **Prisma + Migrations + Seed Script** | `backend/prisma/` (`seed.js`, `schema.prisma`, `migrations/`) | ✅ Complete |
| **Role-Based Access Control (3 roles)** | `backend/src/middlewares/role.middleware.js`, `frontend/src/components/auth/` | ✅ Complete |
| **IDOR Protection** | `backend/src/services/voucher.service.js` (Role-scoped access) | ✅ Complete |
| **Dual Signatures** | `SignatureUploader.jsx`, `upload.middleware.js` | ✅ Complete |
| **Mandatory Rejection Reason** | `voucher.validation.js` (min 5 chars), `DirectorVoucherDetailsPage.jsx` | ✅ Complete |
| **Print / PDF View** | `PrintVoucherView.jsx` with `@media print` CSS | ✅ Complete |
| **Search / Multi-Filter / Sorting** | `FilterPanel.jsx`, `voucher.service.js` query builder | ✅ Complete |
| **24 Automated Backend Tests** | `backend/tests/api.test.js` | ✅ Complete |
| **Browser E2E Testing & Screenshots** | Tested in browser, saved to `docs/screenshots/` | ✅ Complete |
| **No TODOs or Placeholders** | Zero placeholders, production ready | ✅ Complete |
