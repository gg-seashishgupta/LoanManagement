import { LOAN_STATUS_COLORS, LOAN_STATUS_LABELS } from "../../utils/format";

const StatusBadge = ({ status }) => {
  const label = LOAN_STATUS_LABELS[status] || status;
  const colorClass =
    LOAN_STATUS_COLORS[status] || "bg-gray-800 text-gray-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
