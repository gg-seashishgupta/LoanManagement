import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 50000,
      max: 500000,
    },
    tenureDays: {
      type: Number,
      required: true,
      min: 30,
      max: 365,
    },
    interestRate: {
      type: Number,
      required: true,
      default: 12,
    },
    simpleInterest: {
      type: Number,
      required: true,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },
    outstandingBalance: {
      type: Number,
      required: true,
    },
    salarySlipPath: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "sanctioned", "rejected", "disbursed", "closed"],
      default: "applied",
    },
    rejectionReason: {
      type: String,
    },
    sanctionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sanctionedAt: {
      type: Date,
    },
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    disbursedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
