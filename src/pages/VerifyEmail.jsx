import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados: 'loading', 'success', 'error'
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró un token de verificación.');
      return;
    }

    const verifyToken = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const isBusiness = location.pathname.includes('/business/');

        const endpoint = isBusiness
          ? `${backendUrl}/business/verify-email?token=${token}`
          : `${backendUrl}/auth/verify-email?token=${token}`;

        await axios.get(endpoint);

        setStatus('success');
        setMessage('¡Tu correo ha sido verificado correctamente!');

        // Opcional: Redirigir automáticamente después de unos segundos
        // setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'El enlace es inválido o ha expirado.');
      }
    };

    // Ejecutamos la verificación solo una vez al montar
    verifyToken();
  }, [token, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* SEO Meta Tags */}
      <SEO
        title="Verificar Email - RewardsHub"
        description="Verifica tu correo electrónico para activar tu cuenta de RewardsHub y comenzar a acumular puntos o fidelizar a tus clientes."
        keywords="verificar email, activar cuenta, confirmar email, rewardsHub"
        type="website"
      />

      <div className="max-w-md w-full bg-surface shadow-card rounded-xl p-8 text-center transition-all">

        {/* ICONOS DE ESTADO */}
        <div className="mb-6 flex justify-center">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div>
          )}

          {status === 'success' && (
            <div className="h-16 w-16 bg-accent-success rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}

          {status === 'error' && (
            <div className="h-16 w-16 bg-accent-danger rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>

        {/* TEXTOS */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'loading' && 'Verificando...'}
          {status === 'success' && '¡Verificación Exitosa!'}
          {status === 'error' && 'Error de Verificación'}
        </h2>

        <p className="text-gray-500 mb-8">
          {message}
        </p>

        {/* BOTONES DE ACCIÓN */}
        {status !== 'loading' && (
          <button
            onClick={() => navigate('/login')}
            className={`w-full py-3 px-6 rounded-sm font-semibold transition-colors duration-200
              ${status === 'success'
                ? 'bg-brand-primary text-brand-onColor hover:bg-brand-primary/90'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {status === 'success' ? 'Ir a Iniciar Sesión' : 'Volver al Inicio'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;