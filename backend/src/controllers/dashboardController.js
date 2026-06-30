import Loan from "../models/Loan.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// @desc    Get admin dashboard stats across all modules
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalBorrowers, appliedBorrowerIds, appliedLoans, sanctionedLoans, disbursedLoans, closedLoans, rejectedLoans, totalDisbursedAmount, totalCollected] =
      await Promise.all([
      User.countDocuments({ role: "borrower" }),
      Loan.distinct("borrower"),
      Loan.countDocuments({ status: "applied" }),
      Loan.countDocuments({ status: "sanctioned" }),
      Loan.countDocuments({ status: "disbursed" }),
      Loan.countDocuments({ status: "closed" }),
      Loan.countDocuments({ status: "rejected" }),
      Loan.aggregate([
        { $match: { status: { $in: ["disbursed", "closed"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const salesLeads = totalBorrowers - appliedBorrowerIds.length;

    res.json({
      totalBorrowers,
      salesLeads,
      appliedLoans,
      sanctionedLoans,
      disbursedLoans,
      closedLoans,
      rejectedLoans,
      totalDisbursedAmount: totalDisbursedAmount[0]?.total || 0,
      totalCollected: totalCollected[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};
