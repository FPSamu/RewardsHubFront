import { QRCodeSVG } from 'qrcode.react';
import WalletButtons from '../../WalletButtons';

export function QRSection({ userId }) {
  return (
    <div className="mx-4 bg-surface rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
      {/* Header strip */}
      <div className="bg-brand-primary px-5 py-4">
        <h2 className="text-[15px] font-bold text-white">Tu Código QR</h2>
        <p className="text-white/80 text-xs mt-0.5">
          Muéstralo en negocios afiliados para acumular puntos
        </p>
      </div>

      {/* QR + wallet */}
      <div className="flex flex-col items-center py-6 px-5 gap-5 bg-brand-primary">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <QRCodeSVG value={userId || 'no-id'} size={160} />
        </div>
        <WalletButtons />
      </div>
    </div>
  );
}
