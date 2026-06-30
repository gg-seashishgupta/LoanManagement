const StatCard = ({ title, value }) => {
  return (
    <div className="bg-[var(--color-primary)] rounded-lg shadow-xl/30 p-4">
      <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
};

export default StatCard;
