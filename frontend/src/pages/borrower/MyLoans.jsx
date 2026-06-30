import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import { getMyLoans } from "../../services/loanService";
import { formatCurrency, formatDate } from "../../utils/format";

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await getMyLoans();
        setLoans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        My Loans
      </h1>

      {loading ? (
        <Loader />
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          No loan applications yet. Complete the application flow to apply.
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div
              key={loan._id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(loan.amount)}
                </h2>
                <StatusBadge status={loan.status} />
              </div>

              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Tenure</dt>
                  <dd>{loan.tenureDays} days</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Interest</dt>
                  <dd>{loan.interestRate}% p.a.</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Total Repayment</dt>
                  <dd>{formatCurrency(loan.totalRepayment)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Outstanding</dt>
                  <dd>{formatCurrency(loan.outstandingBalance)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Applied On</dt>
                  <dd>{formatDate(loan.createdAt)}</dd>
                </div>
                {loan.rejectionReason && (
                  <div className="sm:col-span-2">
                    <dt className="text-[var(--color-text-muted)]">Rejection Reason</dt>
                    <dd className="text-red-400">{loan.rejectionReason}</dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyLoans;
