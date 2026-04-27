export function AuthDivider({ text = 'o continúa con' }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 h-px bg-[#EDE3C8]" />
      <span className="text-[12px] font-medium text-[#C4B48A] whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-[#EDE3C8]" />
    </div>
  );
}
