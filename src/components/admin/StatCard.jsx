import { formatNumber } from '../../utils/format';

function SkeletonValue() {
  return <div className="h-6 w-16 rounded-md bg-neutral-100 animate-pulse" />;
}

export function SplitStatCard({ topIcon: TopIcon, topLabel, topValue, bottomIcon: BottomIcon, bottomLabel, bottomValue, loading = false }) {
  return (
    <div className="bg-surface rounded-xl shadow-card p-5 flex flex-col justify-between gap-0">
      <div className="flex items-center gap-2.5 pb-3.5 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-infoBg ring-1 ring-blue-200">
          <TopIcon className="w-4 h-4 text-accent-info" />
        </div>
        <div className="min-w-0 flex-1">
          {loading ? <SkeletonValue /> : (
            <p className="text-[22px] font-extrabold text-neutral-950 leading-none tracking-tight">
              {formatNumber(topValue)}
            </p>
          )}
          <p className="text-[11px] font-semibold text-neutral-600 mt-0.5 leading-tight">{topLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-3.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 ring-1 ring-green-200">
          <BottomIcon className="w-4 h-4 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          {loading ? <SkeletonValue /> : (
            <p className="text-[22px] font-extrabold text-neutral-950 leading-none tracking-tight">
              {formatNumber(bottomValue ?? 0)}
            </p>
          )}
          <p className="text-[11px] font-semibold text-neutral-600 mt-0.5 leading-tight">{bottomLabel}</p>
        </div>
      </div>
    </div>
  );
}

const VARIANTS = {
  amber: {
    bg:   'bg-brand-muted',
    icon: 'text-brand-primary',
    ring: 'ring-brand-border',
  },
  blue: {
    bg:   'bg-accent-infoBg',
    icon: 'text-accent-info',
    ring: 'ring-blue-200',
  },
  green: {
    bg:   'bg-accent-successBg',
    icon: 'text-accent-success',
    ring: 'ring-accent-successBorder',
  },
  purple: {
    bg:   'bg-purple-50',
    icon: 'text-purple-600',
    ring: 'ring-purple-200',
  },
};

function Skeleton() {
  return <div className="h-8 w-24 rounded-md bg-neutral-100 animate-pulse" />;
}

export function StatCard({ icon: Icon, label, description, value, variant = 'amber', loading = false }) {
  const { bg, icon, ring } = VARIANTS[variant] ?? VARIANTS.amber;

  return (
    <div className="bg-surface rounded-xl shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${bg} ${ring}`}>
          <Icon className={`w-5 h-5 ${icon}`} />
        </div>
      </div>

      <div>
        {loading ? (
          <Skeleton />
        ) : (
          <p className="text-[28px] font-extrabold text-neutral-950 leading-none tracking-tight">
            {formatNumber(value)}
          </p>
        )}
        <p className="mt-1.5 text-[13px] font-semibold text-neutral-700">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] text-neutral-500">{description}</p>
        )}
      </div>
    </div>
  );
}
