import { useState, useEffect, useRef } from 'react';
import { StaggerGroup, StaggerItem } from './motionPrimitives';

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

function StatItem({ value, label, suffix = '', gradient }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center sm:text-left">
      <p
        className="font-display text-[34px] sm:text-[42px] font-extrabold leading-none tabular-nums"
        style={{
          background: gradient,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-slate-500 text-[12px] font-medium mt-1.5 uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="py-16 px-5 relative">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-[28px] border border-white bg-white/60 backdrop-blur-xl px-6 py-9 sm:px-10 shadow-[0_20px_60px_-25px_rgba(91,45,160,0.25)]">
          <StaggerGroup className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-slate-200">
            <StaggerItem className="w-full sm:w-auto sm:px-12 sm:flex-1" axis="y">
              <StatItem value={500} suffix="+" label="Negocios afiliados" gradient="linear-gradient(135deg, #FF5FA2, #D6368F)" />
            </StaggerItem>
            <StaggerItem className="w-full sm:w-auto sm:px-12 sm:flex-1" axis="y">
              <StatItem value={10000} suffix="+" label="Clientes activos" gradient="linear-gradient(135deg, #8B5CF6, #6D28D9)" />
            </StaggerItem>
            <StaggerItem className="w-full sm:w-auto sm:px-12 sm:flex-1" axis="y">
              <StatItem value={2000000} suffix="+" label="Puntos otorgados" gradient="linear-gradient(135deg, #38BDF8, #0284C7)" />
            </StaggerItem>
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
