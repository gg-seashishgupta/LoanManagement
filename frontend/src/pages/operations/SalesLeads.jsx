import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Loader from "../../components/common/Loader";
import { getSalesLeads } from "../../services/operationsService";
import { formatDate } from "../../utils/format";

const SalesLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getSalesLeads();
        setLeads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
        Sales Leads
      </h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Registered borrowers who have not yet applied for a loan.
      </p>

      {loading ? (
        <Loader />
      ) : leads.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          No leads found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl/30">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Profile</th>
                <th className="px-4 py-3 text-left">BRE</th>
                <th className="px-4 py-3 text-left">Salary Slip</th>
                <th className="px-4 py-3 text-left">Registered</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">
                    {lead.profileCompleted ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.brePassed ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {lead.salarySlipUploaded ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3">{formatDate(lead.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SalesLeads;
