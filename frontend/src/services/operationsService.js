import api from "./api";

export const getSalesLeads = async () => {
  const { data } = await api.get("/operations/sales/leads");
  return data;
};

export const getSanctionQueue = async () => {
  const { data } = await api.get("/operations/sanction");
  return data;
};

export const updateSanctionStatus = async (loanId, action, rejectionReason) => {
  const { data } = await api.put(`/operations/sanction/${loanId}`, {
    action,
    rejectionReason,
  });
  return data;
};

export const getDisbursementQueue = async () => {
  const { data } = await api.get("/operations/disbursement");
  return data;
};

export const markDisbursed = async (loanId) => {
  const { data } = await api.put(`/operations/disbursement/${loanId}`);
  return data;
};

export const getCollectionQueue = async () => {
  const { data } = await api.get("/operations/collection");
  return data;
};

export const getClosedLoans = async () => {
  const { data } = await api.get("/operations/collection/closed");
  return data;
};

export const recordPayment = async (loanId, payload) => {
  const { data } = await api.post(
    `/operations/collection/${loanId}/payments`,
    payload
  );
  return data;
};

export const getLoanPayments = async (loanId) => {
  const { data } = await api.get(`/operations/collection/${loanId}/payments`);
  return data;
};
