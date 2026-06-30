import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  getSanctionQueue,
  updateSanctionStatus,
} from "../../services/operationsService";
import { formatCurrency, formatDate } from "../../utils/format";

const SanctionQueue = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = async () => {
    try {
      const data = await getSanctionQueue();
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

  const handleApprove = async (loanId) => {
    try {
      setActionLoading(true);
      await updateSanctionStatus(loanId, "approve");
      await fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve loan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (loanId) => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      setActionLoading(true);
      await updateSanctionStatus(loanId, "reject", rejectionReason);
      setRejectingId(null);
      setRejectionReason("");
      await fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject loan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
        Sanction Queue
      </h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Review applied loans and approve or reject with a reason.
      </p>

      {loading ? (
        <Loader />
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          No loans pending sanction.
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div
              key={loan._id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium text-[var(--color-text-primary)]">
                    {loan.borrower?.name}
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {loan.borrower?.email}
                  </p>
                </div>
                <StatusBadge status={loan.status} />
              </div>

              <dl className="mb-4 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Amount</dt>
                  <dd>{formatCurrency(loan.amount)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Tenure</dt>
                  <dd>{loan.tenureDays} days</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Total Repayment</dt>
                  <dd>{formatCurrency(loan.totalRepayment)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Applied</dt>
                  <dd>{formatDate(loan.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">PAN</dt>
                  <dd>{loan.borrower?.pan || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Salary</dt>
                  <dd>
                    {loan.borrower?.monthlySalary
                      ? `₹${loan.borrower.monthlySalary}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Employment</dt>
                  <dd>{loan.borrower?.employmentMode || "—"}</dd>
                </div>
              </dl>

              {rejectingId === loan._id ? (
                <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    rows={3}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(loan._id)}
                      disabled={actionLoading}
                      className="rounded bg-red-950/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-950/60 disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                      className="rounded border border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-[var(--color-border)] pt-4">
                  <button
                    onClick={() => handleApprove(loan._id)}
                    disabled={actionLoading}
                    className="rounded bg-green-950/40 px-4 py-2 text-xs font-medium text-green-400 hover:bg-green-950/60 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(loan._id)}
                    disabled={actionLoading}
                    className="rounded bg-red-950/40 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-950/60 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SanctionQueue;
