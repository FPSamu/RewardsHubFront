import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // Nota el prefijo /auth que es crucial
      await axios.post(`${backendUrl}/auth/forgot-password`, { email });

      setStatus('success');
      setMessage('Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Hubo un problema al intentar enviar el correo. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* SEO Meta Tags */}
      <SEO
        title="Recuperar Contraseña - RewardsHub"
        description="¿Olvidaste tu contraseña de RewardsHub? Recupera el acceso a tu cuenta ingresando tu correo electrónico. Te enviaremos instrucciones para restablecer tu contraseña."
        keywords="recuperar contraseña, olvidar contraseña, restablecer contraseña, rewardsHub, reset password"
        type="website"
      />

      <div className="max-w-md w-full bg-surface shadow-card rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-gray-600">Ingresa tu email y te enviaremos las instrucciones.</p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-success/20 text-accent-success-onColor">
              <svg className="w-8 h-8 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-6">{message}</p>
            <Link
              to="/login"
              className="text-brand-primary font-semibold hover:underline"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="tu@email.com"
              />
            </div>

            {status === 'error' && (
              <div className="text-sm text-accent-danger text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-brand-onColor bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-primary">
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;