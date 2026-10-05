import { useState } from 'react';
import { Reveal3D, StaggerGroup, StaggerItem, OrganicBlob } from './motionPrimitives';

// 3D tilt effect on hover
function TiltCard({ children, className = '', style }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 14;
    setTilt({ x: -y, y: x });
  };

  return (
    <div
      className={className}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        ...style,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
        transition: tilt.x === 0 ? 'transform 0.5s ease' : 'transform 0.1s ease',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    label: 'Administración',
    title: 'Dashboard de control total',
    description: 'Gestiona clientes, puntos, recompensas y sucursales desde un panel moderno e intuitivo. Métricas en tiempo real de tu negocio.',
    image: 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsManagement.png',
    color: '#EBA626',
    gradient: 'linear-gradient(90deg, #EBA626, #FF5FA2)',
  },
  {
    label: 'Visibilidad',
    title: 'Los clientes llegan a ti',
    description: 'Tu negocio aparece en el mapa donde los clientes exploran opciones cercanas, ven recompensas disponibles y trazan ruta hacia tu local.',
    image: 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/MapFeature.png',
    color: '#0284C7',
    gradient: 'linear-gradient(90deg, #38BDF8, #0284C7)',
  },
  {
    label: 'Reportes',
    title: 'Datos que impulsan decisiones',
    description: 'Genera reportes por periodo y compara ventas contra puntos otorgados. Detecta tendencias y asegúrate de que tu programa rinde frutos.',
    image: 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/GenerateReports.png',
    color: '#7C3AED',
    gradient: 'linear-gradient(90deg, #8B5CF6, #34D399)',
  },
];

function FeatureCard({ f, imageHeight = 'h-44' }) {
  return (
    <TiltCard
      className="h-full rounded-[28px] overflow-hidden border border-white bg-white/70 backdrop-blur-xl flex flex-col group cursor-default shadow-[0_20px_60px_-25px_rgba(91,45,160,0.25)]"
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${imageHeight} bg-slate-100`}>
        <img
          src={f.image}
          alt={f.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: f.gradient }} />
        <span
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wide"
          style={{ color: f.color }}
        >
          {f.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-slate-900 text-[17px] font-bold mb-2 leading-tight">{f.title}</h3>
        <p className="text-slate-500 text-[12px] leading-relaxed flex-1">{f.description}</p>
      </div>
    </TiltCard>
  );
}

export function FeaturesSection() {
  const [big, ...rest] = FEATURES;
  return (
    <section className="py-24 px-5 relative overflow-hidden">
      <OrganicBlob color="#34D399" size={440} opacity={0.14} radius="50%" blur={120} duration={21} className="bottom-0 -left-20" />

      <div className="max-w-5xl mx-auto relative">

        <Reveal3D className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#0284C7' }}>Funcionalidades</p>
          <h2 className="font-display text-slate-900 text-[clamp(32px,5.5vw,48px)] font-extrabold leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Todo lo que necesita tu negocio
          </h2>
        </Reveal3D>

        {/* Bento grid — one large showcase feature, two stacked beside it */}
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-12 gap-5" stagger={0.14}>
          <StaggerItem className="md:col-span-7" y={60} rotate={16}>
            <FeatureCard f={big} imageHeight="h-64 md:h-[340px]" />
          </StaggerItem>
          <div className="md:col-span-5 grid grid-cols-1 gap-5">
            {rest.map((f, i) => (
              <StaggerItem key={i} y={60} rotate={16}>
                <FeatureCard f={f} imageHeight="h-40" />
              </StaggerItem>
            ))}
          </div>
        </StaggerGroup>
      </div>
    </section>
  );
}
