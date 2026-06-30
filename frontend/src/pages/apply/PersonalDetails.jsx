import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ApplicationStepper from "../../components/common/ApplicationStepper";
import { updateProfile } from "../../services/borrowerService";
import { useAuth } from "../../hooks/useAuth";

const PersonalDetails = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    pan: user?.pan || "",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    monthlySalary: user?.monthlySalary || "",
    employmentMode: user?.employmentMode || "salaried",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [breErrors, setBreErrors] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setBreErrors([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBreErrors([]);

    try {
      setLoading(true);
      const data = await updateProfile(formData);
      updateUser(data.user);
      navigate("/apply/upload");
    } catch (err) {
      const response = err.response?.data;
      if (response?.errors) {
        setBreErrors(response.errors);
      }
      setError(response?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
          Personal Details
        </h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Complete your profile. Eligibility is checked on the server.
        </p>

        <ApplicationStepper currentStep={0} user={user} />

        <div className="rounded-lg bg-[var(--color-surface)] p-6 shadow-xl/30">
          {(error || breErrors.length > 0) && (
            <div className="mb-4 rounded bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error && <p>{error}</p>}
              {breErrors.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                  {breErrors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                PAN
              </label>
              <input
                type="text"
                name="pan"
                required
                maxLength={10}
                placeholder="ABCDE1234F"
                value={formData.pan}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm uppercase text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Monthly Salary (₹)
              </label>
              <input
                type="number"
                name="monthlySalary"
                required
                min="0"
                value={formData.monthlySalary}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Employment Mode
              </label>
              <select
                name="employmentMode"
                required
                value={formData.employmentMode}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self-Employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Checking eligibility..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PersonalDetails;
