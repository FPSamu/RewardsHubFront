import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../ui/BrandLogo';
import { FormInput } from '../ui/FormInput';
import { PasswordInput } from '../ui/PasswordInput';
import { Checkbox } from '../ui/Checkbox';
import { AlertMessage } from '../ui/AlertMessage';
import { AuthDivider } from '../ui/AuthDivider';
import { SocialButton } from '../ui/SocialButton';
import { SubmitButton } from '../ui/SubmitButton';

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export function LoginFormSection({
  formData,
  onChange,
  rememberMe,
  setRememberMe,
  onSubmit,
  onGoogleClick,
  onCashierSubmit,
  loading,
  error,
  onSwitchToSignup,
  isMobile = false,
}) {
  const [mode, setMode] = useState('owner'); // 'owner' | 'cashier'
  const isCashier = mode === 'cashier';

  const handleModeChange = (newMode) => {
    if (newMode !== mode) setMode(newMode);
  };

  return (
    <div className={`w-full ${isMobile ? 'max-w-[400px]' : 'max-w-[380px] px-10'}`}>
      {/* Mobile logo */}
      {isMobile && (
        <div className="mb-8">
          <BrandLogo size="md" theme="dark" />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-[26px] leading-tight font-extrabold text-[#13110A] tracking-tight mb-1">
          {isCashier ? 'Acceso de Cajero' : 'Bienvenido de vuelta'}
        </h2>
        <p className="text-[13px] text-[#947F4E] font-medium">
          {isCashier
            ? 'Ingresa con el correo y contraseña de sucursal'
            : 'Ingresa tus credenciales para continuar'}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-[#EDE3C8] bg-[#FAFAF6] p-1 mb-5">
        <button
          type="button"
          onClick={() => handleModeChange('owner')}
          className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
            !isCashier
              ? 'bg-white text-[#13110A] shadow-sm'
              : 'text-[#947F4E] hover:text-[#13110A]'
          }`}
        >
          Propietario
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('cashier')}
          className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
            isCashier
              ? 'bg-white text-[#13110A] shadow-sm'
              : 'text-[#947F4E] hover:text-[#13110A]'
          }`}
        >
          Cajero
        </button>
      </div>

      <form onSubmit={isCashier ? onCashierSubmit : onSubmit} className="space-y-5">
        {error && <AlertMessage>{error}</AlertMessage>}

        <FormInput
          id={`login-email${isMobile ? '-mobile' : ''}`}
          name="email"
          type="email"
          label="Correo electrónico"
          value={formData.email}
          onChange={onChange}
          placeholder="correo@ejemplo.com"
          required
          autoComplete="email"
          icon={<EmailIcon />}
        />

        <PasswordInput
          id={`login-password${isMobile ? '-mobile' : ''}`}
          name="password"
          label={isCashier ? 'Contraseña de sucursal' : 'Contraseña'}
          value={formData.password}
          onChange={onChange}
          required
          autoComplete="current-password"
          labelRight={
            !isCashier ? (
              <Link
                to="/forgot-password"
                className="text-[12px] font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            ) : null
          }
        />

        {!isCashier && (
          <Checkbox
            checked={rememberMe}
            onChange={setRememberMe}
            label="Recordarme"
          />
        )}

        <SubmitButton loading={loading} loadingText="Iniciando sesión...">
          {isCashier ? 'Acceder como Cajero' : 'Iniciar Sesión'}
        </SubmitButton>

        {!isCashier && (
          <>
            <AuthDivider />
            <SocialButton provider="google" onClick={onGoogleClick} disabled={loading} />
          </>
        )}

        {!isCashier && (
          <p className="text-center text-[13px] font-medium text-[#947F4E]">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150"
            >
              Regístrate aquí
            </button>
          </p>
        )}

        {isCashier && (
          <p className="text-center text-[12px] text-[#947F4E]">
            ¿Eres el propietario?{' '}
            <button
              type="button"
              onClick={() => handleModeChange('owner')}
              className="font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150"
            >
              Accede aquí
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
