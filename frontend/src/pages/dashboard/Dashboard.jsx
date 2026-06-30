import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import { getDashboardStats } from "../../services/dashboardService";
import { getMyLoans } from "../../services/loanService";
import { useAuth } from "../../hooks/useAuth";
import { getHomeRoute } from "../../utils/roles";
import { formatCurrency } from "../../utils/format";

const BorrowerDashboard = ({ user }) => {
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

  const steps = [
    {
      label: "Personal Details",
      done: user.brePassed,
      path: "/apply/profile",
    },
    {
      label: "Salary Slip",
      done: Boolean(user.salarySlipPath),
      path: "/apply/upload",
    },
    {
      label: "Apply for Loan",
      done: loans.some((l) =>
        ["applied", "sanctioned", "disbursed", "closed"].includes(l.status)
      ),
      path: "/apply/loan",
    },
  ];

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        Welcome, {user.name}
      </h1>

      <div className="mb-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
        <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
          Application Progress
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <Link
              key={step.path}
              to={step.path}
              className="rounded-md border border-[var(--color-border)] p-4 transition hover:border-[var(--color-accent)]"
            >
              <div className="mb-1 text-sm font-medium">{step.label}</div>
              <div
                className={`text-xs ${
                  step.done ? "text-green-400" : "text-[var(--color-text-muted)]"
                }`}
              >
                {step.done ? "Completed" : "Pending"}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
        Your Loans
      </h2>

      {loading ? (
        <Loader />
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          No loans yet.{" "}
          <Link to="/apply/loan" className="text-[var(--color-accent)] hover:underline">
            Start application
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {loans.slice(0, 4).map((loan) => (
            <div
              key={loan._id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{formatCurrency(loan.amount)}</span>
                <StatusBadge status={loan.status} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Outstanding: {formatCurrency(loan.outstandingBalance)}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Borrowers" value={stats?.totalBorrowers || 0} />
        <StatCard title="Sales Leads" value={stats?.salesLeads || 0} />
        <StatCard title="Applied Loans" value={stats?.appliedLoans || 0} />
        <StatCard title="Sanctioned" value={stats?.sanctionedLoans || 0} />
        <StatCard title="Disbursed" value={stats?.disbursedLoans || 0} />
        <StatCard title="Closed" value={stats?.closedLoans || 0} />
        <StatCard title="Rejected" value={stats?.rejectedLoans || 0} />
        <StatCard
          title="Total Collected"
          value={formatCurrency(stats?.totalCollected || 0)}
        />
      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role !== "admin" && user.role !== "borrower") {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  return (
    <DashboardLayout>
      {user.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <BorrowerDashboard user={user} />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
