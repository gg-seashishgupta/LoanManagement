import User from "../models/User.js";
import { runBRE } from "../services/bre.js";
import {
  calculateSimpleInterest,
  validateLoanConfig,
} from "../services/loanCalculator.js";

// @desc    Update borrower personal details and run BRE
// @route   PUT /api/borrower/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, pan, dateOfBirth, monthlySalary, employmentMode } =
      req.body;

    if (
      !name ||
      !pan ||
      !dateOfBirth ||
      monthlySalary === undefined ||
      !employmentMode
    ) {
      return res.status(400).json({
        message:
          "Full name, PAN, date of birth, monthly salary, and employment mode are required",
      });
    }

    const validEmployment = ["salaried", "self-employed", "unemployed"];
    if (!validEmployment.includes(employmentMode)) {
      return res.status(400).json({ message: "Invalid employment mode" });
    }

    const breResult = runBRE({
      dateOfBirth,
      monthlySalary,
      pan,
      employmentMode,
    });

    if (!breResult.passed) {
      return res.status(400).json({
        message: "Eligibility check failed",
        brePassed: false,
        errors: breResult.errors,
      });
    }

    const user = await User.findById(req.user._id);

    user.name = name.trim();
    user.pan = pan.toUpperCase().trim();
    user.dateOfBirth = new Date(dateOfBirth);
    user.monthlySalary = Number(monthlySalary);
    user.employmentMode = employmentMode;
    user.profileCompleted = true;
    user.brePassed = true;

    await user.save();

    res.json({
      message: "Profile updated and eligibility check passed",
      brePassed: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pan: user.pan,
        dateOfBirth: user.dateOfBirth,
        monthlySalary: user.monthlySalary,
        employmentMode: user.employmentMode,
        salarySlipPath: user.salarySlipPath,
        profileCompleted: user.profileCompleted,
        brePassed: user.brePassed,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc    Upload salary slip
// @route   POST /api/borrower/salary-slip
export const uploadSalarySlip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Salary slip file is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user.brePassed) {
      return res.status(400).json({
        message: "Complete personal details and pass eligibility check first",
      });
    }

    const relativePath = `/uploads/salary-slips/${req.file.filename}`;
    user.salarySlipPath = relativePath;
    await user.save();

    res.json({
      message: "Salary slip uploaded successfully",
      salarySlipPath: relativePath,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload salary slip" });
  }
};

// @desc    Preview loan calculation (simple interest)
// @route   POST /api/borrower/calculate
export const previewLoanCalculation = async (req, res) => {
  try {
    const { amount, tenureDays } = req.body;

    const validation = validateLoanConfig(amount, tenureDays);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.errors.join(", ") });
    }

    const calculation = calculateSimpleInterest(amount, tenureDays);
    res.json(calculation);
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate loan details" });
  }
};
