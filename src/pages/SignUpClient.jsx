import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function SignUpClient() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            };

            // Usa la ruta /auth/register
            const response = await authService.signUpClient(userData);
            console.log('Registro exitoso:', response);
            navigate('/client/dashboard');
        } catch (err) {
            setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
            console.error('Error en registro:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Card principal */}
                <div className="bg-white rounded-3xl p-8 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)] border border-[#E9ECEF]">
                    <div>
                        <div className="flex justify-center mb-4">
                            <img
                                src="https://rewards-hub-app.s3.us-east-2.amazonaws.com/app/logoRewardsHub.png"
                                alt="RewardsHub Logo"
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                        <h2 className="text-center text-[32px] leading-[40px] font-extrabold text-[#0F172A] tracking-tight">
                            RewardsHub
                        </h2>
                        <p className="mt-3 text-center text-[14px] leading-5 font-medium text-[#6C757D]">
                            Registro de Cliente
                        </p>
                        <div className="mt-5 flex items-center justify-center">
                            <div className="bg-[#FFF4E0] text-[#8B5A00] h-[28px] px-3 rounded-full text-[12px] leading-4 font-semibold inline-flex items-center">
                                👤 Cuenta de Cliente
                            </div>
                        </div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[14px] text-[14px] leading-5 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Nombre Completo */}
                            <div>
                                <label htmlFor="username" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Nombre Completo <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] focus:border-[#FFB733] transition-all duration-180"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Correo Electrónico <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] focus:border-[#FFB733] transition-all duration-180"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label htmlFor="password" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Contraseña <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] focus:border-[#FFB733] transition-all duration-180"
                                    placeholder="••••••••"
                                />
                                <p className="mt-2 text-[12px] leading-4 font-medium text-[#6C757D]">Mínimo 6 caracteres</p>
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Confirmar Contraseña <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] focus:border-[#FFB733] transition-all duration-180"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex items-center justify-center h-11 px-4 border border-transparent text-[16px] leading-6 font-semibold rounded-full text-white bg-[#FFB733] hover:opacity-95 focus:outline-none focus:ring-[3px] focus:ring-[#FFE8C6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)]"
                            >
                                {loading ? 'Creando cuenta...' : 'Crear Cuenta de Cliente'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="text-[14px] leading-5 font-medium text-[#6C757D]">
                                    ¿Eres un negocio?{' '}
                                    <Link to="/signup/business" className="font-semibold text-[#FFB733] hover:text-[#EAB000] transition-colors duration-180">
                                        Regístrate como negocio
                                    </Link>
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-[14px] leading-5 font-medium text-[#6C757D]">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="font-semibold text-[#FFB733] hover:text-[#EAB000] transition-colors duration-180">
                                        Inicia sesión
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignUpClient;
