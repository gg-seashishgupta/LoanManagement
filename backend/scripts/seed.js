import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Loan from "../src/models/Loan.js";
import Payment from "../src/models/Payment.js";

dotenv.config();

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@lms.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Sales Executive",
    email: "sales@lms.com",
    password: "sales123",
    role: "sales",
  },
  {
    name: "Sanction Executive",
    email: "sanction@lms.com",
    password: "sanction123",
    role: "sanction",
  },
  {
    name: "Disbursement Executive",
    email: "disbursement@lms.com",
    password: "disbursement123",
    role: "disbursement",
  },
  {
    name: "Collection Executive",
    email: "collection@lms.com",
    password: "collection123",
    role: "collection",
  },
  {
    name: "Borrower Demo",
    email: "borrower@lms.com",
    password: "borrower123",
    role: "borrower",
    pan: "ABCDE1234F",
    dateOfBirth: new Date("1995-06-15"),
    monthlySalary: 45000,
    employmentMode: "salaried",
    profileCompleted: true,
    brePassed: true,
    salarySlipPath: "/uploads/salary-slips/demo-slip.pdf",
  },
];

const seed = async () => {
  try {
    await connectDB();

    await Payment.deleteMany({});
    await Loan.deleteMany({});
    await User.deleteMany({});

    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        ...userData,
        password: hashedPassword,
      });
    }

    console.log("Database seeded successfully!\n");
    console.log("Login credentials:");
    console.log("------------------");
    seedUsers.forEach(({ email, password, role }) => {
      console.log(`${role.padEnd(14)} | ${email.padEnd(22)} | ${password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
