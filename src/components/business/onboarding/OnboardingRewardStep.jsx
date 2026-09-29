import { useState } from 'react';
import rewardService from '../../../services/rewardService';
import systemService from '../../../services/systemService';

const parseError = (err) =>
  typeof err === 'string' ? err : err?.message ?? err?.error ?? 'Error al crear la recompensa';

function FieldLabel({ children }) {
  return <label className="block text-[13px] font-bold text-neutral-700 mb-1">{children}</label>;
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
    />
  );
}

const EMPTY_FORM = {
  name: '',
  description: '',
  targetStamps: '',
  rewardType: 'free_product',
  rewardValue: '',
};

export function OnboardingRewardStep({ onDone }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetStamps) {
      setError('Ponle un nombre y una meta de sellos para crear la recompensa.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const systems = await systemService.getBusinessSystems();
      let stampsSystem = systems.find((s) => s.type === 'stamps' && s.isActive);
      if (!stampsSystem) {
        stampsSystem = await systemService.createStampsSystem({
          name: 'Sistema de Sellos',
          description: 'Sistema de recompensas por sellos',
          targetStamps: parseInt(form.targetStamps, 10),
          productType: 'any',
        });
      }

      await rewardService.createStampsReward({
        systemId: stampsSystem.id,
        name: form.name.trim(),
        // The backend requires a non-empty description — default to the reward's
        // own name so leaving this field blank still works, as the UI promises.
        description: form.description.trim() || form.name.trim(),
        rewardType: form.rewardType,
        rewardValue:
          form.rewardType === 'free_product'
            ? form.name.trim()
            : parseFloat(form.rewardValue),
        stampsRequired: parseInt(form.targetStamps, 10),
      });

      onDone();
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[16px] font-bold text-neutral-900">Crea tu primera recompensa</h2>
        <p className="text-[13px] text-neutral-400 mt-0.5">
          Tus clientes acumulan sellos por compra y la canjean al llegar a la meta. Es opcional —
          puedes omitir este paso y configurarlo más tarde.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Nombre de la recompensa</FieldLabel>
          <Input
            type="text"
            placeholder="Ej: Café gratis"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>Descripción</FieldLabel>
          <Input
            type="text"
            placeholder="¿Qué obtiene el cliente? (opcional)"
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Meta de sellos</FieldLabel>
            <Input
              type="number"
              min="1"
              placeholder="10"
              value={form.targetStamps}
              onChange={(e) => update({ targetStamps: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Tipo</FieldLabel>
            <Select
              value={form.rewardType}
              onChange={(e) => update({ rewardType: e.target.value })}
            >
              <option value="free_product">Producto gratis</option>
              <option value="discount">Descuento</option>
              <option value="coupon">Cupón</option>
            </Select>
          </div>
        </div>
        {form.rewardType !== 'free_product' && (
          <div>
            <FieldLabel>Valor</FieldLabel>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="50"
              value={form.rewardValue}
              onChange={(e) => update({ rewardValue: e.target.value })}
            />
          </div>
        )}

        {error && <p className="text-[12px] text-accent-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving && (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
          )}
          {saving ? 'Creando…' : 'Crear recompensa'}
        </button>
      </form>
    </div>
  );
}
