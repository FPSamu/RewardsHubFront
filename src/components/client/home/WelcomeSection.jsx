export function WelcomeSection({ username }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="px-4 pt-5 pb-1">
      <p className="text-sm font-medium text-neutral-500">{greeting}</p>
      <h1 className="text-2xl font-bold text-neutral-950 tracking-tight mt-0.5">
        {username ?? 'Usuario'}
      </h1>
    </div>
  );
}
