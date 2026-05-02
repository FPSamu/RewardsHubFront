import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/8 py-12 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img
              src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/RewardsHub.png"
              alt="RewardsHub"
              className="h-7 w-auto object-contain"
            />
            <p className="text-white/25 text-[12px]">La plataforma de fidelización #1</p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-[13px] text-white/40">
            <Link to="/login" className="hover:text-white/70 transition-colors">Iniciar sesión</Link>
            <Link to="/signup" className="hover:text-white/70 transition-colors">Para negocios</Link>
            <Link to="/signup" className="hover:text-white/70 transition-colors">Para clientes</Link>
            <Link to="/terminos" className="hover:text-white/70 transition-colors">Términos y condiciones</Link>
          </div>

          {/* Copyright */}
          <p className="text-white/20 text-[12px]">© 2025 RewardsHub</p>
        </div>
      </div>
    </footer>
  );
}
