export function RewardProgressBar({ current, required, isPoints, canRedeem }) {
  const pct = required > 0 ? Math.min((current / required) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{current} {isPoints ? 'pts' : 'sellos'}</span>
        <span>{required} {isPoints ? 'pts' : 'sellos'}</span>
      </div>
      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${canRedeem ? 'bg-accent-success' : 'bg-brand-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
