export const censorEmail = (email = '') => {
  const at = email.lastIndexOf('@');
  if (at < 0) return email;
  const local   = email.slice(0, at);
  const domain  = email.slice(at + 1);
  const visible = local.slice(-3);
  const hidden  = '•'.repeat(Math.max(0, local.length - 3));
  return `${hidden}${visible}@${domain}`;
};

export const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('es-MX');
};
