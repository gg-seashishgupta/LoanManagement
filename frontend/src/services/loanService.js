import api from "./api";

export const applyForLoan = async (payload) => {
  const { data } = await api.post("/loans/apply", payload);
  return data;
};

export const getMyLoans = async () => {
  const { data } = await api.get("/loans/my");
  return data;
};

export const getLoanById = async (loanId) => {
  const { data } = await api.get(`/loans/${loanId}`);
  return data;
};
