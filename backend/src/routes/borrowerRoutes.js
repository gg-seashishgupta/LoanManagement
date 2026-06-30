import express from "express";
import {
  updateProfile,
  uploadSalarySlip,
  previewLoanCalculation,
} from "../controllers/borrowerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  uploadSalarySlip as uploadMiddleware,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles("borrower"));

router.put("/profile", updateProfile);
router.post(
  "/salary-slip",
  uploadMiddleware,
  handleUploadError,
  uploadSalarySlip
);
router.post("/calculate", previewLoanCalculation);

export default router;
