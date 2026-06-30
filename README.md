# CredFlow

Developed by Happy Kumar

CredFlow is a full-stack **Loan Management System** built using **React, Node.js, and MongoDB**.  
The application provides a complete loan lifecycle workflow including user authentication, loan applications, admin approvals, EMI payments, and role-based dashboards with a clean, responsive, production-ready UI.

---

## Features

### 🔐 Authentication & Authorization
- User registration and login using JWT authentication
- Role-based access control (Admin & Customer)
- Protected routes to prevent unauthorized access

### 💼 Loan Management
- Customers can apply for loans
- Track loan status (Pending, Approved, Rejected)
- Admin approval and rejection workflow

### 💰 Payments
- EMI payment functionality
- View payment history per loan
- Secure payment handling APIs

### 📊 Dashboard
- Role-aware dashboard (Admin & Customer)
- KPI cards for quick insights
- Clean and minimal fintech-style UI

### 🎨 UI & UX
- Fully responsive (Mobile, Tablet, Desktop)
- Tailwind CSS based clean design
- Reusable and maintainable components

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication

---

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js: https://nodejs.org/
- MongoDB Atlas account (or local MongoDB)

---

## Installation

1. Clone this repository:
```bash
git clone https://github.com/ImHappyKumar/cred-flow.git
```

2. Navigate to the project directory:
```bash
cd cred-flow
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

---

## Environment Variables

Create the following files before running the project.

### Backend (`backend/.env.example`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Rename `.env.example` to `.env` after adding your values.

---

## Usage

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend application:
```bash
cd frontend
npm run dev
```

3. Open your browser and visit:
```
http://localhost:5173
```

---

## Admin Access

Admins are **not publicly registered**.

To create an admin:
1. Register a normal user
2. Update the user's role in MongoDB:
```json
{
  "role": "admin"
}
```

This approach follows real-world security best practices.

---

## API Overview

- POST `/api/auth/register` – Register user  
- POST `/api/auth/login` – Login user  
- GET `/api/loans` – Fetch loans  
- POST `/api/loans` – Create loan  
- PUT `/api/loans/:id/status` – Approve / Reject loan  
- POST `/api/payments` – Pay EMI  
- GET `/api/payments/:loanId` – Payment history  

---

## Contributing

Contributions are welcome!  
If you find a bug or have a feature suggestion, please open an issue or submit a pull request.
