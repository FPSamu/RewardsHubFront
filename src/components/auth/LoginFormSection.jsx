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

const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M4 9v11h16V9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

const ArrowIcon = ({ back = false }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {back ? <path d="M19 12H5M11 6l-6 6 6 6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// Palabra gigante de fondo del modo cajero: se desvanece hacia abajo como las de la landing
const FADE = 'linear-gradient(to bottom, #000 0%, transparent 85%)';

const LINK = 'font-semibold text-[#A8650A] hover:text-[#7A4A06] transition-colors duration-150';

/**
 * Login único para clientes y negocios (la API devuelve el rol y AuthPage redirige).
 * Los cajeros entran por un acceso discreto que cambia el formulario a "modo cajero".
 */
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
  loginMode = 'default',
  onLoginModeChange,
  isMobile = false,
}) {
  const isCashier = loginMode === 'cashier';
  const idSuffix = isMobile ? '-mobile' : '';

  return (
    <div className={`relative w-full ${isMobile ? 'max-w-[400px]' : 'max-w-[380px] px-10'}`}>
      {isCashier && (
        <p
          aria-hidden
          // pt: con leading 0.78 la parte alta de las letras sale de la caja y la máscara la cortaría
          style={{ WebkitMaskImage: FADE, maskImage: FADE, top: isMobile ? 'calc(52px - 3.6vw)' : 'calc(-4rem - 1.5vw)' }}
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 select-none whitespace-nowrap pt-[0.14em] font-rh-display font-extrabold leading-[0.78] tracking-[-0.05em] text-[rgba(19,17,10,0.075)] ${
            isMobile ? 'text-[26vw]' : 'text-[11vw]'
          }`}
        >
          CAJERO
        </p>
      )}

      {/* Mobile logo */}
      {isMobile && (
        <div className="relative mb-8">
          <BrandLogo size="md" theme="dark" />
        </div>
      )}

      {/* key: al cambiar de modo el contenido se vuelve a montar con la animación de entrada */}
      <div key={loginMode} className="relative auth-hero-appear">
        {isCashier && (
          <button
            type="button"
            onClick={() => onLoginModeChange?.('default')}
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B5B2E] hover:text-[#13110A] transition-colors duration-150"
          >
            <ArrowIcon back />
            Volver
          </button>
        )}

        <div className="mb-6">
          <h2 className="text-[26px] leading-tight font-extrabold text-[#13110A] tracking-tight mb-1">
            {isCashier ? 'Acceso de Cajero' : 'Bienvenido de vuelta'}
          </h2>
          <p className="text-[13px] text-[#947F4E] font-medium">
            {isCashier
              ? 'Ingresa con el correo y la contraseña de tu sucursal.'
              : 'Ingresa a tu cuenta para continuar.'}
          </p>
        </div>

        <form onSubmit={isCashier ? onCashierSubmit : onSubmit} className="space-y-5">
          {error && <AlertMessage>{error}</AlertMessage>}

          <FormInput
            id={`login-email${idSuffix}`}
            name="email"
            type="email"
            label={isCashier ? 'Correo de sucursal' : 'Correo electrónico'}
            value={formData.email}
            onChange={onChange}
            placeholder={isCashier ? 'sucursal@negocio.com' : 'correo@ejemplo.com'}
            required
            autoComplete={isCashier ? 'username' : 'email'}
            icon={<EmailIcon />}
          />

          <PasswordInput
            id={`login-password${idSuffix}`}
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
            {isCashier ? 'Acceder como cajero' : 'Iniciar sesión'}
          </SubmitButton>

          {isCashier ? (
            <>
              <div className="flex items-start gap-2.5 rounded-xl bg-[#FDF3DC]/70 px-3.5 py-3 text-[12px] font-medium leading-snug text-[#6B5B2E]">
                <span className="mt-px shrink-0 text-[#A8650A]">
                  <CheckIcon />
                </span>
                Este dispositivo recordará el modo cajero. La próxima vez abrirá directo aquí.
              </div>
              <p className="text-center text-[13px] font-medium text-[#947F4E]">
                ¿Eres dueño o cliente?{' '}
                <button type="button" onClick={() => onLoginModeChange?.('default')} className={LINK}>
                  Entra aquí
                </button>
              </p>
            </>
          ) : (
            <>
              <AuthDivider />
              <SocialButton provider="google" onClick={onGoogleClick} disabled={loading} />

              <p className="text-center text-[13px] font-medium text-[#947F4E]">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={onSwitchToSignup} className={LINK}>
                  Regístrate
                </button>
              </p>

              {/* Acceso discreto para cajeros */}
              <button
                type="button"
                onClick={() => onLoginModeChange?.('cashier')}
                className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-[#D9C99C] bg-[#FAFAF6] px-3.5 py-3 text-left transition-colors duration-150 hover:border-[#EBA626] hover:bg-[#FDF3DC]/60 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#FAE5AD]"
              >
                <span className="shrink-0 text-[#A8650A]">
                  <StoreIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[#13110A]">¿Eres cajero?</span>
                  <span className="block text-[12px] font-medium text-[#6B5B2E]">Entra con la contraseña de sucursal</span>
                </span>
                <span className="shrink-0 text-[#A8650A] transition-transform duration-150 group-hover:translate-x-0.5">
                  <ArrowIcon />
                </span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
