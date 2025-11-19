import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import businessService from '../services/businessService';

function SignUpBusiness() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', // Este es el nombre del negocio que se enviará al backend
        contactName: '', // Nombre del contacto
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        description: '',
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
        if (!formData.name.trim()) {
            setError('El nombre del negocio es requerido');
            return false;
        }
        if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim()) {
            setError('Todos los campos de dirección son requeridos');
            return false;
        }
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
            // Construir la dirección en el formato requerido
            // Reemplazar espacios en street con guiones
            const formattedStreet = formData.street.replace(/\s+/g, '-');
            const formattedCity = formData.city.replace(/\s+/g, '-');
            // const formattedNeighborhood = formData.neighborhood.replace(/\s+/g, '-');
            const formattedState = formData.state.replace(/\s+/g, '-');
            const address = `${formattedStreet}-${formattedCity}-${formattedState}`;

            const userData = {
                name: formData.name, // Nombre del negocio (campo principal)
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                description: formData.description,
            };

            // Agregar contactName solo si se proporcionó
            if (formData.contactName) {
                userData.contactName = formData.contactName;
            }

            // Paso 1: Registrar el negocio
            const response = await authService.signUpBusiness(userData);
            console.log('Registro exitoso:', response);

            // Paso 2: Actualizar la ubicación del negocio
            try {
                await businessService.updateBusinessLocation(address);
                console.log('Ubicación actualizada exitosamente');
            } catch (locationErr) {
                console.error('Error al actualizar ubicación:', locationErr);
                // Continuar aunque falle la actualización de ubicación
            }

            // Redirigir a la página de configuración de ubicación
            navigate('/business/location-setup');
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
                        <h2 className="text-center text-[32px] leading-[40px] font-extrabold text-[#0F172A] tracking-tight">
                            RewardsHub
                        </h2>
                        <p className="mt-3 text-center text-[14px] leading-5 font-medium text-[#6C757D]">
                            Registro de Negocio
                        </p>
                        <div className="mt-5 flex items-center justify-center">
                            <div className="bg-[#F0FDF4] text-[#12391C] h-[28px] px-3 rounded-full text-[12px] leading-4 font-semibold inline-flex items-center">
                                🏢 Cuenta de Negocio
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
                            {/* Nombre del Negocio */}
                            <div>
                                <label htmlFor="name" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Nombre del Negocio <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="businessName"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
                                    placeholder="Mi Negocio S.A."
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
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
                                    placeholder="negocio@ejemplo.com"
                                />
                            </div>

                            {/* Calle y Número */}
                            <div>
                                <label htmlFor="street" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Calle y Número <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="street"
                                    name="street"
                                    type="text"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
                                    placeholder="Calle Principal #123"
                                    required
                                />
                            </div>

                            {/* Ciudad */}
                            <div>
                                <label htmlFor="city" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Ciudad <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
                                    placeholder="Guadalajara"
                                    required
                                />
                            </div>

                            {/* Estado */}
                            <div>
                                <label htmlFor="state" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Estado <span className="text-[#F87171]">*</span>
                                </label>
                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
                                    placeholder="Jalisco"
                                    required
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label htmlFor="description" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Descripción del Negocio (Opcional)
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-4 py-3 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180 resize-none"
                                    placeholder="Breve descripción de tu negocio..."
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
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
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
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] placeholder-[#ADB5BD] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center h-11 px-4 border border-transparent text-[16px] leading-6 font-semibold rounded-full text-white bg-[#74D680] hover:opacity-95 focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)]"
                            >
                                {loading ? 'Creando cuenta...' : 'Crear Cuenta de Negocio'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="text-[14px] leading-5 font-medium text-[#6C757D]">
                                    ¿Eres un cliente?{' '}
                                    <Link to="/signup/client" className="font-semibold text-[#74D680] hover:text-[#5AB866] transition-colors duration-180">
                                        Regístrate como cliente
                                    </Link>
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-[14px] leading-5 font-medium text-[#6C757D]">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="font-semibold text-[#74D680] hover:text-[#5AB866] transition-colors duration-180">
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

export default SignUpBusiness;
