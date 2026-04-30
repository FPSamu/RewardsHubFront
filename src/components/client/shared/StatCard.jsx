export function StatCard({ label, value, icon, accent = 'brand' }) {
  const accents = {
    brand:   { bg: 'bg-brand-muted',      text: 'text-brand-primary' },
    success: { bg: 'bg-accent-successBg', text: 'text-accent-success' },
    info:    { bg: 'bg-accent-infoBg',    text: 'text-accent-info' },
  };
  const { bg, text } = accents[accent] ?? accents.brand;

  return (
    <div className="bg-surface rounded-xl border border-neutral-200 shadow-card p-3 flex flex-col items-center gap-2 text-center">
      <div className={`${bg} ${text} p-2.5 rounded-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 w-full">
        <p className={`text-xl font-bold ${text} leading-tight`}>{value}</p>
        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide truncate mt-0.5">{label}</p>
      </div>
    </div>
  );
}
