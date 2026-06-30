import Loan from "../models/Loan.js";

// @desc    Get loans pending sanction review
// @route   GET /api/operations/sanction
export const getSanctionQueue = async (req, res) => {
  try {
    const loans = await Loan.find({ status: "applied" })
      .populate("borrower", "name email pan monthlySalary employmentMode")
      .sort({ createdAt: 1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sanction queue" });
  }
};

// @desc    Approve or reject a loan application
// @route   PUT /api/operations/sanction/:id
export const updateSanctionStatus = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be approve or reject" });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "applied") {
      return res.status(400).json({
        message: "Only applied loans can be reviewed for sanction",
      });
    }

    if (action === "reject") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({
          message: "Rejection reason is required when rejecting a loan",
        });
      }

      loan.status = "rejected";
      loan.rejectionReason = rejectionReason.trim();
      loan.sanctionedBy = req.user._id;
      loan.sanctionedAt = new Date();
    } else {
      loan.status = "sanctioned";
      loan.rejectionReason = undefined;
      loan.sanctionedBy = req.user._id;
      loan.sanctionedAt = new Date();
    }

    await loan.save();

    const populated = await Loan.findById(loan._id).populate(
      "borrower",
      "name email"
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update sanction status" });
  }
};
