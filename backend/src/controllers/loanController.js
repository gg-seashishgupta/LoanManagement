import Loan from "../models/Loan.js";
import User from "../models/User.js";
import {
  calculateSimpleInterest,
  validateLoanConfig,
} from "../services/loanCalculator.js";
import { runBRE } from "../services/bre.js";

// @desc    Apply for a loan
// @route   POST /api/loans/apply
export const applyForLoan = async (req, res) => {
  try {
    const { amount, tenureDays } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.profileCompleted || !user.brePassed) {
      return res.status(400).json({
        message: "Complete personal details and pass eligibility check first",
      });
    }

    if (!user.salarySlipPath) {
      return res.status(400).json({
        message: "Upload salary slip before applying",
      });
    }

    const breResult = runBRE({
      dateOfBirth: user.dateOfBirth,
      monthlySalary: user.monthlySalary,
      pan: user.pan,
      employmentMode: user.employmentMode,
    });

    if (!breResult.passed) {
      return res.status(400).json({
        message: "Eligibility check failed",
        errors: breResult.errors,
      });
    }

    const validation = validateLoanConfig(amount, tenureDays);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.errors.join(", ") });
    }

    const activeLoan = await Loan.findOne({
      borrower: user._id,
      status: { $in: ["applied", "sanctioned", "disbursed"] },
    });

    if (activeLoan) {
      return res.status(400).json({
        message: "You already have an active loan application",
      });
    }

    const { simpleInterest, totalRepayment, interestRate } =
      calculateSimpleInterest(amount, tenureDays);

    const loan = await Loan.create({
      borrower: user._id,
      amount: Number(amount),
      tenureDays: Number(tenureDays),
      interestRate,
      simpleInterest,
      totalRepayment,
      outstandingBalance: totalRepayment,
      salarySlipPath: user.salarySlipPath,
      status: "applied",
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit loan application" });
  }
};

// @desc    Get borrower's own loans
// @route   GET /api/loans/my
export const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ borrower: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch loans" });
  }
};

// @desc    Get loan by ID (borrower own loan or executive/admin)
// @route   GET /api/loans/:id
export const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate(
      "borrower",
      "name email pan monthlySalary employmentMode"
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const isBorrower =
      req.user.role === "borrower" &&
      loan.borrower._id.toString() === req.user._id.toString();

    const isExecutive = [
      "admin",
      "sales",
      "sanction",
      "disbursement",
      "collection",
    ].includes(req.user.role);

    if (!isBorrower && !isExecutive) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch loan" });
  }
};
