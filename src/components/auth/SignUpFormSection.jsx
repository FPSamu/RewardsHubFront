import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../ui/BrandLogo';
import { FormInput } from '../ui/FormInput';
import { PasswordInput } from '../ui/PasswordInput';
import { AlertMessage } from '../ui/AlertMessage';
import { AuthDivider } from '../ui/AuthDivider';
import { SocialButton } from '../ui/SocialButton';
import { SubmitButton } from '../ui/SubmitButton';
import { AccountTypeToggle } from './AccountTypeToggle';

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export function SignUpFormSection({
  accountType,
  setAccountType,
  formData,
  onChange,
  onSubmit,
  onGoogleClick,
  loading,
  error,
  onSwitchToLogin,
  isMobile = false,
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const isClient = accountType === 'client';
  const nameSuffix = isMobile ? '-mobile' : '';
  const canSubmit = termsAccepted && !loading;

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
          Crea tu cuenta
        </h2>
        <p className="text-[13px] text-[#947F4E] font-medium">
          Elige tu tipo de cuenta y empieza gratis
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && <AlertMessage>{error}</AlertMessage>}

        <AccountTypeToggle value={accountType} onChange={setAccountType} />

        <FormInput
          id={`signup-name${nameSuffix}`}
          name="name"
          label={isClient ? 'Nombre Completo' : 'Nombre del Negocio'}
          value={formData.name}
          onChange={onChange}
          placeholder={isClient ? 'Juan Pérez' : 'Mi Negocio S.A.'}
          required
          icon={isClient ? <UserIcon /> : <BuildingIcon />}
        />

        <FormInput
          id={`signup-email${nameSuffix}`}
          name="email"
          type="email"
          label="Correo Electrónico"
          value={formData.email}
          onChange={onChange}
          placeholder="correo@ejemplo.com"
          required
          autoComplete="email"
          icon={<EmailIcon />}
        />

        <PasswordInput
          id={`signup-password${nameSuffix}`}
          name="password"
          label="Contraseña"
          value={formData.password}
          onChange={onChange}
          required
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
        />

        <PasswordInput
          id={`signup-confirmPassword${nameSuffix}`}
          name="confirmPassword"
          label="Confirmar Contraseña"
          value={formData.confirmPassword}
          onChange={onChange}
          required
          autoComplete="new-password"
        />

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#EBA626] accent-[#EBA626] flex-shrink-0 cursor-pointer"
          />
          <span className="text-[13px] text-[#947F4E] leading-snug">
            He leído y acepto los{' '}
            <Link
              to="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#EBA626] hover:text-[#C47D10] underline underline-offset-2 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              términos y condiciones
            </Link>
          </span>
        </label>

        <div className="pt-1">
          <SubmitButton loading={loading} loadingText="Creando cuenta..." disabled={!canSubmit}>
            {isClient ? 'Crear Cuenta de Cliente' : 'Crear Cuenta de Negocio'}
          </SubmitButton>
        </div>

        <AuthDivider />

        <SocialButton provider="google" onClick={onGoogleClick} disabled={!canSubmit} />

        <p className="text-center text-[13px] font-medium text-[#947F4E]">
          ¿Ya tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  );
}
