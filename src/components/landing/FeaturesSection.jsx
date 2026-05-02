import { useState } from 'react';

// 3D tilt effect on hover
function TiltCard({ children, className = '' }) {
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
    bg: 'rgba(235,166,38,0.07)',
    border: 'rgba(235,166,38,0.18)',
  },
  {
    label: 'Visibilidad',
    title: 'Los clientes llegan a ti',
    description: 'Tu negocio aparece en el mapa donde los clientes exploran opciones cercanas, ven recompensas disponibles y trazan ruta hacia tu local.',
    image: 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/MapFeature.png',
    color: '#0077CC',
    bg: 'rgba(0,119,204,0.07)',
    border: 'rgba(0,119,204,0.18)',
  },
  {
    label: 'Reportes',
    title: 'Datos que impulsan decisiones',
    description: 'Genera reportes por periodo y compara ventas contra puntos otorgados. Detecta tendencias y asegúrate de que tu programa rinde frutos.',
    image: 'https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/GenerateReports.png',
    color: '#22A06B',
    bg: 'rgba(34,160,107,0.07)',
    border: 'rgba(34,160,107,0.18)',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-5" data-aos="fade-up">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-amber-400/70 text-[11px] font-bold uppercase tracking-widest mb-3">Funcionalidades</p>
          <h2 className="text-white text-[clamp(28px,5vw,42px)] font-extrabold leading-tight">
            Todo lo que necesita tu negocio
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <TiltCard
              key={i}
              className="rounded-2xl overflow-hidden border flex flex-col group cursor-default"
              data-aos="fade-up"
              data-aos-delay={i * 100}
              style={{ background: f.bg, borderColor: f.border }}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-44 bg-black/20">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span
                  className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}30` }}
                >
                  {f.label}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-white text-[15px] font-bold mb-2 leading-tight">{f.title}</h3>
                <p className="text-white/45 text-[12px] leading-relaxed flex-1">{f.description}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
