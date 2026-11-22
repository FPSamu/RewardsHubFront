import api from './api';
import idempotentPost from './idempotentPost';

// ── Plan management (business) ──────────────────────────────────────────────
export const getMyPlans = () =>
    api.get('/memberships/plans').then(r => r.data);

export const createPlan = (data) =>
    api.post('/memberships/plans', data).then(r => r.data);

export const updatePlan = (id, data) =>
    api.put(`/memberships/plans/${id}`, data).then(r => r.data);

export const deletePlan = (id) =>
    api.delete(`/memberships/plans/${id}`).then(r => r.data);

// ── Cashier actions ─────────────────────────────────────────────────────────
export const getClientMembership = (userId) =>
    api.get(`/memberships/client/${userId}`).then(r => r.data);

export const activateMembership = (userId, planId, idempotencyKey) =>
    idempotentPost('/memberships/activate', { userId, planId }, idempotencyKey).then(r => r.data);

export const redeemDailyBenefit = (userId, membershipId, idempotencyKey) =>
    idempotentPost('/memberships/redeem', { userId, membershipId }, idempotencyKey).then(r => r.data);

// ── Client ──────────────────────────────────────────────────────────────────
export const getMyMemberships = () =>
    api.get('/memberships/my').then(r => r.data);
