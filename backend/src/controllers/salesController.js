import User from "../models/User.js";
import Loan from "../models/Loan.js";

// @desc    Get registered borrowers who have not applied for a loan yet
// @route   GET /api/operations/sales/leads
export const getSalesLeads = async (req, res) => {
  try {
    const borrowers = await User.find({ role: "borrower" }).select(
      "-password"
    );

    const appliedBorrowerIds = await Loan.distinct("borrower");

    const leads = borrowers.filter(
      (user) => !appliedBorrowerIds.some((id) => id.equals(user._id))
    );

    res.json(
      leads.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileCompleted: user.profileCompleted,
        brePassed: user.brePassed,
        salarySlipUploaded: Boolean(user.salarySlipPath),
        registeredAt: user.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales leads" });
  }
};
