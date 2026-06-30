import express from "express";
import {
  applyForLoan,
  getMyLoans,
  getLoanById,
} from "../controllers/loanController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/apply", protect, authorizeRoles("borrower"), applyForLoan);
router.get("/my", protect, authorizeRoles("borrower"), getMyLoans);
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "borrower",
    "admin",
    "sales",
    "sanction",
    "disbursement",
    "collection"
  ),
  getLoanById
);

export default router;
