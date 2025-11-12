import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function SignUpBusiness() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', // Este es el nombre del negocio que se enviará al backend
        contactName: '', // Nombre del contacto
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
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
                name: formData.name, // Nombre del negocio (campo principal)
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
                description: formData.description,
            };

            // Agregar contactName solo si se proporcionó
            if (formData.contactName) {
                userData.contactName = formData.contactName;
            }

            // Usa la ruta /business/register
            const response = await authService.signUpBusiness(userData);
            console.log('Registro exitoso:', response);
            navigate('/business/dashboard');
        } catch (err) {
            setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
            console.error('Error en registro:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        RewardsHub
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Registro de Negocio
                    </p>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                            🏢 Cuenta de Negocio
                        </div>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Nombre del Negocio */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Negocio <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="businessName"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Mi Negocio S.A."
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="negocio@ejemplo.com"
                            />
                        </div>

                        {/* Dirección */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Calle Principal #123, Ciudad"
                                required
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción del Negocio (Opcional)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="Breve descripción de tu negocio..."
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta de Negocio'}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                ¿Eres un cliente?{' '}
                                <Link to="/signup/client" className="font-medium text-purple-600 hover:text-purple-500">
                                    Regístrate como cliente
                                </Link>
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUpBusiness;
