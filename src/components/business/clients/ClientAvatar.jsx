export function ClientAvatar({ name, size = 'md' }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  const sizes = {
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-14 h-14 text-[20px]',
  };
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-muted ring-1 ring-brand-border flex items-center justify-center flex-shrink-0`}>
      <span className={`font-bold text-brand-onColor`}>{initial}</span>
    </div>
  );
}
