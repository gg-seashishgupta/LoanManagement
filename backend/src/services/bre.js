const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
};

export const runBRE = ({ dateOfBirth, monthlySalary, pan, employmentMode }) => {
  const errors = [];

  if (!dateOfBirth) {
    errors.push("Date of birth is required");
  } else {
    const age = calculateAge(dateOfBirth);
    if (age < 23 || age > 50) {
      errors.push("Age must be between 23 and 50 years");
    }
  }

  if (monthlySalary === undefined || monthlySalary === null) {
    errors.push("Monthly salary is required");
  } else if (Number(monthlySalary) < 25000) {
    errors.push("Monthly salary must be at least ₹25,000");
  }

  if (!pan) {
    errors.push("PAN is required");
  } else if (!PAN_REGEX.test(pan.toUpperCase())) {
    errors.push("PAN must match valid format (e.g. ABCDE1234F)");
  }

  if (employmentMode === "unemployed") {
    errors.push("Unemployed applicants are not eligible for loans");
  }

  return {
    passed: errors.length === 0,
    errors,
  };
};

export const validatePAN = (pan) => PAN_REGEX.test(pan.toUpperCase());
