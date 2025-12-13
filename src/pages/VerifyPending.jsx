import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';

const VerifyPending = () => {
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');

    // Obtener token del localStorage (asumiendo que lo guardas ahí al hacer login)
    const token = localStorage.getItem('token');
    // O usa tu Context de Auth si tienes uno

    // 1. POLLING: Preguntar cada 3 segundos si ya estamos verificados
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const intervalId = setInterval(async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${backendUrl}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.isVerified) {
                    // ¡Magia! Ya se verificó, enviarlo al dashboard
                    // Determina si es cliente o negocio según tu lógica, aquí envío a client como ejemplo
                    // Podrías guardar el user type en localStorage también
                    navigate('/client/dashboard');
                }
            } catch (error) {
                console.error("Error checking status", error);
            }
        }, 3000); // Cada 3 segundos

        // Limpiar intervalo al desmontar
        return () => clearInterval(intervalId);
    }, [token, navigate]);

    const handleResend = async () => {
        setIsResending(true);
        setMessage('');
        try {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await axios.post(`${backendUrl}/auth/resend-verification`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('¡Correo reenviado con éxito! Revisa tu bandeja de entrada (y spam).');
        } catch (error) {
            setMessage('Error al reenviar. Intenta más tarde.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            {/* SEO Meta Tags */}
            <SEO
                title="Verificación Pendiente - RewardsHub"
                description="Verifica tu correo electrónico para completar tu registro en RewardsHub. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación."
                keywords="verificación pendiente, confirmar email, activar cuenta, rewardsHub"
                type="website"
            />

            <div className="max-w-md w-full bg-white shadow-card rounded-xl p-8 text-center">
                <div className="h-16 w-16 bg-accent-warning/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-accent-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu correo</h2>
                <p className="text-gray-600 mb-6">
                    Hemos enviado un enlace de confirmación a tu correo.
                    <br />
                    <strong>No cierres esta pestaña.</strong> Al hacer clic en el enlace, accederás automáticamente.
                </p>

                {message && (
                    <div className={`mb-4 p-2 rounded text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="w-full py-2 px-4 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-primary/10 transition-colors disabled:opacity-50"
                    >
                        {isResending ? 'Enviando...' : 'Reenviar correo de verificación'}
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                        Cerrar Sesión / Cambiar cuenta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyPending;