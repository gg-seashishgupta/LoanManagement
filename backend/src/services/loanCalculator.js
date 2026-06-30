export const FIXED_INTEREST_RATE = 12;

export const calculateSimpleInterest = (principal, tenureDays) => {
  const P = Number(principal);
  const R = FIXED_INTEREST_RATE;
  const T = Number(tenureDays);

  const simpleInterest = (P * R * T) / (365 * 100);
  const totalRepayment = P + simpleInterest;

  return {
    principal: P,
    interestRate: R,
    tenureDays: T,
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
};

export const validateLoanConfig = (amount, tenureDays) => {
  const errors = [];

  const P = Number(amount);
  const T = Number(tenureDays);

  if (!P || P < 50000 || P > 500000) {
    errors.push("Loan amount must be between ₹50,000 and ₹5,00,000");
  }

  if (!T || T < 30 || T > 365) {
    errors.push("Tenure must be between 30 and 365 days");
  }

  return { valid: errors.length === 0, errors };
};
