import { Link } from "react-router-dom";

const steps = [
  { label: "Personal Details", path: "/apply/profile" },
  { label: "Salary Slip", path: "/apply/upload" },
  { label: "Loan Application", path: "/apply/loan" },
];

const ApplicationStepper = ({ currentStep, user }) => {
  const getStepStatus = (index) => {
    if (index === 0) {
      return user?.brePassed ? "complete" : currentStep === 0 ? "current" : "upcoming";
    }
    if (index === 1) {
      if (user?.salarySlipPath) return "complete";
      if (!user?.brePassed) return "upcoming";
      return currentStep === 1 ? "current" : "upcoming";
    }
    if (index === 2) {
      if (!user?.salarySlipPath) return "upcoming";
      return currentStep === 2 ? "current" : "upcoming";
    }
    return "upcoming";
  };

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isComplete = status === "complete";
        const isCurrent = status === "current";

        return (
          <div key={step.path} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isComplete
                  ? "bg-[var(--color-accent)] text-white"
                  : isCurrent
                    ? "border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {isComplete ? "✓" : index + 1}
            </div>
            <Link
              to={step.path}
              className={`text-sm font-medium ${
                isCurrent
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {step.label}
            </Link>
            {index < steps.length - 1 && (
              <div className="hidden h-px flex-1 bg-[var(--color-border)] sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationStepper;
