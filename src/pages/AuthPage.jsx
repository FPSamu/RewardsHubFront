import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import SEO from '../components/SEO';
import { AnimatedAuthLayout } from '../components/auth/AnimatedAuthLayout';
import { AuthHeroPanel } from '../components/auth/AuthHeroPanel';
import { LoginFormSection } from '../components/auth/LoginFormSection';
import { SignUpFormSection } from '../components/auth/SignUpFormSection';

const EMPTY_LOGIN  = { email: '', password: '' };
const EMPTY_SIGNUP = { name: '', email: '', password: '', confirmPassword: '' };

// Map API role ('user' | 'business') → dashboard path
const dashboardPath = (apiRole) =>
  apiRole === 'business' ? '/business/dashboard' : '/client/dashboard';

function AuthPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const initialMode = location.pathname === '/signup' ? 'signup' : 'login';

  // Panel mode (drives slide animation)
  const [mode,          setMode]          = useState(initialMode);
  // Displayed form (lags 350 ms behind mode for crossfade)
  const [displayedMode, setDisplayedMode] = useState(initialMode);
  const [formVisible,   setFormVisible]   = useState(true);

  const [accountType, setAccountType] = useState('client'); // 'client' | 'business'
  const [loginData,   setLoginData]   = useState(EMPTY_LOGIN);
  const [signupData,  setSignupData]  = useState(EMPTY_SIGNUP);
  const [rememberMe,  setRememberMe]  = useState(false);

  const [loginError,  setLoginError]  = useState('');
  const [signupError, setSignupError] = useState('');
  const [loading,     setLoading]     = useState(false);

  // ── Mode switch with animation ────────────────────────────────────────────

  const switchMode = useCallback((newMode) => {
    if (newMode === mode) return;
    setFormVisible(false);
    setMode(newMode);
    navigate(newMode === 'login' ? '/login' : '/signup', { replace: true });
    setTimeout(() => {
      setDisplayedMode(newMode);
      setFormVisible(true);
    }, 350);
  }, [mode, navigate]);

  // ── Post-auth redirect ────────────────────────────────────────────────────

  const handleAuthSuccess = (data) => {
    const user    = data.user;
    const apiRole = data.role; // 'user' | 'business'
    if (!user?.isVerified) {
      navigate('/verify-pending');
    } else {
      navigate(dashboardPath(apiRole));
    }
  };

  // ── Login handlers ────────────────────────────────────────────────────────

  const handleLoginChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const data = await authService.login(loginData.email, loginData.password, rememberMe);
      handleAuthSuccess(data);
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginGoogle = async () => {
    setLoading(true);
    setLoginError('');
    try {
      const data = await authService.loginWithGoogle(rememberMe);
      handleAuthSuccess(data);
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  // ── Signup handlers ───────────────────────────────────────────────────────

  const handleSignupChange = (e) => {
    setSignupData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSignupError('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Las contraseñas no coinciden.');
      return;
    }
    if (signupData.password.length < 6) {
      setSignupError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setSignupError('');
    // Map internal accountType ('client'|'business') → API role ('user'|'business')
    const apiRole = accountType === 'client' ? 'user' : 'business';
    try {
      const data = await authService.register({
        email:    signupData.email,
        password: signupData.password,
        role:     apiRole,
        username: signupData.name,
      });
      handleAuthSuccess(data);
    } catch (err) {
      setSignupError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupGoogle = async () => {
    setLoading(true);
    setSignupError('');
    const apiRole = accountType === 'client' ? 'user' : 'business';
    try {
      const data = await authService.registerWithGoogle(apiRole);
      handleAuthSuccess(data);
    } catch (err) {
      setSignupError(err.message || 'Error al registrarse con Google.');
    } finally {
      setLoading(false);
    }
  };

  // ── Form content with crossfade ───────────────────────────────────────────

  const formContentStyle = {
    opacity:    formVisible ? 1 : 0,
    transform:  formVisible ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 250ms ease, transform 250ms ease',
    width:      '100%',
    display:    'flex',
    justifyContent: 'center',
  };

  const loginProps = {
    formData:        loginData,
    onChange:        handleLoginChange,
    rememberMe,
    setRememberMe,
    onSubmit:        handleLoginSubmit,
    onGoogleClick:   handleLoginGoogle,
    loading,
    error:           loginError,
    onSwitchToSignup: () => switchMode('signup'),
  };

  const signupProps = {
    accountType,
    setAccountType,
    formData:       signupData,
    onChange:       handleSignupChange,
    onSubmit:       handleSignupSubmit,
    onGoogleClick:  handleSignupGoogle,
    loading,
    error:          signupError,
    onSwitchToLogin: () => switchMode('login'),
  };

  const form = (isMobile) => (
    <div style={formContentStyle}>
      {displayedMode === 'login'
        ? <LoginFormSection  {...loginProps}  isMobile={isMobile} />
        : <SignUpFormSection {...signupProps} isMobile={isMobile} />}
    </div>
  );

  return (
    <>
      <SEO
        title={mode === 'login' ? 'Iniciar Sesión - RewardsHub' : 'Crear Cuenta - RewardsHub'}
        description={
          mode === 'login'
            ? 'Inicia sesión en RewardsHub para acceder a tu cuenta.'
            : 'Crea tu cuenta en RewardsHub. Acumula puntos o fideliza a tus clientes.'
        }
        keywords="login, registro, rewardsHub, acceso, cuenta, cliente, negocio"
        type="website"
      />

      <AnimatedAuthLayout
        mode={mode}
        hero={<AuthHeroPanel mode={mode} accountType={accountType} />}
        form={
          <>
            <div className="hidden lg:flex w-full justify-center">{form(false)}</div>
            <div className="lg:hidden w-full flex justify-center">{form(true)}</div>
          </>
        }
      />
    </>
  );
}

export default AuthPage;
