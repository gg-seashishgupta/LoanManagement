import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "sales",
        "sanction",
        "disbursement",
        "collection",
        "borrower",
      ],
      default: "borrower",
    },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    monthlySalary: {
      type: Number,
    },
    employmentMode: {
      type: String,
      enum: ["salaried", "self-employed", "unemployed"],
    },
    salarySlipPath: {
      type: String,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    brePassed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
