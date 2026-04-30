export function AnimatedAuthLayout({ mode, hero, form }) {
  const isLogin = mode === 'login';

  // Hero: 55% wide — left on login, right on signup
  // Form: 45% wide — right on login, left on signup
  const heroStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '55%',
    left: isLogin ? '0%' : '45%',
    transition: 'left 700ms cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  };

  const formStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '45%',
    left: isLogin ? '55%' : '0%',
    transition: 'left 700ms cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
  };

  return (
    <div className="min-h-screen bg-[#FAFAF6]">
      {/* Desktop: animated split panels */}
      <div className="hidden lg:block h-screen relative overflow-hidden">
        <div style={heroStyle}>{hero}</div>
        <div style={formStyle}>{form}</div>
      </div>

      {/* Mobile: stacked, no animation */}
      <div className="lg:hidden min-h-screen flex items-center justify-center px-6 py-12">
        {form}
      </div>
    </div>
  );
}
