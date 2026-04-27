export function AuthSplitLayout({ hero, children }) {
  return (
    <div className="min-h-screen flex bg-[#FAFAF6]">
      {hero}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        {children}
      </div>
    </div>
  );
}
