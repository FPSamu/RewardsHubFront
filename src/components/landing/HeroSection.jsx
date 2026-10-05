import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { APP_URL } from '../../utils/appUrl';
import { OrganicBlob } from './motionPrimitives';

// Three.js/R3F are ~250KB gzipped — split into their own chunk so the rest of
// the landing page paints immediately instead of waiting on the 3D libs.
const RewardGem3D = lazy(() => import('./RewardGem3D').then((m) => ({ default: m.RewardGem3D })));

const ROTATING_TEXTS = ['premian tu lealtad', 'impulsan tu negocio', 'conectan negocios'];

// ── Floating glass cards, composited around the 3D gem with real depth ─────
// A shared pointer-tracked tilt (see Scene3DLayer) moves the whole group in
// 3D; each card also gets its own translateZ so nearer cards parallax more.

function FloatingCard({ children, className = '', style, depth = 0, delay = 0 }) {
  return (
    <motion.div
      className={`absolute bg-white/75 backdrop-blur-xl border border-white/90 rounded-2xl shadow-[0_24px_50px_-18px_rgba(91,45,160,0.28)] ${className}`}
      style={{ ...style, transform: `translateZ(${depth}px)` }}
      initial={{ opacity: 0, rotateX: -35, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function StoreCard() {
  return (
    <FloatingCard className="px-3 py-2.5 w-40" style={{ top: '2%', left: '0%', animation: 'heroFloat1 7s ease-in-out infinite' }} depth={30} delay={0.5}>
      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Negocios cerca</p>
      <div className="flex -space-x-1.5">
        {['B', 'C', 'T', 'M'].map((l, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{ background: ['#38BDF8', '#8B5CF6', '#FF5FA2', '#EBA626'][i], zIndex: 4 - i }}
          >
            {l}
          </div>
        ))}
      </div>
      <p className="text-slate-400 text-[10px] mt-1">12 disponibles</p>
    </FloatingCard>
  );
}

function PointsCard() {
  return (
    <FloatingCard className="p-4 w-44" style={{ top: '0%', right: '0%', animation: 'heroFloat1 5s ease-in-out infinite' }} depth={60} delay={0.35}>
      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mb-1">Mis Puntos</p>
      <p className="text-slate-900 text-[28px] font-extrabold leading-none tabular-nums">1,240</p>
      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full w-[72%] rounded-full" style={{ background: 'linear-gradient(90deg, #FF5FA2, #8B5CF6)' }} />
      </div>
      <p className="font-semibold text-[10px] mt-1.5" style={{ color: '#D6368F' }}>+150 esta semana ↑</p>
    </FloatingCard>
  );
}

function ScanCard() {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(APP_URL + '/signup')}&color=1F1B3C&bgcolor=FFFFFF&margin=6`;
  return (
    <FloatingCard className="p-3 w-36" style={{ bottom: '2%', left: '2%', animation: 'heroFloat3 4.5s ease-in-out infinite' }} depth={45} delay={0.65}>
      <p className="text-slate-400 text-[10px] font-semibold mb-2 text-center">Escanear y unirte</p>
      <img
        src={qrUrl}
        alt="QR para registrarse"
        className="w-full rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      <p className="text-[9px] text-center mt-1.5 font-semibold" style={{ color: '#7C3AED' }}>Apunta tu cámara aquí</p>
    </FloatingCard>
  );
}

function RewardCard() {
  return (
    <FloatingCard className="p-4 w-48" style={{ bottom: '0%', right: '2%', animation: 'heroFloat2 6s ease-in-out infinite' }} depth={20} delay={0.8}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14" />
          </svg>
        </div>
        <div>
          <p className="text-slate-900 text-[12px] font-bold leading-tight">Café gratis</p>
          <p className="text-slate-400 text-[10px]">Disponible</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">500 pts</span>
        <span className="text-slate-400 text-[10px]">· Café del Centro</span>
      </div>
    </FloatingCard>
  );
}

// Pointer-tracked 3D tilt wrapper — the gem + all floating cards live inside
// this and lean together toward the cursor, like looking into a shadow box.
function Scene3DLayer() {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative h-[360px] sm:h-[420px] max-w-xl mx-auto"
      style={{ perspective: '1200px' }}
    >
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-48 h-48 rounded-full bg-violet-300/20 blur-3xl" /></div>}>
        <RewardGem3D className="absolute inset-[6%]" />
      </Suspense>

      <motion.div
        className="absolute inset-0 hidden sm:block"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <PointsCard />
        <RewardCard />
        <ScanCard />
        <StoreCard />
      </motion.div>
    </div>
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
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-16">

      {/* Vivid gradient mesh — large saturated color fields, not a single tint */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <OrganicBlob color="#FF5FA2" size={560} opacity={0.35} radius="50%" blur={120} duration={18} className="-top-48 -left-40" />
        <OrganicBlob color="#8B5CF6" size={520} opacity={0.3} radius="50%" blur={120} duration={22} delay={2} className="-top-32 right-[-12%]" />
        <OrganicBlob color="#38BDF8" size={460} opacity={0.3} radius="50%" blur={110} duration={20} delay={4} className="bottom-[-15%] left-[8%]" />
        <OrganicBlob color="#EBA626" size={420} opacity={0.28} radius="50%" blur={100} duration={16} delay={1} className="bottom-[-10%] right-[12%]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white shadow-sm mb-6" style={{ animation: 'fadeInUp 0.6s ease-out both' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #FF5FA2, #8B5CF6)' }} />
          <span className="text-slate-600 text-[11px] font-semibold tracking-wide">La plataforma de fidelización #1</span>
        </div>

        {/* Heading */}
        <div style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
          <h1
            className="font-display font-extrabold leading-[0.95] mb-3"
            style={{ fontSize: 'clamp(38px, 6.5vw, 70px)', letterSpacing: '-0.03em' }}
          >
            <span className="text-slate-900">Recompensas que</span>
          </h1>
          <div className="relative mb-3" style={{ fontSize: 'clamp(28px, 8vw, 70px)' }}>
            <span
              className="block font-display font-extrabold"
              style={{
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #FF5FA2 0%, #8B5CF6 45%, #38BDF8 80%, #FF5FA2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '250% auto',
                animation: 'shimmerText 4s linear infinite',
                opacity: animating ? 0 : 1,
                transition: 'opacity 0.35s ease',
              }}
            >
              {ROTATING_TEXTS[textIdx]}
            </span>
          </div>
        </div>

        <p
          className="text-slate-500 leading-relaxed mb-8 max-w-lg mx-auto"
          style={{ fontSize: 'clamp(15px, 2vw, 18px)', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
        >
          Conecta tu negocio con sus clientes más valiosos. Sistema de puntos, sellos y recompensas en un solo lugar.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center mb-9"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
        >
          <Link
            to="/signup"
            className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#EBA626] text-white font-bold text-[15px] hover:bg-[#d99520] transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[.98]"
          >
            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Para mi negocio
          </Link>
          <Link
            to="/signup"
            className="group flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md text-slate-700 font-bold text-[15px] hover:bg-white hover:border-slate-300 transition-all"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Quiero puntos
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className="flex items-center gap-3 justify-center mb-16"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
        >
          <div className="flex -space-x-2">
            {['#38BDF8', '#8B5CF6', '#FF5FA2', '#EBA626'].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold"
                style={{ background: color }}
              >
                {['A', 'B', 'C', 'D'][i]}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-[12px]">
            <span className="text-slate-800 font-semibold">+500 negocios</span> ya usan RewardsHub
          </p>
        </div>
      </div>

      {/* Centered visual stage: gem + floating glass cards, pointer-tilted */}
      <div className="relative z-10 w-full">
        <Scene3DLayer />
      </div>
    </section>
  );
}
