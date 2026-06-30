# CredFlow

Developed by Happy Kumar

CredFlow is a full-stack **Loan Management System (LMS)** built with **React, Node.js, and MongoDB**.  
It provides a complete lending workflow: borrower onboarding with eligibility checks, multi-step loan applications, executive operations (sales → sanction → disbursement → collection), and role-based dashboards with a clean, responsive UI.

---

## Features

### Authentication & Authorization
- JWT-based registration and login
- Six roles: `borrower`, `sales`, `sanction`, `disbursement`, `collection`, `admin`
- Protected routes and API endpoints on both frontend and backend

### Borrower Portal
- Multi-step application: profile → salary slip upload → loan configuration
- Server-side **Business Rule Engine (BRE)** for eligibility (age, salary, PAN, employment)
- Live loan preview with simple interest calculation (12% p.a.)
- Track loan status and outstanding balance

### Operations Dashboard
- **Sales** — view registered borrowers without loans
- **Sanction** — approve or reject applied loans
- **Disbursement** — mark sanctioned loans as disbursed
- **Collection** — record payments (unique UTR), view history, auto-close fully paid loans
- **Admin** — access all modules plus aggregated dashboard stats

### Loan Lifecycle
```
applied → sanctioned / rejected → disbursed → closed
```

### UI & UX
- Fully responsive (mobile, tablet, desktop)
- Tailwind CSS fintech-style design
- Reusable layout and component structure

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS 4 |
| Backend | Node.js, Express 5, ES Modules |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Upload | Multer (salary slips) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- MongoDB (local instance, Docker, or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## Installation

1. Clone this repository:

```bash
git clone https://github.com/ImHappyKumar/cred-flow.git
cd cred-flow
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Copy the example files and fill in your values.

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> If using Docker MongoDB from your host machine, use `127.0.0.1` (not `mongodb`) in the connection string. See `backend/.env.example` for a sample.

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Usage

1. Seed demo accounts (optional but recommended):

```bash
cd backend
npm run seed
```

2. Start the backend server:

```bash
npm run dev
```

3. In a separate terminal, start the frontend:

```bash
cd frontend
npm run dev
```

4. Open your browser:

```
http://localhost:5173
```

---

## Demo Accounts

After running `npm run seed` in the backend:

| Role | Email | Password |
|------|-------|----------|
| admin | admin@lms.com | admin123 |
| sales | sales@lms.com | sales123 |
| sanction | sanction@lms.com | sanction123 |
| disbursement | disbursement@lms.com | disbursement123 |
| collection | collection@lms.com | collection123 |
| borrower | borrower@lms.com | borrower123 |

**Note:** Public registration only creates `borrower` accounts. Executive roles are seeded or managed internally — not exposed via public signup.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register borrower |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user profile |
| PUT | `/api/borrower/profile` | Update profile + run BRE |
| POST | `/api/borrower/salary-slip` | Upload salary slip |
| POST | `/api/borrower/calculate` | Preview loan calculation |
| POST | `/api/loans/apply` | Submit loan application |
| GET | `/api/loans/my` | Borrower's loans |
| GET | `/api/operations/sales/leads` | Sales leads |
| GET/PUT | `/api/operations/sanction/*` | Sanction queue |
| GET/PUT | `/api/operations/disbursement/*` | Disbursement queue |
| GET/POST | `/api/operations/collection/*` | Collection & payments |
| GET | `/api/dashboard/stats` | Admin dashboard stats |

For the full API reference, architecture diagrams, and end-to-end flows, see **[SYSTEM_FLOW.md](./SYSTEM_FLOW.md)**.

---

## Project Structure

```
cred-flow/
├── backend/
│   ├── scripts/seed.js       # Seed all role accounts
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, RBAC, file upload
│   │   ├── models/           # User, Loan, Payment
│   │   ├── routes/           # API route definitions
│   │   └── services/         # BRE + loan calculator
│   └── uploads/salary-slips/
└── frontend/
    └── src/
        ├── pages/            # Auth, apply flow, operations, dashboard
        ├── routes/           # App routes + ProtectedRoute
        └── services/         # Axios API layer
```

---

## Contributing

Contributions are welcome. If you find a bug or have a feature suggestion, please open an issue or submit a pull request.
