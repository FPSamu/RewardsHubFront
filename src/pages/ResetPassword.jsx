import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Token inválido o faltante.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // Llamada al backend con el prefijo /auth
      await axios.post(`${backendUrl}/auth/reset-password`, {
        token,
        password
      });

      setStatus('success');
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      // El backend devuelve mensajes como "Invalid or expired token"
      setMessage(error.response?.data?.message || 'Error al restablecer contraseña. El enlace puede haber expirado.');
    }
  };

  // Si no hay token en la URL, mostrar error inmediato
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <SEO
          title="Enlace Inválido - RewardsHub"
          description="El enlace para restablecer contraseña es inválido o ha expirado."
          type="website"
        />
        <div className="max-w-md w-full bg-white shadow-card rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-accent-danger mb-4">Enlace inválido</h2>
          <p className="text-gray-600 mb-6">Falta el token de seguridad en el enlace.</p>
          <Link to="/login" className="text-brand-primary font-bold">Ir al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* SEO Meta Tags */}
      <SEO
        title="Restablecer Contraseña - RewardsHub"
        description="Crea una nueva contraseña segura para tu cuenta de RewardsHub. Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta."
        keywords="restablecer contraseña, nueva contraseña, cambiar contraseña, rewardsHub, reset password"
        type="website"
      />

      <div className="max-w-md w-full bg-surface shadow-card rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Nueva Contraseña</h2>
          <p className="mt-2 text-gray-600">Ingresa tu nueva contraseña a continuación.</p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="h-16 w-16 bg-accent-success rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">¡Contraseña actualizada!</h3>
            <p className="text-gray-600 mt-2">Te estamos redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>

            {status === 'error' && (
              <div className="p-3 rounded-md bg-red-50 text-accent-danger text-sm text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-brand-onColor bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;