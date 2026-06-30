import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import {
  getCollectionQueue,
  getLoanPayments,
  recordPayment,
} from "../../services/operationsService";
import { formatCurrency, formatDate } from "../../utils/format";

const Collection = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loanSummary, setLoanSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    utrNumber: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const fetchLoans = async () => {
    try {
      const data = await getCollectionQueue();
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

  const handleSelectLoan = async (loan) => {
    setSelectedLoan(loan);
    setError("");
    setFormData({
      utrNumber: "",
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
    });

    try {
      const data = await getLoanPayments(loan._id);
      setPayments(data.payments);
      setLoanSummary(data.loan);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setError("");
    try {
      setSubmitting(true);
      const result = await recordPayment(selectedLoan._id, {
        utrNumber: formData.utrNumber,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
      });

      setLoanSummary(result.loan);
      setFormData({
        utrNumber: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
      });

      const updated = await getLoanPayments(selectedLoan._id);
      setPayments(updated.payments);

      if (result.loan.status === "closed") {
        await fetchLoans();
        setSelectedLoan(null);
        alert("Payment recorded. Loan is now closed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
        Collection
      </h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Record borrower payments for disbursed loans. UTR must be unique.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl/30">
          <h2 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
            Disbursed Loans
          </h2>

          {loading ? (
            <Loader />
          ) : loans.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No disbursed loans
            </p>
          ) : (
            <ul className="space-y-2">
              {loans.map((loan) => (
                <li
                  key={loan._id}
                  onClick={() => handleSelectLoan(loan)}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition ${
                    selectedLoan?._id === loan._id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20"
                      : "border-[var(--color-border)] hover:bg-[var(--color-primary)]"
                  }`}
                >
                  <div className="font-medium">{loan.borrower?.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {formatCurrency(loan.amount)} • Outstanding{" "}
                    {formatCurrency(loan.outstandingBalance)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {selectedLoan ? (
            <>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-medium text-[var(--color-text-muted)]">
                    Record Payment
                  </h2>
                  {loanSummary && <StatusBadge status={loanSummary.status} />}
                </div>

                {loanSummary && (
                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[var(--color-text-muted)]">
                        Total Repayment:{" "}
                      </span>
                      {formatCurrency(loanSummary.totalRepayment)}
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)]">
                        Outstanding:{" "}
                      </span>
                      {formatCurrency(loanSummary.outstandingBalance)}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded bg-red-950/40 px-4 py-2 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--color-text-muted)]">
                      UTR Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.utrNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, utrNumber: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-[var(--color-text-muted)]">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={loanSummary?.outstandingBalance}
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-text-muted)]">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.paymentDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentDate: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? "Recording..." : "Record Payment"}
                  </button>
                </form>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
                  Payment History
                </h2>

                {payments.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No payments recorded yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                        <tr>
                          <th className="px-4 py-2 text-left">UTR</th>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr
                            key={payment._id}
                            className="border-t border-[var(--color-border)]"
                          >
                            <td className="px-4 py-2">{payment.utrNumber}</td>
                            <td className="px-4 py-2">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-2">
                              {formatDate(payment.paymentDate)}
                            </td>
                            <td className="px-4 py-2">
                              {payment.recordedBy?.name || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
              Select a disbursed loan to record a payment
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Collection;
