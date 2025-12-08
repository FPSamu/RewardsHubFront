import { useState, useEffect } from 'react';
import api from '../services/api';

const SettingsModal = ({ isOpen, onClose, currentUser, onUserUpdate }) => {
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || '');
            setProfilePicturePreview(currentUser.profilePicture || null);
        }
    }, [currentUser]);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen debe ser menor a 5MB');
                return;
            }

            setProfilePicture(file);
            setError(null);

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveProfilePicture = () => {
        setProfilePicture(null);
        setProfilePicturePreview(currentUser.profilePicture || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Update username if changed
            if (username !== currentUser.username) {
                const response = await api.put('/auth/me', { username });

                // Update localStorage
                const updatedUser = { ...currentUser, username: response.data.username };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Dispatch custom event for same-tab updates
                window.dispatchEvent(new Event('userUpdated'));

                if (onUserUpdate) {
                    onUserUpdate(updatedUser);
                }
            }

            // Upload profile picture if changed
            if (profilePicture) {
                const formData = new FormData();
                formData.append('profilePicture', profilePicture);

                const response = await api.post('/auth/profile-picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update localStorage with new profile picture URL
                const updatedUser = { ...currentUser, username, profilePicture: response.data.profilePicture };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Dispatch custom event for same-tab updates
                window.dispatchEvent(new Event('userUpdated'));

                if (onUserUpdate) {
                    onUserUpdate(updatedUser);
                }

                setProfilePicturePreview(response.data.profilePicture);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-popover max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Picture Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Foto de Perfil
                        </label>

                        <div className="flex items-center space-x-4">
                            {/* Preview */}
                            <div className="relative">
                                {profilePicturePreview ? (
                                    <img
                                        src={profilePicturePreview}
                                        alt="Profile preview"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-brand-primary shadow-sm"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-brand-primary text-white flex items-center justify-center text-3xl font-bold shadow-sm">
                                        {username.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>

                            {/* Upload/Remove buttons */}
                            <div className="flex-1 space-y-2">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <span className="inline-block px-4 py-2 bg-brand-primary text-white rounded-pill hover:opacity-96 transition-all duration-180 text-sm font-medium">
                                        Cambiar foto
                                    </span>
                                </label>

                                {profilePicture && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveProfilePicture}
                                        className="block px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Cancelar cambio
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            JPG, PNG o GIF. Tamaño máximo 5MB.
                        </p>
                    </div>

                    {/* Username Section */}
                    <div className="space-y-3">
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-brand-muted focus:border-brand-primary transition-all duration-180"
                            placeholder="Tu nombre de usuario"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={currentUser?.email || ''}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-500">
                            El correo no puede ser modificado
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Perfil actualizado exitosamente
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-pill hover:bg-gray-50 transition-all duration-180 font-medium"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-pill hover:opacity-96 transition-all duration-180 font-medium flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
