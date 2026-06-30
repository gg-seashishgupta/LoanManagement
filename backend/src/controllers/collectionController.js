import Loan from "../models/Loan.js";
import Payment from "../models/Payment.js";

// @desc    Get disbursed loans for collection
// @route   GET /api/operations/collection
export const getCollectionQueue = async (req, res) => {
  try {
    const loans = await Loan.find({ status: "disbursed" })
      .populate("borrower", "name email pan")
      .sort({ disbursedAt: 1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch collection queue" });
  }
};

// @desc    Record a payment against a disbursed loan
// @route   POST /api/operations/collection/:loanId/payments
export const recordPayment = async (req, res) => {
  try {
    const { utrNumber, amount, paymentDate } = req.body;

    if (!utrNumber || !amount || !paymentDate) {
      return res.status(400).json({
        message: "UTR number, amount, and payment date are required",
      });
    }

    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "disbursed") {
      return res.status(400).json({
        message: "Payments can only be recorded for disbursed loans",
      });
    }

    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than 0" });
    }

    if (paymentAmount > loan.outstandingBalance) {
      return res.status(400).json({
        message: `Payment amount cannot exceed outstanding balance of ₹${loan.outstandingBalance}`,
      });
    }

    const existingUtr = await Payment.findOne({
      utrNumber: utrNumber.trim().toUpperCase(),
    });

    if (existingUtr) {
      return res.status(400).json({ message: "UTR number already exists" });
    }

    const payment = await Payment.create({
      loan: loan._id,
      utrNumber: utrNumber.trim().toUpperCase(),
      amount: paymentAmount,
      paymentDate: new Date(paymentDate),
      recordedBy: req.user._id,
    });

    loan.outstandingBalance = Math.round(
      (loan.outstandingBalance - paymentAmount) * 100
    ) / 100;

    if (loan.outstandingBalance <= 0) {
      loan.outstandingBalance = 0;
      loan.status = "closed";
      loan.closedAt = new Date();
    }

    await loan.save();

    res.status(201).json({
      message:
        loan.status === "closed"
          ? "Payment recorded and loan closed"
          : "Payment recorded successfully",
      payment,
      loan: {
        _id: loan._id,
        status: loan.status,
        outstandingBalance: loan.outstandingBalance,
        totalRepayment: loan.totalRepayment,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "UTR number already exists" });
    }
    res.status(500).json({ message: "Failed to record payment" });
  }
};

// @desc    Get payment history for a loan
// @route   GET /api/operations/collection/:loanId/payments
export const getLoanPayments = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const payments = await Payment.find({ loan: loan._id })
      .populate("recordedBy", "name email role")
      .sort({ paymentDate: -1 });

    res.json({
      loan: {
        _id: loan._id,
        status: loan.status,
        totalRepayment: loan.totalRepayment,
        outstandingBalance: loan.outstandingBalance,
      },
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// @desc    Get closed loans
// @route   GET /api/operations/collection/closed
export const getClosedLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ status: "closed" })
      .populate("borrower", "name email")
      .sort({ closedAt: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch closed loans" });
  }
};
