import { useState, useEffect, useMemo } from 'react';
import businessService from '../services/businessService';
import userPointsService from '../services/userPointsService';
import authService from '../services/authService';
import rewardService from '../services/rewardService';
import systemService from '../services/systemService';
import { ClientsSearchBar } from '../components/business/clients/ClientsSearchBar';
import { ClientRow } from '../components/business/clients/ClientRow';
import { ClientDetailModal } from '../components/business/clients/ClientDetailModal';
import { formatNumber } from '../utils/format';

function getRewardStatus(reward, points = 0, stamps = 0) {
  if (!reward.isActive) return { available: false, label: 'Inactiva' };
  if (reward.pointsRequired != null) {
    if (points >= reward.pointsRequired) return { available: true, label: 'Disponible' };
    return { available: false, label: `Faltan ${reward.pointsRequired - points} pts` };
  }
  if (reward.stampsRequired != null) {
    if (stamps >= reward.stampsRequired) return { available: true, label: 'Disponible' };
    return { available: false, label: `Faltan ${reward.stampsRequired - stamps} sellos` };
  }
  return { available: false, label: 'Sin requisito' };
}

function countAvailableRewards(rewards, client) {
  return rewards.filter(r =>
    r.isActive && getRewardStatus(r, client.points, client.stamps).available
  ).length;
}

function sortClients(list, key) {
  const copy = [...list];
  switch (key) {
    case 'points':    return copy.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    case 'stamps':    return copy.sort((a, b) => (b.stamps ?? 0) - (a.stamps ?? 0));
    case 'name':      return copy.sort((a, b) => (a.username ?? '').localeCompare(b.username ?? ''));
    case 'lastVisit': return copy.sort((a, b) => new Date(b.lastVisit ?? 0) - new Date(a.lastVisit ?? 0));
    default:          return copy;
  }
}

function PageHeader({ count, loading }) {
  return (
    <div>
      <h1 className="text-[20px] font-extrabold text-neutral-900">Clientes</h1>
      <p className="text-[13px] text-neutral-400 mt-0.5">
        {loading ? 'Cargando…' : `${count} cliente${count !== 1 ? 's' : ''} registrados`}
      </p>
    </div>
  );
}

function SummaryBar({ clients, rewards }) {
  const totalPoints = useMemo(() => clients.reduce((s, c) => s + (c.points ?? 0), 0), [clients]);
  const totalStamps = useMemo(() => clients.reduce((s, c) => s + (c.stamps ?? 0), 0), [clients]);
  const withRewards = useMemo(() => clients.filter(c => countAvailableRewards(rewards, c) > 0).length, [clients, rewards]);

  const items = [
    { label: 'Total clientes',    value: formatNumber(clients.length), color: 'text-brand-primary' },
    { label: 'Puntos entregados', value: formatNumber(totalPoints),    color: 'text-accent-info'   },
    { label: 'Sellos entregados', value: formatNumber(totalStamps),    color: 'text-accent-success'},
    { label: 'Con recompensas',   value: formatNumber(withRewards),    color: 'text-accent-gold'   },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, color }) => (
        <div key={label} className="bg-surface rounded-xl shadow-card px-4 py-3">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</p>
          <p className={`text-[22px] font-extrabold ${color} leading-none mt-1`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="w-10 h-10 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-neutral-100 animate-pulse" />
        <div className="h-2.5 w-44 rounded bg-neutral-100 animate-pulse" />
      </div>
      <div className="hidden sm:flex gap-2">
        <div className="h-6 w-16 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="h-6 w-16 rounded-lg bg-neutral-100 animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState({ searching }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-semibold text-neutral-600">
          {searching ? 'Sin resultados' : 'Aún no tienes clientes'}
        </p>
        <p className="text-[12px] text-neutral-400 mt-0.5">
          {searching ? 'Prueba con otro término de búsqueda' : 'Los clientes aparecerán aquí al acumular puntos'}
        </p>
      </div>
    </div>
  );
}

export default function BusinessClients() {
  const [clients,       setClients]       = useState([]);
  const [rewards,       setRewards]       = useState([]);
  const [rewardSystems, setRewardSystems] = useState({ points: null, stamps: [] });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [sortBy,        setSortBy]        = useState('points');
  const [selected,      setSelected]      = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [usersData, businessData] = await Promise.all([
          userPointsService.getBusinessUsers(),
          businessService.getMyBusiness(),
        ]);

        const clientsRaw = await Promise.all(
          (usersData.users ?? []).map(async (u) => {
            try {
              const details = await authService.getUserById(u.userId);
              return {
                userId:    u.userId,
                username:  details.username ?? 'Usuario',
                email:     details.email    ?? '',
                points:    u.businessPoints?.points    ?? 0,
                stamps:    u.businessPoints?.stamps    ?? 0,
                lastVisit: u.businessPoints?.lastVisit ?? null,
              };
            } catch {
              return {
                userId:    u.userId,
                username:  'Usuario',
                email:     '',
                points:    u.businessPoints?.points    ?? 0,
                stamps:    u.businessPoints?.stamps    ?? 0,
                lastVisit: u.businessPoints?.lastVisit ?? null,
              };
            }
          })
        );

        const [rewardsData, systemsData] = await Promise.all([
          rewardService.getBusinessRewards(businessData.id),
          systemService.getBusinessSystems(),
        ]);

        const pointsSys = systemsData.find(s => s.type === 'points' && s.isActive) ?? null;
        const stampsSys = systemsData.filter(s => s.type === 'stamps' && s.isActive);

        if (!cancelled) {
          setClients(clientsRaw);
          setRewards(rewardsData ?? []);
          setRewardSystems({ points: pointsSys, stamps: stampsSys });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const displayed = useMemo(() => {
    const filtered = search
      ? clients.filter(c =>
          c.username.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
        )
      : clients;
    return sortClients(filtered, sortBy);
  }, [clients, search, sortBy]);

  return (
    <div className="pb-10 space-y-4">
      <PageHeader count={clients.length} loading={loading} />

      {!loading && clients.length > 0 && (
        <SummaryBar clients={clients} rewards={rewards} />
      )}

      <ClientsSearchBar
        search={search}
        onSearch={setSearch}
        sortBy={sortBy}
        onSort={setSortBy}
      />

      <div className="bg-surface rounded-xl shadow-card overflow-hidden">
        {!loading && displayed.length > 0 && (
          <div className="hidden lg:flex items-center gap-3 px-5 py-2 border-b border-neutral-50 bg-neutral-50">
            <div className="w-10 flex-shrink-0" />
            <p className="flex-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Cliente</p>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:block">Balance</p>
            <p className="w-20 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Visita</p>
            <div className="w-4" />
          </div>
        )}

        <div className="divide-y divide-neutral-50">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : displayed.length === 0 ? (
            <EmptyState searching={!!search} />
          ) : (
            displayed.map((client) => (
              <ClientRow
                key={client.userId}
                client={client}
                availableRewards={countAvailableRewards(rewards, client)}
                onSelect={setSelected}
              />
            ))
          )}
        </div>
      </div>

      {selected && (
        <ClientDetailModal
          client={selected}
          rewards={rewards}
          rewardSystems={rewardSystems}
          getRewardStatus={getRewardStatus}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
