import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ROTATING_TEXTS = ['premian tu lealtad', 'impulsan tu negocio', 'conectan negocios'];

// Mini UI cards that float in the hero
function FloatingCard({ children, style, className = '' }) {
  return (
    <div
      className={`absolute bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Top-left
function StoreCard() {
  return (
    <FloatingCard
      className="px-3 py-2.5 w-40"
      style={{ animation: 'heroFloat1 7s ease-in-out infinite', top: '4%', left: '2%' }}
    >
      <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Negocios cerca</p>
      <div className="flex -space-x-1.5">
        {['B','C','T','M'].map((l, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{ background: `hsl(${30 + i * 45},60%,35%)`, zIndex: 4 - i }}
          >
            {l}
          </div>
        ))}
      </div>
      <p className="text-white/40 text-[10px] mt-1">12 disponibles</p>
    </FloatingCard>
  );
}

// Top-right
function PointsCard() {
  return (
    <FloatingCard
      className="p-4 w-44"
      style={{ animation: 'heroFloat1 5s ease-in-out infinite', top: '4%', right: '2%' }}
    >
      <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Mis Puntos</p>
      <p className="text-white text-[28px] font-extrabold leading-none tabular-nums">1,240</p>
      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full w-[72%] bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
      </div>
      <p className="text-amber-400 text-[10px] font-semibold mt-1.5">+150 esta semana ↑</p>
    </FloatingCard>
  );
}

// Bottom-left — real QR code pointing to /signup
function ScanCard() {
  const qrUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Frewards-hub-opal.vercel.app%2Fsignup&color=EBA626&bgcolor=14100A&margin=6';
  return (
    <FloatingCard
      className="p-3 w-36"
      style={{ animation: 'heroFloat3 4.5s ease-in-out infinite', bottom: '4%', left: '2%' }}
    >
      <p className="text-white/50 text-[10px] font-semibold mb-2 text-center">Escanear y unirte</p>
      <img
        src={qrUrl}
        alt="QR para registrarse"
        className="w-full rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      <p className="text-amber-400/70 text-[9px] text-center mt-1.5">Apunta tu cámara aquí</p>
    </FloatingCard>
  );
}

// Bottom-right
function RewardCard() {
  return (
    <FloatingCard
      className="p-4 w-48"
      style={{ animation: 'heroFloat2 6s ease-in-out infinite', bottom: '4%', right: '2%' }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14" />
          </svg>
        </div>
        <div>
          <p className="text-white text-[12px] font-bold leading-tight">Café gratis</p>
          <p className="text-white/50 text-[10px]">Disponible</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="px-2 py-0.5 bg-green-500/15 text-green-400 text-[10px] font-bold rounded-full">500 pts</span>
        <span className="text-white/30 text-[10px]">· Café del Centro</span>
      </div>
    </FloatingCard>
  );
}

export function HeroSection() {
  const [textIdx, setTextIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setTextIdx((i) => (i + 1) % ROTATING_TEXTS.length);
        setAnimating(false);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-[120px]" style={{ animation: 'orbPulse 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-600/6 blur-[100px]" style={{ animation: 'orbPulse 10s ease-in-out infinite 3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-300/5 blur-[80px]" style={{ animation: 'orbPulse 6s ease-in-out infinite 1.5s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,183,51,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,183,51,0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6" style={{ animation: 'fadeInUp 0.6s ease-out both' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-[11px] font-semibold tracking-wide">La plataforma de fidelización #1</span>
            </div>

            {/* Heading */}
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
              <h1
                className="font-extrabold leading-none mb-3"
                style={{ fontSize: 'clamp(38px, 6vw, 68px)', letterSpacing: '-0.02em' }}
              >
                <span className="text-white">Recompensas que</span>
              </h1>
              <div className="relative overflow-hidden h-[1.1em] mb-3" style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}>
                <span
                  className="block font-extrabold leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #EBA626 0%, #FFD876 50%, #EBA626 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% auto',
                    animation: 'shimmerText 3s linear infinite',
                    opacity: animating ? 0 : 1,
                    transform: animating ? 'translateY(20px)' : 'translateY(0)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}
                >
                  {ROTATING_TEXTS[textIdx]}
                </span>
              </div>
            </div>

            <p
              className="text-white/55 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
              style={{ fontSize: 'clamp(15px, 2vw, 18px)', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
            >
              Conecta tu negocio con sus clientes más valiosos. Sistema de puntos, sellos y recompensas en un solo lugar.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
            >
              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#EBA626] text-white font-bold text-[15px] hover:bg-[#d99520] transition-all shadow-xl shadow-amber-900/40 hover:shadow-amber-900/60 hover:scale-[1.02] active:scale-[.98]"
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Para mi negocio
              </Link>
              <Link
                to="/signup"
                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full border border-white/20 text-white font-bold text-[15px] hover:bg-white/8 transition-all hover:border-white/30"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Quiero puntos
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="flex items-center gap-5 mt-8 justify-center lg:justify-start"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
            >
              <div className="flex -space-x-2">
                {['#8B4513','#4A7C59','#2E4057','#6B4226'].map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0D0A05] flex items-center justify-center text-[9px] text-white font-bold"
                    style={{ background: color }}
                  >
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-[12px]">
                <span className="text-white/70 font-semibold">+500 negocios</span> ya usan RewardsHub
              </p>
            </div>
          </div>

          {/* Right: Floating UI cards */}
          <div className="relative h-[420px] lg:h-[520px] hidden sm:block">
            <PointsCard />
            <RewardCard />
            <ScanCard />
            <StoreCard />

            {/* Central glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full bg-amber-500/12 blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40" style={{ animation: 'fadeInUp 1s ease-out 1s both' }}>
        <p className="text-white text-[10px] font-medium uppercase tracking-widest">Scroll</p>
        <div className="w-4 h-7 rounded-full border border-white/40 flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 rounded-full bg-white" style={{ animation: 'scrollDot 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  );
}
