import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import { AuthCard } from '../components/auth/AuthCard';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PasswordInput } from '../components/ui/PasswordInput';
import { AlertMessage } from '../components/ui/AlertMessage';
import { SubmitButton } from '../components/ui/SubmitButton';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setStatus('error'); setMessage('Las contraseñas no coinciden.'); return; }
    if (!token) { setStatus('error'); setMessage('Token inválido o faltante.'); return; }
    setStatus('loading');
    setMessage('');
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.post(`${backendUrl}/auth/reset-password`, { token, password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Error al restablecer contraseña. El enlace puede haber expirado.');
    }
  };

  if (!token) {
    return (
      <AuthCard>
        <SEO title="Enlace Inválido - RewardsHub" description="El enlace para restablecer contraseña es inválido o ha expirado." type="website" />
        <div className="text-center space-y-4">
          <BrandLogo size="lg" orientation="vertical" />
          <h2 className="text-[20px] font-bold text-[#E5484D]">Enlace inválido</h2>
          <p className="text-[14px] text-[#947F4E]">Falta el token de seguridad en el enlace.</p>
          <Link to="/login" className="inline-block text-[14px] font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150">
            Ir al Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <SEO
        title="Restablecer Contraseña - RewardsHub"
        description="Crea una nueva contraseña segura para tu cuenta de RewardsHub."
        keywords="restablecer contraseña, nueva contraseña, cambiar contraseña, rewardsHub"
        type="website"
      />

      <div className="flex flex-col items-center mb-8">
        <BrandLogo size="lg" orientation="vertical" />
        <h2 className="mt-4 text-[22px] font-extrabold text-[#13110A] tracking-tight">Nueva Contraseña</h2>
        <p className="mt-1 text-[14px] text-[#947F4E] font-medium">Ingresa tu nueva contraseña a continuación.</p>
      </div>

      {status === 'success' ? (
        <div className="text-center space-y-4">
          <div className="h-14 w-14 bg-[#F0FBF6] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-[#22A06B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#13110A]">¡Contraseña actualizada!</h3>
          <p className="text-[14px] text-[#947F4E]">Te estamos redirigiendo al inicio de sesión...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === 'error' && <AlertMessage>{message}</AlertMessage>}

          <PasswordInput
            id="password"
            label="Nueva Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            hint="Mínimo 6 caracteres"
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <SubmitButton loading={status === 'loading'} loadingText="Actualizando...">
            Cambiar Contraseña
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
