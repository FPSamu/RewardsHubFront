import { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import rewardService from '../services/rewardService';
import systemService from '../services/systemService';
import * as membershipService from '../services/membershipService';

// ─── Constants ────────────────────────────────────────────────────────────────
const REWARD_TYPE_LABELS = {
  discount:     'Descuento',
  free_product: 'Prod. gratis',
  coupon:       'Cupón',
  cashback:     'Cashback',
};

const parseErr = (e) =>
  typeof e === 'string' ? e : e?.response?.data?.message ?? e?.message ?? 'Ocurrió un error';

// ─── Icons ────────────────────────────────────────────────────────────────────
function CoinIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StampIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors flex-shrink-0"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function Spinner({ light = false }) {
  return (
    <span
      className={`animate-spin rounded-full h-3.5 w-3.5 border-2 inline-block ${
        light ? 'border-white border-t-transparent' : 'border-brand-primary border-t-transparent'
      }`}
    />
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
      {children} {required && <span className="text-accent-danger">*</span>}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors ${className}`}
      {...props}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors resize-none ${className}`}
      {...props}
    />
  );
}

function ErrorNote({ text }) {
  if (!text) return null;
  return (
    <p className="text-[12px] text-accent-danger bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
      {text}
    </p>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function ModalShell({ title, subtitle, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`bg-surface w-full ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        } sm:rounded-2xl shadow-popover overflow-hidden max-h-[92dvh] overflow-y-auto rounded-t-2xl`}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-start justify-between gap-3 sticky top-0 bg-surface z-10">
          <div>
            <h3 className="text-[16px] font-extrabold text-neutral-900">{title}</h3>
            {subtitle && <p className="text-[12px] text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Points System Banner ─────────────────────────────────────────────────────
function PointsSystemBanner({ config, onConfigure, onEdit }) {
  if (!config) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <CoinIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-amber-800">Sin sistema de puntos</p>
            <p className="text-[12px] text-amber-600">Configura cómo los clientes acumulan puntos por compra</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfigure}
          className="flex-shrink-0 px-3.5 py-2 rounded-pill bg-amber-500 text-white text-[12px] font-bold hover:opacity-90 transition-opacity"
        >
          Configurar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <CoinIcon className="w-4 h-4 text-brand-primary" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-neutral-800">Sistema de puntos activo</p>
          <p className="text-[12px] text-neutral-500">
            ${config.amount} {config.currency} ={' '}
            <span className="font-semibold text-brand-primary">{config.points} puntos</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex-shrink-0 px-3.5 py-2 rounded-pill border border-brand-primary/30 text-brand-primary text-[12px] font-bold hover:bg-brand-primary/5 transition-colors"
      >
        Editar
      </button>
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="px-5 py-4 animate-pulse flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-neutral-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-36 rounded bg-neutral-100" />
        <div className="h-2.5 w-24 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

// ─── Reward Card ──────────────────────────────────────────────────────────────
function RewardCard({ reward, onEdit, onToggleActive }) {
  const [pendingToggle, setPendingToggle] = useState(false);
  const [toggling, setToggling]           = useState(false);

  const isPoints   = reward.pointsRequired != null;
  const req        = isPoints ? reward.pointsRequired : reward.stampsRequired;
  const unit       = isPoints ? 'puntos' : 'sellos';
  const typeLabel  = REWARD_TYPE_LABELS[reward.rewardType];

  const handleConfirm = async () => {
    setToggling(true);
    try {
      await onToggleActive(reward.id ?? reward._id, !reward.isActive);
    } finally {
      setToggling(false);
      setPendingToggle(false);
    }
  };

  return (
    <div className={`px-5 py-4 transition-opacity ${!reward.isActive ? 'opacity-55' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
              isPoints ? 'bg-brand-primary/10' : 'bg-green-100'
            }`}
          >
            {isPoints
              ? <CoinIcon className="w-4 h-4 text-brand-primary" />
              : <StampIcon className="w-4 h-4 text-green-600" />
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-bold text-neutral-800 leading-tight">{reward.name}</p>
              {!reward.isActive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-500">
                  Inactiva
                </span>
              )}
            </div>
            {reward.description && (
              <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug line-clamp-1">
                {reward.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                  isPoints ? 'bg-brand-primary/10 text-brand-primary' : 'bg-green-100 text-green-700'
                }`}
              >
                {isPoints ? <CoinIcon className="w-3 h-3" /> : <StampIcon className="w-3 h-3" />}
                {req} {unit}
              </span>
              {typeLabel && (
                <span className="text-[11px] text-neutral-400">{typeLabel}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(reward)}
            title="Editar"
            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setPendingToggle(true)}
            title={reward.isActive ? 'Desactivar' : 'Activar'}
            className={`p-1.5 rounded-lg border transition-colors ${
              reward.isActive
                ? 'border-neutral-200 text-neutral-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                : 'border-neutral-200 text-neutral-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
            }`}
          >
            {reward.isActive ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {pendingToggle && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-neutral-600">
            {reward.isActive ? '¿Desactivar recompensa?' : '¿Activar recompensa?'}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={toggling}
            className={`px-2.5 py-1 rounded-pill text-white text-[11px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 ${
              reward.isActive ? 'bg-accent-danger' : 'bg-accent-success'
            }`}
          >
            {toggling ? <Spinner light /> : 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={() => setPendingToggle(false)}
            disabled={toggling}
            className="px-2.5 py-1 rounded-pill border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Rewards Panel ────────────────────────────────────────────────────────────
function RewardsPanel({ rewards, loading, onEdit, onToggleActive, onNew }) {
  const [showInactive, setShowInactive] = useState(false);

  const active   = rewards.filter((r) => r.isActive);
  const inactive = rewards.filter((r) => !r.isActive);

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-neutral-800">Recompensas</h2>
          {!loading && (
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {active.length} activa{active.length !== 1 ? 's' : ''}
              {inactive.length > 0 && `, ${inactive.length} inactiva${inactive.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva
        </button>
      </div>

      <div className="divide-y divide-neutral-100">
        {loading ? (
          <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
        ) : !rewards.length ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center px-5">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-neutral-600">Sin recompensas</p>
            <p className="text-[12px] text-neutral-400">Crea tu primera recompensa para los clientes</p>
            <button
              type="button"
              onClick={onNew}
              className="mt-1 px-4 py-2 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
            >
              Nueva recompensa
            </button>
          </div>
        ) : (
          <>
            {active.map((r) => (
              <RewardCard
                key={r.id ?? r._id}
                reward={r}
                onEdit={onEdit}
                onToggleActive={onToggleActive}
              />
            ))}
            {inactive.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowInactive((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-3 text-[12px] font-semibold text-neutral-500 hover:bg-neutral-50 transition-colors"
                >
                  <span>
                    {inactive.length} inactiva{inactive.length !== 1 ? 's' : ''}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showInactive ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showInactive &&
                  inactive.map((r) => (
                    <RewardCard
                      key={r.id ?? r._id}
                      reward={r}
                      onEdit={onEdit}
                      onToggleActive={onToggleActive}
                    />
                  ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Membership Plans Panel ───────────────────────────────────────────────────
function MembershipPlansPanel({ plans, loading, onAdd, onEdit, onToggle, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDelete = async (id) => {
    if (pendingDelete === id) {
      await onDelete(id);
      setPendingDelete(null);
    } else {
      setPendingDelete(id);
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-neutral-800">Planes de Membresía</h2>
          {!loading && plans.length > 0 && (
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {plans.length} plan{plans.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      <div className="divide-y divide-neutral-100">
        {loading ? (
          <><SkeletonRow /><SkeletonRow /></>
        ) : !plans.length ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center px-5">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-neutral-600">Sin planes</p>
            <p className="text-[12px] text-neutral-400">Los planes dan beneficios diarios a los miembros</p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-1 px-3 py-1.5 rounded-pill bg-brand-primary text-brand-onColor text-[12px] font-bold hover:opacity-90 transition-opacity"
            >
              Nuevo plan
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan._id} className={`px-5 py-4 transition-opacity ${!plan.isActive ? 'opacity-55' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-bold text-neutral-800">{plan.name}</p>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        plan.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-[12px] text-brand-primary font-semibold mt-0.5 leading-snug">
                    {plan.benefit}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {plan.durationDays} días · ${plan.price}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggle(plan)}
                    title={plan.isActive ? 'Desactivar' : 'Activar'}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    {plan.isActive ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(plan)}
                    title="Editar"
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan._id)}
                    title="Eliminar"
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {pendingDelete === plan._id && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-neutral-600">¿Eliminar plan?</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan._id)}
                    className="px-2.5 py-1 rounded-pill bg-accent-danger text-white text-[11px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="px-2.5 py-1 rounded-pill border border-neutral-200 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Points System Modal ──────────────────────────────────────────────────────
function PointsSystemModal({ formData, setFormData, saving, error, isEditing, onClose, onSubmit }) {
  return (
    <ModalShell
      title={isEditing ? 'Editar sistema de puntos' : 'Configurar sistema de puntos'}
      subtitle="Define cuántos puntos gana el cliente por cada compra"
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="px-5 py-5 space-y-5">
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[12px] text-amber-700">
            Establece la equivalencia entre dinero gastado y puntos ganados.{' '}
            {isEditing
              ? <span className="font-semibold">Los cambios aplican a acumulaciones futuras.</span>
              : 'Solo necesitas configurarlo una vez.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel required>Monto ($)</FieldLabel>
            <Input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="100"
              value={formData.amount}
              onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel required>Moneda</FieldLabel>
            <Select
              required
              value={formData.currency}
              onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </Select>
          </div>
          <div>
            <FieldLabel required>Puntos</FieldLabel>
            <Input
              type="number"
              required
              min="1"
              placeholder="10"
              value={formData.points}
              onChange={(e) => setFormData((p) => ({ ...p, points: e.target.value }))}
            />
          </div>
        </div>

        {formData.amount && formData.points && (
          <div className="rounded-xl bg-brand-primary/5 border border-brand-primary/15 px-4 py-3">
            <p className="text-[12px] text-neutral-600">
              Por cada{' '}
              <span className="font-bold text-brand-primary">${formData.amount} {formData.currency}</span>{' '}
              gastados, el cliente recibe{' '}
              <span className="font-bold text-brand-primary">{formData.points} puntos</span>
            </p>
          </div>
        )}

        <ErrorNote text={error} />

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Spinner light />}
            {isEditing ? 'Guardar cambios' : 'Guardar configuración'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Create Reward Modal ──────────────────────────────────────────────────────
function CreateRewardModal({
  rewardType, setRewardType,
  pointsForm, setPointsForm,
  stampsForm, setStampsForm,
  saving, error,
  hasPointsSystem, pointsSystemConfig,
  onClose, onSubmit, onConfigurePoints,
}) {
  return (
    <ModalShell title="Nueva recompensa" onClose={onClose} wide>
      {!rewardType ? (
        <div className="px-5 py-5 space-y-3">
          <p className="text-[13px] text-neutral-500">Elige el tipo de recompensa:</p>

          <button
            type="button"
            onClick={() => hasPointsSystem && setRewardType('points')}
            disabled={!hasPointsSystem}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              hasPointsSystem
                ? 'border-neutral-200 hover:border-brand-primary hover:bg-brand-primary/[0.03] cursor-pointer'
                : 'border-neutral-100 bg-neutral-50 cursor-not-allowed opacity-60'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${hasPointsSystem ? 'bg-brand-primary/10' : 'bg-neutral-200'}`}>
              <CoinIcon className={`w-5 h-5 ${hasPointsSystem ? 'text-brand-primary' : 'text-neutral-400'}`} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-neutral-800">Sistema de Puntos</p>
              <p className="text-[12px] text-neutral-500 mt-0.5">Los clientes acumulan puntos por compra y los canjean por recompensas.</p>
              {!hasPointsSystem ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-accent-danger font-semibold">Configura el sistema primero</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onConfigurePoints(); }}
                    className="text-[11px] text-brand-primary font-semibold hover:underline"
                  >
                    Configurar →
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-accent-success font-semibold mt-1.5">
                  ✓ ${pointsSystemConfig?.amount} {pointsSystemConfig?.currency} = {pointsSystemConfig?.points} pts
                </p>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRewardType('stamps')}
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-neutral-200 hover:border-green-400 hover:bg-green-50/50 text-left transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <StampIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-neutral-800">Sistema de Estampas</p>
              <p className="text-[12px] text-neutral-500 mt-0.5">Los clientes reciben una estampa por compra y obtienen su recompensa al completar el objetivo.</p>
              <p className="text-[11px] text-green-600 font-semibold mt-1.5">Ej: 10 cafés = 1 café gratis</p>
            </div>
          </button>
        </div>
      ) : rewardType === 'points' ? (
        <form onSubmit={onSubmit} className="px-5 py-5 space-y-4">
          {pointsSystemConfig && (
            <div className="rounded-xl bg-brand-primary/5 border border-brand-primary/15 px-4 py-3 text-[12px] text-neutral-600">
              Sistema configurado: <span className="font-semibold text-brand-primary">${pointsSystemConfig.amount} {pointsSystemConfig.currency} = {pointsSystemConfig.points} pts</span>
            </div>
          )}
          <div>
            <FieldLabel required>Nombre de la recompensa</FieldLabel>
            <Input
              type="text" required placeholder="Ej: Descuento de $50"
              value={pointsForm.name}
              onChange={(e) => setPointsForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              rows={2} placeholder="¿Qué obtiene el cliente?"
              value={pointsForm.description}
              onChange={(e) => setPointsForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel required>Puntos requeridos</FieldLabel>
            <Input
              type="number" required min="1" placeholder="100"
              value={pointsForm.pointsRequired}
              onChange={(e) => setPointsForm((p) => ({ ...p, pointsRequired: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Tipo</FieldLabel>
              <Select
                required
                value={pointsForm.rewardType}
                onChange={(e) => setPointsForm((p) => ({ ...p, rewardType: e.target.value }))}
              >
                <option value="discount">Descuento</option>
                <option value="free_product">Producto gratis</option>
                <option value="coupon">Cupón</option>
              </Select>
            </div>
            {pointsForm.rewardType !== 'free_product' && (
              <div>
                <FieldLabel required>Valor</FieldLabel>
                <Input
                  type="number" required min="0" step="0.01" placeholder="50"
                  value={pointsForm.rewardValue}
                  onChange={(e) => setPointsForm((p) => ({ ...p, rewardValue: e.target.value }))}
                />
              </div>
            )}
          </div>
          <ErrorNote text={error} />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setRewardType(null)} className="px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
              ← Volver
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving && <Spinner light />}
              Crear recompensa
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="px-5 py-5 space-y-4">
          <div>
            <FieldLabel required>Nombre de la recompensa</FieldLabel>
            <Input
              type="text" required placeholder="Ej: Café gratis"
              value={stampsForm.name}
              onChange={(e) => setStampsForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              rows={2} placeholder="¿Qué obtiene el cliente?"
              value={stampsForm.description}
              onChange={(e) => setStampsForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel required>Meta de estampas</FieldLabel>
            <Input
              type="number" required min="1" placeholder="10"
              value={stampsForm.targetStamps}
              onChange={(e) => setStampsForm((p) => ({ ...p, targetStamps: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Tipo de recompensa</FieldLabel>
              <Select
                required
                value={stampsForm.stampReward.rewardType}
                onChange={(e) => setStampsForm((p) => ({ ...p, stampReward: { ...p.stampReward, rewardType: e.target.value } }))}
              >
                <option value="free_product">Producto gratis</option>
                <option value="discount">Descuento</option>
                <option value="coupon">Cupón</option>
              </Select>
            </div>
            {stampsForm.stampReward.rewardType !== 'free_product' && (
              <div>
                <FieldLabel required>Valor</FieldLabel>
                <Input
                  type="number" required min="0" step="0.01" placeholder="50"
                  value={stampsForm.stampReward.rewardValue}
                  onChange={(e) => setStampsForm((p) => ({ ...p, stampReward: { ...p.stampReward, rewardValue: e.target.value } }))}
                />
              </div>
            )}
          </div>
          <ErrorNote text={error} />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setRewardType(null)} className="px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
              ← Volver
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving && <Spinner light />}
              Crear recompensa
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

// ─── Edit Reward Modal ────────────────────────────────────────────────────────
function EditRewardModal({ reward, formData, setFormData, saving, error, onClose, onSubmit }) {
  if (!reward) return null;
  const isPoints = reward.pointsRequired != null;

  return (
    <ModalShell
      title="Editar recompensa"
      subtitle={isPoints ? 'Recompensa por puntos' : 'Recompensa por estampas'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="px-5 py-5 space-y-4">
        <div>
          <FieldLabel required>Nombre</FieldLabel>
          <Input
            type="text" required placeholder="Ej: Café gratis"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel>Descripción</FieldLabel>
          <Textarea
            rows={2} placeholder="Descripción de la recompensa"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Tipo</FieldLabel>
            <Select
              required
              value={formData.rewardType}
              onChange={(e) => setFormData((p) => ({ ...p, rewardType: e.target.value }))}
            >
              <option value="discount">Descuento</option>
              <option value="free_product">Producto gratis</option>
              <option value="coupon">Cupón</option>
              <option value="cashback">Cashback</option>
            </Select>
          </div>
          <div>
            <FieldLabel required>Valor</FieldLabel>
            <Input
              type={formData.rewardType === 'discount' || formData.rewardType === 'cashback' ? 'number' : 'text'}
              required
              min={formData.rewardType === 'discount' || formData.rewardType === 'cashback' ? '0' : undefined}
              step={formData.rewardType === 'discount' || formData.rewardType === 'cashback' ? '0.01' : undefined}
              placeholder={formData.rewardType === 'free_product' ? 'Nombre del producto' : '50'}
              value={formData.rewardValue}
              onChange={(e) => setFormData((p) => ({ ...p, rewardValue: e.target.value }))}
            />
          </div>
        </div>
        {isPoints ? (
          <div>
            <FieldLabel required>Puntos requeridos</FieldLabel>
            <Input
              type="number" required min="1" placeholder="100"
              value={formData.pointsRequired}
              onChange={(e) => setFormData((p) => ({ ...p, pointsRequired: e.target.value }))}
            />
          </div>
        ) : (
          <div>
            <FieldLabel required>Estampas requeridas</FieldLabel>
            <Input
              type="number" required min="1" placeholder="10"
              value={formData.stampsRequired}
              onChange={(e) => setFormData((p) => ({ ...p, stampsRequired: e.target.value }))}
            />
          </div>
        )}
        <ErrorNote text={error} />
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving && <Spinner light />}
            Guardar cambios
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Plan Modal ───────────────────────────────────────────────────────────────
function PlanModal({ plan, form, setForm, saving, error, onClose, onSubmit }) {
  return (
    <ModalShell
      title={plan ? 'Editar plan' : 'Nuevo plan de membresía'}
      subtitle="El cajero puede activar estos planes al escanear el QR del cliente"
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="px-5 py-5 space-y-4">
        <div>
          <FieldLabel required>Nombre del plan</FieldLabel>
          <Input
            required placeholder="Ej: Café Premium Mensual"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel required>Descripción</FieldLabel>
          <Textarea
            required rows={2} placeholder="Ej: Membresía mensual con 1 café diario"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel required>Beneficio diario</FieldLabel>
          <Input
            required placeholder="Ej: 1 café gratis por día"
            value={form.benefit}
            onChange={(e) => setForm((f) => ({ ...f, benefit: e.target.value }))}
          />
          <p className="text-[11px] text-neutral-400 mt-1">Texto corto que verá el cajero al canjear</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Duración (días)</FieldLabel>
            <Input
              required type="number" min="1" placeholder="30"
              value={form.durationDays}
              onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel required>Precio ($)</FieldLabel>
            <Input
              required type="number" min="0" step="0.01" placeholder="500"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
        </div>
        <ErrorNote text={error} />
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 rounded-pill border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving && <Spinner light />}
            {plan ? 'Guardar cambios' : 'Crear plan'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="pb-10 space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded bg-neutral-200" />
      <div className="h-14 rounded-xl bg-neutral-100" />
      <div className="h-64 rounded-xl bg-neutral-100" />
      <div className="h-48 rounded-xl bg-neutral-100" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BusinessRewards() {
  const [business,          setBusiness]          = useState(null);
  const [rewards,           setRewards]           = useState([]);
  const [membershipPlans,   setMembershipPlans]   = useState([]);
  const [loadingPage,       setLoadingPage]       = useState(true);
  const [pageError,         setPageError]         = useState('');

  const [pointsSystem,      setPointsSystem]      = useState(null);
  const [stampsSystem,      setStampsSystem]      = useState(null);
  const [pointsSystemConfig, setPointsSystemConfig] = useState(null);

  // Modals
  const [showCreateModal,       setShowCreateModal]       = useState(false);
  const [showPointsModal,       setShowPointsModal]       = useState(false);
  const [isEditingPoints,       setIsEditingPoints]       = useState(false);
  const [showEditModal,         setShowEditModal]         = useState(false);
  const [editingReward,         setEditingReward]         = useState(null);
  const [showPlanModal,         setShowPlanModal]         = useState(false);
  const [editingPlan,           setEditingPlan]           = useState(null);

  // Create reward form
  const [rewardType,       setRewardType]       = useState(null);
  const [pointsForm,       setPointsForm]       = useState({ name: '', description: '', pointsRequired: '', rewardType: 'discount', rewardValue: '' });
  const [stampsForm,       setStampsForm]       = useState({ name: '', description: '', targetStamps: '', stampReward: { rewardType: 'free_product', rewardValue: '' } });
  const [createSaving,     setCreateSaving]     = useState(false);
  const [createError,      setCreateError]      = useState('');

  // Edit reward form
  const [editForm,   setEditForm]   = useState({ name: '', description: '', rewardType: '', rewardValue: '', pointsRequired: '', stampsRequired: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState('');

  // Points system form
  const [pointsSystemForm, setPointsSystemForm] = useState({ amount: '', currency: 'MXN', points: '' });
  const [pointsSaving,     setPointsSaving]     = useState(false);
  const [pointsError,      setPointsError]      = useState('');

  // Plan form
  const [planForm,   setPlanForm]   = useState({ name: '', description: '', benefit: '', durationDays: '', price: '' });
  const [planSaving, setPlanSaving] = useState(false);
  const [planError,  setPlanError]  = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoadingPage(true);
      const biz = await businessService.getMyBusiness();
      setBusiness(biz);

      const [rewardsData, systemsData, plans] = await Promise.all([
        rewardService.getBusinessRewards(biz.id ?? biz._id, true),
        systemService.getBusinessSystems(),
        membershipService.getMyPlans().catch(() => []),
      ]);

      setRewards(rewardsData);
      setMembershipPlans(plans);

      const pts = systemsData.find((s) => s.type === 'points' && s.isActive);
      setPointsSystem(pts ?? null);
      setPointsSystemConfig(pts?.pointsConversion ?? null);
      setStampsSystem(systemsData.find((s) => s.type === 'stamps' && s.isActive) ?? null);
    } catch (e) {
      setPageError(parseErr(e));
    } finally {
      setLoadingPage(false);
    }
  };

  // ── Rewards ────────────────────────────────────────────────────────────────
  const handleToggleActive = async (id, nextActive) => {
    await rewardService.updateReward(id, { isActive: nextActive });
    setRewards((prev) => prev.map((r) => (r.id === id || r._id === id) ? { ...r, isActive: nextActive } : r));
  };

  const openEdit = (reward) => {
    setEditingReward(reward);
    setEditForm({
      name:           reward.name ?? '',
      description:    reward.description ?? '',
      rewardType:     reward.rewardType ?? '',
      rewardValue:    reward.rewardValue ?? '',
      pointsRequired: reward.pointsRequired ?? '',
      stampsRequired: reward.stampsRequired ?? '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditingReward(null);
    setEditError('');
  };

  const handleUpdateReward = async (e) => {
    e.preventDefault();
    if (!editingReward) return;
    setEditSaving(true);
    setEditError('');
    try {
      const payload = {
        name:        editForm.name,
        description: editForm.description,
        rewardType:  editForm.rewardType,
        rewardValue:
          editForm.rewardType === 'discount' || editForm.rewardType === 'cashback'
            ? parseFloat(editForm.rewardValue)
            : editForm.rewardValue,
      };
      if (editForm.pointsRequired) payload.pointsRequired = parseInt(editForm.pointsRequired);
      if (editForm.stampsRequired) payload.stampsRequired = parseInt(editForm.stampsRequired);

      const updated = await rewardService.updateReward(editingReward.id ?? editingReward._id, payload);
      setRewards((prev) =>
        prev.map((r) => r.id === updated.id || r._id === updated._id ? updated : r)
      );
      closeEdit();
    } catch (e) {
      setEditError(parseErr(e));
    } finally {
      setEditSaving(false);
    }
  };

  const openCreate = () => {
    setRewardType(null);
    setPointsForm({ name: '', description: '', pointsRequired: '', rewardType: 'discount', rewardValue: '' });
    setStampsForm({ name: '', description: '', targetStamps: '', stampReward: { rewardType: 'free_product', rewardValue: '' } });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    setCreateSaving(true);
    setCreateError('');
    try {
      if (rewardType === 'points') {
        if (!pointsSystem) throw new Error('No se encontró el sistema de puntos');
        let rewardValue;
        if (pointsForm.rewardType === 'free_product') rewardValue = pointsForm.name;
        else if (pointsForm.rewardType === 'discount')  rewardValue = parseFloat(pointsForm.rewardValue);
        else                                             rewardValue = pointsForm.rewardValue;

        await rewardService.createPointsReward({
          systemId:       pointsSystem.id,
          name:           pointsForm.name,
          description:    pointsForm.description,
          rewardType:     pointsForm.rewardType,
          rewardValue,
          pointsRequired: parseInt(pointsForm.pointsRequired),
        });
      } else {
        let systemId = stampsSystem?.id;
        if (!systemId) {
          const newSys = await systemService.createStampsSystem({
            name:             'Sistema de Sellos',
            description:      'Sistema de recompensas por sellos',
            targetStamps:     parseInt(stampsForm.targetStamps),
            productType:      'any',
          });
          systemId = newSys.id;
        }
        await rewardService.createStampsReward({
          systemId,
          name:           stampsForm.name,
          description:    stampsForm.description,
          rewardType:     stampsForm.stampReward.rewardType,
          rewardValue:
            stampsForm.stampReward.rewardValue
              ? parseFloat(stampsForm.stampReward.rewardValue)
              : stampsForm.name,
          stampsRequired: parseInt(stampsForm.targetStamps),
        });
      }
      await fetchAll();
      setShowCreateModal(false);
    } catch (e) {
      setCreateError(parseErr(e));
    } finally {
      setCreateSaving(false);
    }
  };

  // ── Points system ──────────────────────────────────────────────────────────
  const openPointsModal = (editMode = false) => {
    setIsEditingPoints(editMode);
    setPointsSystemForm(
      editMode && pointsSystem
        ? { amount: pointsSystem.pointsConversion?.amount?.toString() ?? '', currency: pointsSystem.pointsConversion?.currency ?? 'MXN', points: pointsSystem.pointsConversion?.points?.toString() ?? '' }
        : { amount: '', currency: 'MXN', points: '' }
    );
    setPointsError('');
    setShowPointsModal(true);
  };

  const handleSavePointsSystem = async (e) => {
    e.preventDefault();
    setPointsSaving(true);
    setPointsError('');
    try {
      const payload = {
        name: 'Sistema de Puntos',
        description: 'Sistema de acumulación de puntos',
        pointsConversion: {
          amount:   parseFloat(pointsSystemForm.amount),
          currency: pointsSystemForm.currency,
          points:   parseInt(pointsSystemForm.points),
        },
      };
      if (isEditingPoints && pointsSystem) await systemService.updatePointsSystem(pointsSystem.id, payload);
      else                                  await systemService.createPointsSystem(payload);
      await fetchAll();
      setShowPointsModal(false);
    } catch (e) {
      setPointsError(parseErr(e));
    } finally {
      setPointsSaving(false);
    }
  };

  // ── Membership plans ───────────────────────────────────────────────────────
  const openNewPlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', description: '', benefit: '', durationDays: '', price: '' });
    setPlanError('');
    setShowPlanModal(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name:        plan.name,
      description: plan.description,
      benefit:     plan.benefit,
      durationDays: String(plan.durationDays),
      price:       String(plan.price),
    });
    setPlanError('');
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setPlanSaving(true);
    setPlanError('');
    try {
      const payload = {
        name:        planForm.name.trim(),
        description: planForm.description.trim(),
        benefit:     planForm.benefit.trim(),
        durationDays: Number(planForm.durationDays),
        price:       Number(planForm.price),
      };
      if (editingPlan) await membershipService.updatePlan(editingPlan._id, payload);
      else             await membershipService.createPlan(payload);
      const plans = await membershipService.getMyPlans();
      setMembershipPlans(plans);
      setShowPlanModal(false);
    } catch (e) {
      setPlanError(parseErr(e));
    } finally {
      setPlanSaving(false);
    }
  };

  const handleTogglePlan = async (plan) => {
    try {
      await membershipService.updatePlan(plan._id, { isActive: !plan.isActive });
      setMembershipPlans((prev) =>
        prev.map((p) => p._id === plan._id ? { ...p, isActive: !p.isActive } : p)
      );
    } catch {}
  };

  const handleDeletePlan = async (id) => {
    try {
      await membershipService.deletePlan(id);
      setMembershipPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      setPlanError(parseErr(e));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loadingPage) return <PageSkeleton />;

  if (pageError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-neutral-700">No se pudieron cargar los datos</p>
        <button
          onClick={fetchAll}
          className="px-4 py-2 rounded-pill bg-brand-primary text-brand-onColor text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-extrabold text-neutral-900">Recompensas</h1>
        <p className="text-[13px] text-neutral-400 mt-0.5">
          Gestiona recompensas y planes de membresía de {business?.name}
        </p>
      </div>

      {/* Points system banner */}
      <PointsSystemBanner
        config={pointsSystemConfig}
        onConfigure={() => openPointsModal(false)}
        onEdit={() => openPointsModal(true)}
      />

      {/* Rewards + Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RewardsPanel
            rewards={rewards}
            loading={false}
            onEdit={openEdit}
            onToggleActive={handleToggleActive}
            onNew={openCreate}
          />
        </div>
        <div className="lg:col-span-2">
          <MembershipPlansPanel
            plans={membershipPlans}
            loading={false}
            onAdd={openNewPlan}
            onEdit={openEditPlan}
            onToggle={handleTogglePlan}
            onDelete={handleDeletePlan}
          />
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateRewardModal
          rewardType={rewardType}
          setRewardType={setRewardType}
          pointsForm={pointsForm}
          setPointsForm={setPointsForm}
          stampsForm={stampsForm}
          setStampsForm={setStampsForm}
          saving={createSaving}
          error={createError}
          hasPointsSystem={!!pointsSystem}
          pointsSystemConfig={pointsSystemConfig}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateReward}
          onConfigurePoints={() => { setShowCreateModal(false); openPointsModal(false); }}
        />
      )}

      {showPointsModal && (
        <PointsSystemModal
          formData={pointsSystemForm}
          setFormData={setPointsSystemForm}
          saving={pointsSaving}
          error={pointsError}
          isEditing={isEditingPoints}
          onClose={() => setShowPointsModal(false)}
          onSubmit={handleSavePointsSystem}
        />
      )}

      {showEditModal && (
        <EditRewardModal
          reward={editingReward}
          formData={editForm}
          setFormData={setEditForm}
          saving={editSaving}
          error={editError}
          onClose={closeEdit}
          onSubmit={handleUpdateReward}
        />
      )}

      {showPlanModal && (
        <PlanModal
          plan={editingPlan}
          form={planForm}
          setForm={setPlanForm}
          saving={planSaving}
          error={planError}
          onClose={() => setShowPlanModal(false)}
          onSubmit={handleSavePlan}
        />
      )}
    </div>
  );
}
