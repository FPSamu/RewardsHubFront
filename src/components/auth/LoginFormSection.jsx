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
  loading,
  error,
  onSwitchToSignup,
  isMobile = false,
}) {
  return (
    <div className={`w-full ${isMobile ? 'max-w-[400px]' : 'max-w-[380px] px-10'}`}>
      {/* Mobile logo */}
      {isMobile && (
        <div className="mb-8">
          <BrandLogo size="md" theme="dark" />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-[26px] leading-tight font-extrabold text-[#13110A] tracking-tight mb-1">
          Bienvenido de vuelta
        </h2>
        <p className="text-[13px] text-[#947F4E] font-medium">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
          label="Contraseña"
          value={formData.password}
          onChange={onChange}
          required
          autoComplete="current-password"
          labelRight={
            <Link
              to="/forgot-password"
              className="text-[12px] font-semibold text-[#EBA626] hover:text-[#C47D10] transition-colors duration-150"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />

        <Checkbox
          checked={rememberMe}
          onChange={setRememberMe}
          label="Recordarme"
        />

        <SubmitButton loading={loading} loadingText="Iniciando sesión...">
          Iniciar Sesión
        </SubmitButton>

        <AuthDivider />

        <SocialButton provider="google" onClick={onGoogleClick} disabled={loading} />

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
      </form>
    </div>
  );
}
