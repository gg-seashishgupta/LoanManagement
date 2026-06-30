import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ApplicationStepper from "../../components/common/ApplicationStepper";
import { calculateLoan } from "../../services/borrowerService";
import { applyForLoan } from "../../services/loanService";
import { formatCurrency } from "../../utils/format";
import { useAuth } from "../../hooks/useAuth";

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 500000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;

const LoanApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [amount, setAmount] = useState(100000);
  const [tenureDays, setTenureDays] = useState(180);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const data = await calculateLoan(amount, tenureDays);
        setCalculation(data);
      } catch {
        setCalculation(null);
      }
    };

    fetchCalculation();
  }, [amount, tenureDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await applyForLoan({ amount, tenureDays });
      navigate("/my-loans");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.salarySlipPath) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          Upload your salary slip before applying.{" "}
          <button
            onClick={() => navigate("/apply/upload")}
            className="text-[var(--color-accent)] hover:underline"
          >
            Go to Upload
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
          Loan Application
        </h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Configure your loan. Interest rate is fixed at 12% p.a. (simple interest).
        </p>

        <ApplicationStepper currentStep={2} user={user} />

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg bg-[var(--color-surface)] p-6 shadow-xl/30"
          >
            {error && (
              <div className="mb-4 rounded bg-red-950/40 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--color-text-muted)]">
                    Loan Amount
                  </label>
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={5000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{formatCurrency(MIN_AMOUNT)}</span>
                  <span>{formatCurrency(MAX_AMOUNT)}</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--color-text-muted)]">
                    Tenure (days)
                  </label>
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
                    {tenureDays} days
                  </span>
                </div>
                <input
                  type="range"
                  min={MIN_TENURE}
                  max={MAX_TENURE}
                  step={1}
                  value={tenureDays}
                  onChange={(e) => setTenureDays(Number(e.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
                <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{MIN_TENURE} days</span>
                  <span>{MAX_TENURE} days</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[var(--color-accent)] py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Apply for Loan"}
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-primary)] p-6">
            <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
              Live Calculation
            </h2>

            {calculation ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Principal</dt>
                  <dd className="font-medium">{formatCurrency(calculation.principal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Interest Rate</dt>
                  <dd className="font-medium">{calculation.interestRate}% p.a.</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Tenure</dt>
                  <dd className="font-medium">{calculation.tenureDays} days</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Simple Interest</dt>
                  <dd className="font-medium">
                    {formatCurrency(calculation.simpleInterest)}
                  </dd>
                </div>
                <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
                  <dt className="font-medium text-[var(--color-text-primary)]">
                    Total Repayment
                  </dt>
                  <dd className="text-lg font-semibold text-[var(--color-accent)]">
                    {formatCurrency(calculation.totalRepayment)}
                  </dd>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  SI = (P × R × T) / (365 × 100)
                </p>
              </dl>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Adjust sliders to see calculation
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanApplication;
