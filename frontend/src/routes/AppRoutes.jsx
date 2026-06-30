import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import PersonalDetails from "../pages/apply/PersonalDetails";
import UploadSalarySlip from "../pages/apply/UploadSalarySlip";
import LoanApplication from "../pages/apply/LoanApplication";
import MyLoans from "../pages/borrower/MyLoans";
import SalesLeads from "../pages/operations/SalesLeads";
import SanctionQueue from "../pages/operations/SanctionQueue";
import DisbursementQueue from "../pages/operations/DisbursementQueue";
import Collection from "../pages/operations/Collection";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin", "borrower"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/apply/profile"
        element={
          <ProtectedRoute allowedRoles={["borrower"]}>
            <PersonalDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply/upload"
        element={
          <ProtectedRoute allowedRoles={["borrower"]}>
            <UploadSalarySlip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply/loan"
        element={
          <ProtectedRoute allowedRoles={["borrower"]}>
            <LoanApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-loans"
        element={
          <ProtectedRoute allowedRoles={["borrower"]}>
            <MyLoans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operations/sales"
        element={
          <ProtectedRoute allowedRoles={["admin", "sales"]}>
            <SalesLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/sanction"
        element={
          <ProtectedRoute allowedRoles={["admin", "sanction"]}>
            <SanctionQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/disbursement"
        element={
          <ProtectedRoute allowedRoles={["admin", "disbursement"]}>
            <DisbursementQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/collection"
        element={
          <ProtectedRoute allowedRoles={["admin", "collection"]}>
            <Collection />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
