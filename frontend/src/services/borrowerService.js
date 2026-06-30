import api from "./api";

export const updateProfile = async (data) => {
  const res = await api.put("/borrower/profile", data);
  return res.data;
};

export const uploadSalarySlip = async (file) => {
  const formData = new FormData();
  formData.append("salarySlip", file);
  const res = await api.post("/borrower/salary-slip", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const calculateLoan = async (amount, tenureDays) => {
  const res = await api.post("/borrower/calculate", { amount, tenureDays });
  return res.data;
};
