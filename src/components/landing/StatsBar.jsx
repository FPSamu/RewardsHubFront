import { useState, useEffect, useRef } from 'react';

function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 50;
    let current = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatItem({ value, label, suffix = '' }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-[32px] sm:text-[40px] font-extrabold text-white leading-none tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-white/45 text-[12px] font-medium mt-1.5 uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="py-16 relative">
      {/* Divider line with glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent to-amber-500/30" />

      <div className="max-w-4xl mx-auto px-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-white/10">
          <div className="sm:px-12 flex-1">
            <StatItem value={500} suffix="+" label="Negocios afiliados" />
          </div>
          <div className="sm:px-12 flex-1">
            <StatItem value={10000} suffix="+" label="Clientes activos" />
          </div>
          <div className="sm:px-12 flex-1">
            <StatItem value={2000000} suffix="+" label="Puntos otorgados" />
          </div>
        </div>
      </div>
    </section>
  );
}
