import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ApplicationStepper from "../../components/common/ApplicationStepper";
import { uploadSalarySlip } from "../../services/borrowerService";
import { getFileUrl } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const UploadSalarySlip = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setError("");
    try {
      setLoading(true);
      await uploadSalarySlip(file);
      await refreshUser();
      navigate("/apply/loan");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload salary slip");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.brePassed) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
          Complete personal details and pass eligibility check first.{" "}
          <button
            onClick={() => navigate("/apply/profile")}
            className="text-[var(--color-accent)] hover:underline"
          >
            Go to Personal Details
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
          Upload Salary Slip
        </h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Accepted formats: PDF, JPG, PNG. Maximum size: 5 MB.
        </p>

        <ApplicationStepper currentStep={1} user={user} />

        <div className="rounded-lg bg-[var(--color-surface)] p-6 shadow-xl/30">
          {error && (
            <div className="mb-4 rounded bg-red-950/40 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {user?.salarySlipPath && (
            <div className="mb-4 rounded bg-green-950/30 px-4 py-3 text-sm text-green-400">
              Current file uploaded. You can replace it below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Salary Slip
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 w-full text-sm text-[var(--color-text-muted)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--color-accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              />
            </div>

            {user?.salarySlipPath && (
              <a
                href={getFileUrl(user.salarySlipPath)}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm text-[var(--color-accent)] hover:underline"
              >
                View uploaded file
              </a>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload & Continue"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadSalarySlip;
