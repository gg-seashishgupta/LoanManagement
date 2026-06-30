# CredFlow LMS — System Flow & Architecture

Complete documentation of how the **backend** and **frontend** work together in this Loan Management System.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Models](#5-database-models)
6. [Authentication Flow](#6-authentication-flow)
7. [Role-Based Access Control](#7-role-based-access-control)
8. [Borrower Journey (End-to-End)](#8-borrower-journey-end-to-end)
9. [Operations Dashboard Flow](#9-operations-dashboard-flow)
10. [Loan Lifecycle & Status Transitions](#10-loan-lifecycle--status-transitions)
11. [Business Rule Engine (BRE)](#11-business-rule-engine-bre)
12. [Loan Calculation (Simple Interest)](#12-loan-calculation-simple-interest)
13. [Payment & Collection Flow](#13-payment--collection-flow)
14. [Complete API Reference](#14-complete-api-reference)
15. [Frontend ↔ Backend Mapping](#15-frontend--backend-mapping)
16. [Environment & Setup](#16-environment--setup)

---

## 1. System Overview

CredFlow LMS is a lending platform with two main parts:

| Part | Users | Purpose |
|------|-------|---------|
| **Borrower Portal** | Borrowers | Multi-step loan application (profile → upload → apply) |
| **Operations Dashboard** | Sales, Sanction, Disbursement, Collection, Admin | Manage loans through their lifecycle |

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│  React Frontend │  ◄──────────────────────►  │  Express API    │
│  (Vite + JSX)   │         JWT in header        │  (Node.js)      │
└─────────────────┘                            └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │  (Mongoose ODM) │
                                               └─────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express 5, JavaScript (ES Modules) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Upload | Multer (salary slips) |

---

## 3. High-Level Architecture

```mermaid
flowchart TB
    subgraph Frontend["React Frontend (localhost:5173)"]
        AuthPages[Login / Register]
        BorrowerFlow[Borrower Application Flow]
        OpsModules[Operations Modules]
        ProtectedRoute[ProtectedRoute + Sidebar RBAC]
    end

    subgraph Backend["Express API (localhost:5000)"]
        AuthMW[authMiddleware - JWT verify]
        RoleMW[roleMiddleware - RBAC]
        Controllers[Controllers]
        Services[BRE + Loan Calculator]
        UploadMW[Multer Upload]
    end

    subgraph DB["MongoDB"]
        Users[(Users)]
        Loans[(Loans)]
        Payments[(Payments)]
    end

    AuthPages -->|POST /api/auth/*| Controllers
    BorrowerFlow -->|PUT /api/borrower/*| AuthMW --> RoleMW --> Controllers
    OpsModules -->|GET/PUT/POST /api/operations/*| AuthMW --> RoleMW --> Controllers
    Controllers --> Services
    Controllers --> UploadMW
    Controllers --> Users
    Controllers --> Loans
    Controllers --> Payments
```

---

## 4. Project Structure

### Backend (`/backend`)

```
backend/
├── scripts/
│   └── seed.js                 # Seed users for all 6 roles
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   ├── borrowerController.js # Profile, upload, calculate
│   │   ├── loanController.js   # Apply, get my loans
│   │   ├── salesController.js  # Sales leads
│   │   ├── sanctionController.js
│   │   ├── disbursementController.js
│   │   ├── collectionController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect
│   │   ├── roleMiddleware.js   # authorizeRoles(...)
│   │   └── uploadMiddleware.js # Multer for salary slips
│   ├── models/
│   │   ├── User.js
│   │   ├── Loan.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── borrowerRoutes.js
│   │   ├── loanRoutes.js
│   │   ├── operationsRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   ├── bre.js              # Business Rule Engine
│   │   └── loanCalculator.js   # Simple interest math
│   ├── app.js                  # Express app + route mounting
│   └── server.js               # Start server after DB connect
└── uploads/salary-slips/       # Uploaded files storage
```

### Frontend (`/frontend`)

```
frontend/src/
├── components/
│   ├── layout/                 # Sidebar, Header, DashboardLayout
│   ├── common/                 # StatusBadge, ApplicationStepper, Loader
│   └── cards/                  # StatCard
├── hooks/
│   └── useAuth.js              # Auth state + localStorage
├── pages/
│   ├── auth/                   # Login, Register
│   ├── apply/                  # PersonalDetails, UploadSalarySlip, LoanApplication
│   ├── borrower/               # MyLoans
│   ├── operations/             # Sales, Sanction, Disbursement, Collection
│   └── dashboard/              # Role-aware dashboard
├── routes/
│   ├── AppRoutes.jsx           # All routes + role guards
│   └── ProtectedRoute.jsx      # Frontend RBAC
├── services/                   # Axios API calls (mirror backend routes)
│   ├── api.js                  # Axios instance + JWT interceptor
│   ├── authService.js
│   ├── borrowerService.js
│   ├── loanService.js
│   ├── operationsService.js
│   └── dashboardService.js
└── utils/
    ├── roles.js                # Menu config, home routes per role
    └── format.js               # Currency, dates, status labels
```

---

## 5. Database Models

### User

Stores both borrowers and internal executives.

| Field | Type | Description |
|-------|------|-------------|
| name | String | Full name |
| email | String | Unique login email |
| password | String | bcrypt hashed |
| role | Enum | `admin`, `sales`, `sanction`, `disbursement`, `collection`, `borrower` |
| pan | String | PAN number (borrowers) |
| dateOfBirth | Date | For age check |
| monthlySalary | Number | For BRE |
| employmentMode | Enum | `salaried`, `self-employed`, `unemployed` |
| salarySlipPath | String | Path to uploaded file |
| profileCompleted | Boolean | Profile step done |
| brePassed | Boolean | Eligibility check passed |

### Loan

| Field | Type | Description |
|-------|------|-------------|
| borrower | ObjectId → User | Who applied |
| amount | Number | ₹50,000 – ₹5,00,000 |
| tenureDays | Number | 30 – 365 days |
| interestRate | Number | Fixed 12% p.a. |
| simpleInterest | Number | Calculated SI |
| totalRepayment | Number | Principal + SI |
| outstandingBalance | Number | Remaining to pay |
| salarySlipPath | String | Copy from user at apply time |
| status | Enum | `applied`, `sanctioned`, `rejected`, `disbursed`, `closed` |
| rejectionReason | String | Set when rejected |
| sanctionedBy / sanctionedAt | Ref + Date | Sanction audit |
| disbursedBy / disbursedAt | Ref + Date | Disbursement audit |
| closedAt | Date | When fully paid |

### Payment

| Field | Type | Description |
|-------|------|-------------|
| loan | ObjectId → Loan | Linked loan |
| utrNumber | String | **Unique** across all payments |
| amount | Number | Payment amount |
| paymentDate | Date | When payment was made |
| recordedBy | ObjectId → User | Collection executive |

---

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as React Frontend
    participant B as Express API
    participant DB as MongoDB

    U->>F: Enter email + password
    F->>B: POST /api/auth/login
    B->>DB: User.findOne({ email })
    B->>B: bcrypt.compare(password, hash)
    B->>B: jwt.sign({ id }, JWT_SECRET)
    B-->>F: { user fields, token }
    F->>F: localStorage.setItem("token", "user")
    F-->>U: Redirect to role home page
```

### How JWT is used on every request

1. **Frontend** (`api.js`): Axios interceptor attaches `Authorization: Bearer <token>` to every request.
2. **Backend** (`authMiddleware.js`): Verifies token, loads user from DB, sets `req.user`.
3. **On 401**: Frontend clears localStorage and redirects to login.

### Register flow

- Only creates users with role `borrower`.
- Executive accounts are created via `npm run seed` (not public registration).

---

## 7. Role-Based Access Control

RBAC is enforced on **both** frontend and backend.

### Roles & Access

| Role | Frontend Access | Backend API Access |
|------|-----------------|-------------------|
| **borrower** | Application portal only | `/api/borrower/*`, `/api/loans/apply`, `/api/loans/my` |
| **sales** | Sales Leads module | `GET /api/operations/sales/leads` |
| **sanction** | Sanction Queue | `GET/PUT /api/operations/sanction/*` |
| **disbursement** | Disbursement Queue | `GET/PUT /api/operations/disbursement/*` |
| **collection** | Collection module | `GET/POST /api/operations/collection/*` |
| **admin** | All modules + dashboard stats | All operations + `/api/dashboard/stats` |

### Frontend RBAC

```
ProtectedRoute (AppRoutes.jsx)
    └── Checks token + user.role against allowedRoles
    └── Redirects unauthorized users to their home route

Sidebar (roles.js → getMenuForRole)
    └── Each role sees only their menu items
```

### Backend RBAC

```
Request → protect (JWT) → authorizeRoles("admin", "sanction") → controller
                              └── Returns 403 if role not allowed
```

---

## 8. Borrower Journey (End-to-End)

```mermaid
flowchart LR
    A[Register/Login] --> B[Personal Details + BRE]
    B -->|Pass| C[Upload Salary Slip]
    B -->|Fail| B
    C --> D[Configure Loan + Apply]
    D --> E[Loan Status: APPLIED]
```

### Step 1 — Register / Login

| | |
|---|---|
| **Frontend** | `Login.jsx`, `Register.jsx` |
| **Service** | `authService.js` → `POST /api/auth/login` or `/register` |
| **Backend** | `authController.js` — hashes password, returns JWT |
| **After login** | Borrower → `/` (dashboard), executives → their module |

---

### Step 2 — Personal Details + BRE

| | |
|---|---|
| **Frontend page** | `/apply/profile` → `PersonalDetails.jsx` |
| **Service** | `borrowerService.updateProfile()` |
| **API** | `PUT /api/borrower/profile` |
| **Backend** | `borrowerController.updateProfile()` → calls `bre.js` |
| **On success** | Sets `profileCompleted: true`, `brePassed: true` on User |
| **On failure** | Returns 400 with `errors[]` array — frontend shows each rule violation |

**Request body:**
```json
{
  "name": "Demo User",
  "pan": "ABCDE1234F",
  "dateOfBirth": "1995-06-15",
  "monthlySalary": 45000,
  "employmentMode": "salaried"
}
```

---

### Step 3 — Upload Salary Slip

| | |
|---|---|
| **Frontend page** | `/apply/upload` → `UploadSalarySlip.jsx` |
| **Service** | `borrowerService.uploadSalarySlip(file)` — FormData multipart |
| **API** | `POST /api/borrower/salary-slip` |
| **Backend** | Multer saves file to `uploads/salary-slips/`, updates `user.salarySlipPath` |
| **Validation** | PDF/JPG/PNG only, max 5 MB, requires `brePassed` first |
| **Static serve** | Files accessible at `http://localhost:5000/uploads/salary-slips/<filename>` |

---

### Step 4 — Loan Application

| | |
|---|---|
| **Frontend page** | `/apply/loan` → `LoanApplication.jsx` |
| **Live preview** | `POST /api/borrower/calculate` on slider change |
| **Submit** | `POST /api/loans/apply` |
| **Backend checks** | BRE re-run, salary slip exists, no active loan, amount/tenure valid |
| **Creates** | Loan with `status: "applied"`, `outstandingBalance = totalRepayment` |

**Request body:**
```json
{
  "amount": 100000,
  "tenureDays": 180
}
```

**Frontend sliders:**
- Amount: ₹50,000 – ₹5,00,000
- Tenure: 30 – 365 days
- Live panel shows SI and total repayment

---

### Step 5 — View My Loans

| | |
|---|---|
| **Frontend page** | `/my-loans` → `MyLoans.jsx` |
| **API** | `GET /api/loans/my` |
| **Shows** | All borrower's loans with status, outstanding balance, rejection reason |

---

## 9. Operations Dashboard Flow

```mermaid
flowchart TB
    S[Sales: Registered, no loan yet] --> A[APPLIED]
    A -->|Sanction Approve| SAN[SANCTIONED]
    A -->|Sanction Reject| REJ[REJECTED]
    SAN -->|Disbursement| DIS[DISBURSED]
    DIS -->|Collection payments| CL[CLOSED]
```

### Sales Module

| | |
|---|---|
| **Frontend** | `/operations/sales` → `SalesLeads.jsx` |
| **API** | `GET /api/operations/sales/leads` |
| **Logic** | Returns borrowers who registered but have **no loan** yet |
| **Roles** | `sales`, `admin` |

---

### Sanction Module

| | |
|---|---|
| **Frontend** | `/operations/sanction` → `SanctionQueue.jsx` |
| **List API** | `GET /api/operations/sanction` — loans with `status: "applied"` |
| **Action API** | `PUT /api/operations/sanction/:id` |
| **Approve** | `{ "action": "approve" }` → status `sanctioned` |
| **Reject** | `{ "action": "reject", "rejectionReason": "..." }` → status `rejected` |
| **Roles** | `sanction`, `admin` |

---

### Disbursement Module

| | |
|---|---|
| **Frontend** | `/operations/disbursement` → `DisbursementQueue.jsx` |
| **List API** | `GET /api/operations/disbursement` — loans with `status: "sanctioned"` |
| **Action API** | `PUT /api/operations/disbursement/:id` → status `disbursed` |
| **Roles** | `disbursement`, `admin` |

---

### Collection Module

| | |
|---|---|
| **Frontend** | `/operations/collection` → `Collection.jsx` |
| **List API** | `GET /api/operations/collection` — loans with `status: "disbursed"` |
| **Record payment** | `POST /api/operations/collection/:loanId/payments` |
| **Payment history** | `GET /api/operations/collection/:loanId/payments` |
| **Roles** | `collection`, `admin` |

---

### Admin Dashboard

| | |
|---|---|
| **Frontend** | `/` → `Dashboard.jsx` (admin view) |
| **API** | `GET /api/dashboard/stats` |
| **Shows** | Total borrowers, sales leads, counts per status, total disbursed/collected |

---

## 10. Loan Lifecycle & Status Transitions

```
                    ┌──────────┐
                    │  applied │ ◄── Borrower submits application
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌────────────┐        ┌──────────┐
       │ sanctioned │        │ rejected │ (terminal)
       └─────┬──────┘        └──────────┘
             │
             ▼
       ┌────────────┐
       │ disbursed  │ ◄── Disbursement executive
       └─────┬──────┘
             │
             ▼ (outstandingBalance = 0)
       ┌────────────┐
       │   closed   │ (terminal)
       └────────────┘
```

| Status | Who triggers | Valid previous status |
|--------|--------------|----------------------|
| `applied` | Borrower (apply) | — |
| `sanctioned` | Sanction executive | `applied` |
| `rejected` | Sanction executive | `applied` |
| `disbursed` | Disbursement executive | `sanctioned` |
| `closed` | System (auto) | `disbursed` |

---

## 11. Business Rule Engine (BRE)

**Location:** `backend/src/services/bre.js`  
**Runs on:** Server only (never trust client)

| Rule | Condition | Error message |
|------|-----------|---------------|
| Age | 23 – 50 years | "Age must be between 23 and 50 years" |
| Salary | ≥ ₹25,000/month | "Monthly salary must be at least ₹25,000" |
| PAN | `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` | "PAN must match valid format" |
| Employment | Not `unemployed` | "Unemployed applicants are not eligible" |

BRE runs:
1. On `PUT /api/borrower/profile` (blocks save if fail)
2. On `POST /api/loans/apply` (re-validates before creating loan)

---

## 12. Loan Calculation (Simple Interest)

**Location:** `backend/src/services/loanCalculator.js`  
**Fixed rate:** 12% p.a.

```
SI = (P × R × T) / (365 × 100)

Where:
  P = principal (loan amount)
  R = 12 (interest rate %)
  T = tenure in days

Total Repayment = P + SI
```

**Validation:**
- Amount: ₹50,000 – ₹5,00,000
- Tenure: 30 – 365 days

Frontend calls `POST /api/borrower/calculate` as sliders move for live preview.  
Backend recalculates on apply — client values are never trusted alone.

---

## 13. Payment & Collection Flow

```mermaid
sequenceDiagram
    participant C as Collection Executive
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    C->>F: Select disbursed loan
    F->>B: GET /api/operations/collection/:loanId/payments
    B-->>F: Payment history + outstanding balance
    C->>F: Enter UTR, amount, date
    F->>B: POST /api/operations/collection/:loanId/payments
    B->>B: Validate UTR unique
    B->>B: Validate amount ≤ outstandingBalance
    B->>DB: Create Payment, update Loan.outstandingBalance
    alt outstandingBalance = 0
        B->>DB: loan.status = "closed"
    end
    B-->>F: Updated loan + payment
```

**Validations:**
- UTR must be unique (DB unique index + pre-check)
- Amount must be > 0 and ≤ outstanding balance
- Loan must be in `disbursed` status
- Auto-close when `outstandingBalance` reaches 0

---

## 14. Complete API Reference

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register borrower |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Auth | Current user profile |

### Borrower — `/api/borrower`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | `/profile` | Borrower | Update profile + BRE |
| POST | `/salary-slip` | Borrower | Upload file (multipart) |
| POST | `/calculate` | Borrower | Preview loan calculation |

### Loans — `/api/loans`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/apply` | Borrower | Submit loan application |
| GET | `/my` | Borrower | Get own loans |
| GET | `/:id` | Borrower / Executives | Get loan by ID |

### Operations — `/api/operations`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/sales/leads` | Sales, Admin | Registered users without loans |
| GET | `/sanction` | Sanction, Admin | Applied loans queue |
| PUT | `/sanction/:id` | Sanction, Admin | Approve/reject loan |
| GET | `/disbursement` | Disbursement, Admin | Sanctioned loans queue |
| PUT | `/disbursement/:id` | Disbursement, Admin | Mark disbursed |
| GET | `/collection` | Collection, Admin | Disbursed loans |
| GET | `/collection/closed` | Collection, Admin | Closed loans |
| POST | `/collection/:loanId/payments` | Collection, Admin | Record payment |
| GET | `/collection/:loanId/payments` | Collection, Admin | Payment history |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Aggregated dashboard stats |

---

## 15. Frontend ↔ Backend Mapping

| Frontend Page | Frontend Service | Backend Route | Controller |
|---------------|------------------|---------------|------------|
| `Login.jsx` | `authService.login` | `POST /api/auth/login` | `authController.loginUser` |
| `Register.jsx` | `authService.register` | `POST /api/auth/register` | `authController.registerUser` |
| `PersonalDetails.jsx` | `borrowerService.updateProfile` | `PUT /api/borrower/profile` | `borrowerController.updateProfile` |
| `UploadSalarySlip.jsx` | `borrowerService.uploadSalarySlip` | `POST /api/borrower/salary-slip` | `borrowerController.uploadSalarySlip` |
| `LoanApplication.jsx` | `borrowerService.calculateLoan` | `POST /api/borrower/calculate` | `borrowerController.previewLoanCalculation` |
| `LoanApplication.jsx` | `loanService.applyForLoan` | `POST /api/loans/apply` | `loanController.applyForLoan` |
| `MyLoans.jsx` | `loanService.getMyLoans` | `GET /api/loans/my` | `loanController.getMyLoans` |
| `SalesLeads.jsx` | `operationsService.getSalesLeads` | `GET /api/operations/sales/leads` | `salesController.getSalesLeads` |
| `SanctionQueue.jsx` | `operationsService.getSanctionQueue` | `GET /api/operations/sanction` | `sanctionController.getSanctionQueue` |
| `SanctionQueue.jsx` | `operationsService.updateSanctionStatus` | `PUT /api/operations/sanction/:id` | `sanctionController.updateSanctionStatus` |
| `DisbursementQueue.jsx` | `operationsService.markDisbursed` | `PUT /api/operations/disbursement/:id` | `disbursementController.markDisbursed` |
| `Collection.jsx` | `operationsService.recordPayment` | `POST /api/operations/collection/:loanId/payments` | `collectionController.recordPayment` |
| `Dashboard.jsx` (admin) | `dashboardService.getDashboardStats` | `GET /api/dashboard/stats` | `dashboardController.getDashboardStats` |

### Request flow (example: loan apply)

```
LoanApplication.jsx
  → loanService.applyForLoan({ amount, tenureDays })
    → api.js (adds JWT header)
      → POST http://localhost:5000/api/loans/apply
        → authMiddleware.protect
        → roleMiddleware.authorizeRoles("borrower")
        → loanController.applyForLoan
          → bre.js (re-validate)
          → loanCalculator.js (compute SI)
          → Loan.create({ status: "applied", ... })
        ← 201 + loan object
      ← response
    ← data
  → navigate("/my-loans")
```

---

## 16. Environment & Setup

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://admin:password123@127.0.0.1:27017/credflow?authSource=admin
JWT_SECRET=your_jwt_secret
```

> Use `127.0.0.1` (not `mongodb`) when connecting from host machine to Docker MongoDB.

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Seed credentials

```bash
cd backend
npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| admin | admin@lms.com | admin123 |
| sales | sales@lms.com | sales123 |
| sanction | sanction@lms.com | sanction123 |
| disbursement | disbursement@lms.com | disbursement123 |
| collection | collection@lms.com | collection123 |
| borrower | borrower@lms.com | borrower123 |

---

## Quick Reference: Full User Journey

```
1. Borrower registers/logs in
2. Fills personal details → BRE runs on server
3. Uploads salary slip (PDF/JPG/PNG, ≤5MB)
4. Configures loan with sliders → simple interest preview
5. Applies → loan status: APPLIED

6. Sales sees lead disappear (user now has a loan)
7. Sanction approves → SANCTIONED
8. Disbursement marks disbursed → DISBURSED
9. Collection records payments (unique UTR)
10. When fully paid → CLOSED (automatic)
```

---

*See also: [DEMO_VIDEO_SCRIPT.md](./DEMO_VIDEO_SCRIPT.md) for the 5-minute demo recording guide.*
