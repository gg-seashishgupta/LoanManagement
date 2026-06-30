import express from "express";
import { getSalesLeads } from "../controllers/salesController.js";
import {
  getSanctionQueue,
  updateSanctionStatus,
} from "../controllers/sanctionController.js";
import {
  getDisbursementQueue,
  markDisbursed,
} from "../controllers/disbursementController.js";
import {
  getCollectionQueue,
  recordPayment,
  getLoanPayments,
  getClosedLoans,
} from "../controllers/collectionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

const executiveRoles = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
];

router.use(protect);

// Sales module
router.get(
  "/sales/leads",
  authorizeRoles("admin", "sales"),
  getSalesLeads
);

// Sanction module
router.get(
  "/sanction",
  authorizeRoles("admin", "sanction"),
  getSanctionQueue
);
router.put(
  "/sanction/:id",
  authorizeRoles("admin", "sanction"),
  updateSanctionStatus
);

// Disbursement module
router.get(
  "/disbursement",
  authorizeRoles("admin", "disbursement"),
  getDisbursementQueue
);
router.put(
  "/disbursement/:id",
  authorizeRoles("admin", "disbursement"),
  markDisbursed
);

// Collection module
router.get(
  "/collection/closed",
  authorizeRoles("admin", "collection"),
  getClosedLoans
);
router.get(
  "/collection",
  authorizeRoles("admin", "collection"),
  getCollectionQueue
);
router.post(
  "/collection/:loanId/payments",
  authorizeRoles("admin", "collection"),
  recordPayment
);
router.get(
  "/collection/:loanId/payments",
  authorizeRoles("admin", "collection"),
  getLoanPayments
);

export default router;
