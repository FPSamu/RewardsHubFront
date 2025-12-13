import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import businessService from '../services/businessService';
import SEO from '../components/SEO';

function SignUpBusiness() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
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
        category: 'food', // Categoría del negocio
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('El logo debe ser menor a 5MB');
                return;
            }

            setLogoFile(file);

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
            const formattedStreet = formData.street.replace(/\s+/g, '-');
            const formattedCity = formData.city.replace(/\s+/g, '-');
            const formattedState = formData.state.replace(/\s+/g, '-');
            const addressString = `${formattedStreet}-${formattedCity}-${formattedState}`;

            const userData = {
                name: formData.name, // Nombre del negocio (campo principal)
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                description: formData.description,
                category: formData.category,
            };

            // Agregar contactName solo si se proporcionó
            if (formData.contactName) {
                userData.contactName = formData.contactName;
            }

            // Paso 1: Registrar el negocio
            const response = await authService.signUpBusiness(userData);
            console.log('Registro exitoso:', response);

            // Paso 2: Subir el logo si existe
            if (logoFile) {
                try {
                    await businessService.uploadLogo(logoFile);
                } catch (logoErr) {
                    console.error('Error al subir logo:', logoErr);
                }
            }

            // Paso 3: Agregar la PRIMERA sucursal (usando el nuevo método addLocation)
            try {
                await businessService.addLocation({
                    address: addressString,
                    name: 'Sucursal Principal' // Nombre por defecto
                });
                console.log('Sucursal principal creada exitosamente');
            } catch (locationErr) {
                console.error('Error al crear sucursal principal:', locationErr);
            }

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
            {/* SEO Meta Tags */}
            <SEO
                title="Registro de Negocio - RewardsHub | Fideliza a tus Clientes"
                description="Registra tu negocio en RewardsHub y crea un programa de fidelización personalizado. Escanea códigos QR, otorga puntos y fideliza a tus clientes. ¡Regístrate gratis!"
                keywords="registro negocio, programa de fidelización, loyalty program, recompensas para negocios, escáner QR, puntos de lealtad"
                type="website"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Registro de Negocio - RewardsHub",
                    "description": "Registra tu negocio en RewardsHub para crear un programa de fidelización personalizado",
                    "url": "https://rewards-hub-opal.vercel.app/signup/business",
                    "isPartOf": {
                        "@type": "WebSite",
                        "name": "RewardsHub",
                        "url": "https://rewards-hub-opal.vercel.app/"
                    },
                    "breadcrumb": {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Inicio",
                                "item": "https://rewards-hub-opal.vercel.app/"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Registro",
                                "item": "https://rewards-hub-opal.vercel.app/signup"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Negocio",
                                "item": "https://rewards-hub-opal.vercel.app/signup/business"
                            }
                        ]
                    },
                    "mainEntity": {
                        "@type": "Service",
                        "name": "Programa de Fidelización para Negocios",
                        "description": "Sistema de puntos y recompensas personalizado para tu negocio",
                        "provider": {
                            "@type": "Organization",
                            "name": "RewardsHub"
                        }
                    }
                }}
            />
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

                            {/* Logo del Negocio */}
                            <div>
                                <label className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Logo del Negocio (Opcional)
                                </label>
                                <div className="space-y-3">
                                    {/* Preview del logo */}
                                    {logoPreview && (
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={logoPreview}
                                                alt="Preview del logo"
                                                className="w-24 h-24 object-cover rounded-lg border-2 border-[#DEE2E6]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-180"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}

                                    {/* Botón de subir */}
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#DEE2E6] rounded-[14px] bg-white text-[14px] font-semibold text-[#495057] hover:bg-[#F8F9FA] transition-all duration-180"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                                        </label>
                                        <p className="mt-2 text-[12px] leading-4 font-medium text-[#6C757D]">
                                            Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Categoría del Negocio */}
                            <div>
                                <label htmlFor="category" className="block text-[14px] leading-5 font-semibold text-[#495057] mb-2">
                                    Categoría del Negocio <span className="text-[#F87171]">*</span>
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full h-11 px-4 border border-[#DEE2E6] text-[#0F172A] text-[16px] leading-6 font-medium rounded-[14px] focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] focus:border-[#74D680] transition-all duration-180 bg-white"
                                >
                                    <option value="food">🍔 Comida</option>
                                </select>
                                <p className="mt-2 text-[12px] leading-4 font-medium text-[#6C757D]">
                                    Selecciona la categoría que mejor describa tu negocio
                                </p>
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
                                className="group relative w-full flex items-center justify-center h-11 px-4 border border-transparent text-[16px] leading-6 font-semibold rounded-full text-white bg-[#74D680] hover:opacity-95 focus:outline-none focus:ring-[3px] focus:ring-[#E6F7E8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-180 shadow-[0_10px_24px_-10px_rgba(2,6,23,0.15)]"
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
