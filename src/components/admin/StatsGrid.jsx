import { StatCard, SplitStatCard } from './StatCard';

// Icon components
const UsersIcon      = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CoinsIcon      = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StampIcon      = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CheckBadgeIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const TagIcon        = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SINGLE_CARDS = [
  {
    key:         'totalClients',
    icon:        UsersIcon,
    label:       'Total de Clientes',
    description: 'Clientes únicos registrados',
    variant:     'amber',
  },
  {
    key:         'totalRewardsRedeemed',
    icon:        CheckBadgeIcon,
    label:       'Recompensas Canjeadas',
    description: 'Total histórico de canjes',
    variant:     'green',
  },
  {
    key:         'totalActiveRewards',
    icon:        TagIcon,
    label:       'Recompensas Activas',
    description: 'Disponibles para canjear hoy',
    variant:     'purple',
  },
];

export function StatsGrid({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {SINGLE_CARDS.map(({ key, icon, label, description, variant }) => (
        <StatCard
          key={key}
          icon={icon}
          label={label}
          description={description}
          value={stats?.[key]}
          variant={variant}
          loading={loading}
        />
      ))}

      <SplitStatCard
        topIcon={CoinsIcon}
        topLabel="Puntos distribuidos"
        topValue={stats?.totalPointsDistributed}
        bottomIcon={StampIcon}
        bottomLabel="Estampas distribuidas"
        bottomValue={stats?.totalStampsDistributed}
        loading={loading}
      />
    </div>
  );
}
