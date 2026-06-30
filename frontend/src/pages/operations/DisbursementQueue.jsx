import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  getDisbursementQueue,
  markDisbursed,
} from "../../services/operationsService";
import { formatCurrency, formatDate } from "../../utils/format";

const DisbursementQueue = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLoans = async () => {
    try {
      const data = await getDisbursementQueue();
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDisburse = async (loanId) => {
    try {
      setActionLoading(loanId);
      await markDisbursed(loanId);
      await fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as disbursed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
        Disbursement Queue
      </h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Mark sanctioned loans as disbursed once funds are released.
      </p>

      {loading ? (
        <Loader />
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          No loans awaiting disbursement.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl/30">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Borrower</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Total Repayment</th>
                <th className="px-4 py-3 text-left">Sanctioned</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan._id}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="px-4 py-3">
                    <div>{loan.borrower?.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {loan.borrower?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(loan.amount)}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(loan.totalRepayment)}
                  </td>
                  <td className="px-4 py-3">{formatDate(loan.sanctionedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={loan.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDisburse(loan._id)}
                      disabled={actionLoading === loan._id}
                      className="rounded bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading === loan._id
                        ? "Processing..."
                        : "Mark Disbursed"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DisbursementQueue;
