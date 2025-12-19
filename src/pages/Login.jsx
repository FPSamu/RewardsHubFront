import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import SEO from '../components/SEO';

function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client', // 'client' o 'business'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (formData.userType === 'business') {
        response = await authService.login(formData.email, formData.password, rememberMe, "business");
      } else {
        response = await authService.login(formData.email, formData.password, rememberMe, "client");
      }

      console.log('Login exitoso:', response);

      // Verificar si el usuario está verificado
      const user = response.user || response.business;
      console.log('⚠️ DEBUG - Usuario completo:', user);
      console.log('⚠️ DEBUG - isVerified al hacer login:', user?.isVerified);
      if (!user.isVerified) {
        // Usuario no verificado, redirigir a pantalla de espera
        navigate('/verify-pending');
        return;
      }

      // Usuario verificado, redirigir según el tipo de usuario
      if (formData.userType === 'business') {
        navigate('/business/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      {/* SEO Meta Tags */}
      <SEO
        title="Iniciar Sesión - RewardsHub"
        description="Inicia sesión en RewardsHub para acceder a tu cuenta de cliente o negocio. Gestiona tus puntos, recompensas y programa de fidelización."
        keywords="login, iniciar sesión, rewardsHub, acceso, cuenta, cliente, negocio"
        type="website"
      />
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)] border border-[#E9ECEF]">
          <div>
            <div className="flex justify-center mb-4">
              <img
                src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                alt="RewardsHub Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <h2 className="text-center text-[32px] leading-[40px] font-extrabold text-[#0F172A] tracking-tight">
              RewardsHub
            </h2>
            <p className="mt-3 text-center text-[14px] leading-5 font-medium text-[#6C757D]">
              Inicia sesión en tu cuenta
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[14px] text-[14px] leading-5 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Tipo de Usuario */}
              <div>
                <label className="block text-[14px] leading-5 font-semibold text-[#495057] mb-3">
                  Tipo de Cuenta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'client' })}
                    className={`h-10 px-4 rounded-full text-[14px] leading-5 font-semibold border-2 transition-all duration-180 ${formData.userType === 'client'
                      ? 'border-[#FFB733] bg-[#FFF4E0] text-[#8B5A00]'
                      : 'border-[#DEE2E6] bg-white text-[#495057] hover:border-[#ADB5BD]'
                      }`}
                  >
                    👤 Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'business' })}
                    className={`h-10 px-4 rounded-full text-[14px] leading-5 font-semibold border-2 transition-all duration-180 ${formData.userType === 'business'
                      ? 'border-[#74D680] bg-[#F0FDF4] text-[#12391C]'
                      : 'border-[#DEE2E6] bg-white text-[#495057] hover:border-[#ADB5BD]'
                      }`}
                  >
                    🏢 Negocio
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] focus:border-[#FFB733] transition-all duration-180"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full h-11 px-4 pr-11 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] focus:border-[#FFB733] transition-all duration-180"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#495057] transition-colors duration-180 focus:outline-none"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#FFB733] focus:ring-[#FFE8C6] border-[#CED4DA] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[14px] leading-5 font-medium text-[#495057]">
                  Recordarme
                </label>
              </div>

              <div className="text-[14px] leading-5">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#FFB733] hover:text-[#EAB000] transition-colors duration-180"
                >
                  ¿Olvidaste tu contraseña?
                  {/* <a href="#" className="font-semibold text-[#FFB733] hover:text-[#EAB000] transition-colors duration-180">
                    ¿Olvidaste tu contraseña?
                  </a> */}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center h-11 px-4 border border-transparent text-[16px] leading-6 font-semibold rounded-full text-white bg-[#FFB733] hover:opacity-95 focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)]"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[14px] leading-5 font-medium text-[#6C757D]">
                ¿No tienes una cuenta?{' '}
                <Link to="/signup" className="font-semibold text-[#FFB733] hover:text-[#EAB000] transition-colors duration-180">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
