export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "—";

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString("en-IN") : "—";

export const LOAN_STATUS_LABELS = {
  applied: "Applied",
  sanctioned: "Sanctioned",
  rejected: "Rejected",
  disbursed: "Disbursed",
  closed: "Closed",
};

export const LOAN_STATUS_COLORS = {
  applied: "bg-amber-950/40 text-amber-400",
  sanctioned: "bg-blue-950/40 text-blue-400",
  rejected: "bg-red-950/40 text-red-400",
  disbursed: "bg-green-950/40 text-green-400",
  closed: "bg-gray-800 text-gray-300",
};
