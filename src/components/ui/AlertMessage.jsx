const styles = {
  error: 'bg-red-50 border-red-200 text-red-600',
  success: 'bg-[#F0FBF6] border-[#22A06B]/30 text-[#22A06B]',
  warning: 'bg-[#FDF3DC] border-[#FAE5AD] text-[#6B3A00]',
};

export function AlertMessage({ children, variant = 'error' }) {
  return (
    <div className={`px-4 py-3 rounded-xl text-[13px] font-medium border ${styles[variant]}`}>
      {children}
    </div>
  );
}
