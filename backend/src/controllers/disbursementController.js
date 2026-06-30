import Loan from "../models/Loan.js";

// @desc    Get sanctioned loans awaiting disbursement
// @route   GET /api/operations/disbursement
export const getDisbursementQueue = async (req, res) => {
  try {
    const loans = await Loan.find({ status: "sanctioned" })
      .populate("borrower", "name email pan")
      .sort({ sanctionedAt: 1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch disbursement queue" });
  }
};

// @desc    Mark a sanctioned loan as disbursed
// @route   PUT /api/operations/disbursement/:id
export const markDisbursed = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "sanctioned") {
      return res.status(400).json({
        message: "Only sanctioned loans can be marked as disbursed",
      });
    }

    loan.status = "disbursed";
    loan.disbursedBy = req.user._id;
    loan.disbursedAt = new Date();

    await loan.save();

    const populated = await Loan.findById(loan._id).populate(
      "borrower",
      "name email"
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark loan as disbursed" });
  }
};
