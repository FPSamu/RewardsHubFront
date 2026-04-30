import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import SEO from '../components/SEO';
import { AuthCard } from '../components/auth/AuthCard';
import { BrandLogo } from '../components/ui/BrandLogo';
import { FormInput } from '../components/ui/FormInput';
import { AlertMessage } from '../components/ui/AlertMessage';
import { SubmitButton } from '../components/ui/SubmitButton';

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('success');
      setMessage('Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.');
    } catch (error) {
      console.error(error);
      // Always show a neutral message to avoid email enumeration
      setStatus('success');
      setMessage('Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.');
    }
  };

  return (
    <AuthCard>
      <SEO
        title="Recuperar Contraseña - RewardsHub"
        description="¿Olvidaste tu contraseña de RewardsHub? Recupera el acceso a tu cuenta ingresando tu correo electrónico."
        keywords="recuperar contraseña, olvidar contraseña, restablecer contraseña, rewardsHub"
        type="website"
      />

      <div className="flex flex-col items-center mb-8">
        <BrandLogo size="lg" orientation="vertical" />
        <h2 className="mt-4 text-[22px] font-extrabold text-[#13110A] tracking-tight">Recuperar Contraseña</h2>
        <p className="mt-1 text-[14px] text-[#947F4E] font-medium text-center">
          Ingresa tu email y te enviaremos las instrucciones.
        </p>
      </div>

      {status === 'success' ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#F0FBF6]">
            <svg className="w-7 h-7 text-[#22A06B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <AlertMessage variant="success">{message}</AlertMessage>
          <Link to="/login" className="inline-block text-[14px] font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150">
            Volver a Iniciar Sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === 'error' && <AlertMessage>{message}</AlertMessage>}

          <FormInput
            id="email"
            type="email"
            label="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
            icon={<EmailIcon />}
          />

          <SubmitButton loading={status === 'loading'} loadingText="Enviando...">
            Enviar enlace
          </SubmitButton>

          <p className="text-center">
            <Link to="/login" className="text-[13px] font-semibold text-[#947F4E] hover:text-[#EBA626] transition-colors duration-150">
              ← Volver a Iniciar Sesión
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
