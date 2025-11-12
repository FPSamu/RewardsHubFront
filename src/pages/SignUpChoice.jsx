import { Link } from 'react-router-dom';

function SignUpChoice() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-white mb-4">
                        Únete a RewardsHub
                    </h2>
                    <p className="text-xl text-white/90">
                        ¿Cómo te gustaría registrarte?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Tarjeta Cliente */}
                    <Link to="/signup/client" className="group">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-200 transition-colors">
                                    <span className="text-4xl">👤</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Soy Cliente
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Acumula puntos en tus negocios favoritos y canjea increíbles recompensas
                                </p>
                                <ul className="text-left space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Genera tu código QR único</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Acumula puntos automáticamente</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Descubre negocios cerca de ti</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Canjea recompensas exclusivas</span>
                                    </li>
                                </ul>
                                <div className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg group-hover:bg-primary-700 transition-colors">
                                    Registrarme como Cliente
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Tarjeta Negocio */}
                    <Link to="/signup/business" className="group">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
                                    <span className="text-4xl">🏢</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Soy Negocio
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Fideliza a tus clientes con un sistema de recompensas personalizado
                                </p>
                                <ul className="text-left space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Escanea códigos QR de clientes</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Configura tu sistema de puntos</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Crea recompensas atractivas</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">Gestiona tu base de clientes</span>
                                    </li>
                                </ul>
                                <div className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg group-hover:bg-purple-700 transition-colors">
                                    Registrarme como Negocio
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="text-center mt-8">
                    <p className="text-white text-lg">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-bold underline hover:text-white/80 transition-colors">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpChoice;
