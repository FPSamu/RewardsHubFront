export function AuthCard({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF6] py-12 px-4 sm:px-6">
      <div
        className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#EDE3C8]"
        style={{ boxShadow: '0 4px 12px rgba(20,16,5,0.09)' }}
      >
        {children}
      </div>
    </div>
  );
}
