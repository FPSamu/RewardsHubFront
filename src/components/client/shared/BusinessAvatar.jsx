export function BusinessAvatar({ logoUrl, name, size = 'md', className = '' }) {
  const sizes = {
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-14 h-14 text-lg',
  };
  const cls = `${sizes[size] ?? sizes.md} rounded-full flex-shrink-0 ${className}`;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${cls} object-cover border border-neutral-200`}
      />
    );
  }

  return (
    <div className={`${cls} bg-brand-primary flex items-center justify-center font-bold text-white`}>
      {(name?.[0] ?? '?').toUpperCase()}
    </div>
  );
}
