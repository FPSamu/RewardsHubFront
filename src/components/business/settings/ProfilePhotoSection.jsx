import { useRef, useState } from 'react';
import businessService from '../../../services/businessService';

function parseError(err) {
  if (typeof err === 'string') return err;
  return err?.message ?? err?.error ?? 'Error al subir la imagen';
}

function Avatar({ logoUrl, name, size = 20 }) {
  const px = `${size * 4}px`;
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover ring-4 ring-white shadow-card"
      />
    );
  }
  const initial = name?.charAt(0)?.toUpperCase() ?? 'N';
  return (
    <div
      style={{ width: px, height: px }}
      className="rounded-full bg-brand-primary flex items-center justify-center ring-4 ring-white shadow-card"
    >
      <span className="text-white font-extrabold" style={{ fontSize: `${size * 1.1}px` }}>
        {initial}
      </span>
    </div>
  );
}

export function ProfilePhotoSection({ business, onUpdated }) {
  const inputRef              = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { setError('El archivo debe ser una imagen'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('La imagen no puede superar 5 MB'); return; }

    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setError('');
    setLoading(true);
    try {
      const updated = await businessService.uploadLogo(file);
      // Swap preview for the real server URL so it persists on re-render
      setPreview(updated?.logoUrl ?? blobUrl);
      const patch = { logoUrl: updated?.logoUrl ?? blobUrl, ...updated };
      onUpdated?.(patch);
      window.dispatchEvent(new CustomEvent('businessUpdated', { detail: patch }));
    } catch (err) {
      setError(parseError(err));
      setPreview(null);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const currentLogo = preview ?? business?.logoUrl ?? null;

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <Avatar logoUrl={currentLogo} name={business?.name} size={18} />
        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[14px] font-bold text-neutral-800">Foto de perfil</p>
        <p className="text-[12px] text-neutral-400 mt-0.5">JPG, PNG o WEBP · Máx. 5 MB</p>

        {error && <p className="text-[12px] text-accent-danger mt-1">{error}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {loading ? 'Subiendo…' : 'Cambiar foto'}
        </button>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}
