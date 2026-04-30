import api from "./api";

// ─── Local cache ──────────────────────────────────────────────────────────────
// TTL: 10 minutes. Cleared on logout, payment success, and cancellation.

const CACHE_KEY = 'biz_subscription_status';
const CACHE_TTL = 10 * 60 * 1000; // 10 min

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      expiresAt: Date.now() + CACHE_TTL,
    }));
  } catch { /* storage full — silently skip */ }
};

export const clearSubscriptionCache = () => localStorage.removeItem(CACHE_KEY);

// ─── Service ──────────────────────────────────────────────────────────────────

export const subscriptionService = {
  // Get current business subscription status (cached)
  getSubscriptionStatus: async () => {
    const cached = readCache();
    if (cached) return cached;

    try {
      const response = await api.get("/subscription/status");
      writeCache(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create Stripe checkout session
  createCheckoutSession: async (priceId, plan) => {
    try {
      const response = await api.post("/subscription/checkout", { priceId, plan });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get subscription plans
  getPlans: async () => {
    try {
      const response = await api.get("/subscription/plans");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel subscription — clears cache so next check reflects new state
  cancelSubscription: async () => {
    try {
      const response = await api.post("/subscription/cancel");
      clearSubscriptionCache();
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify subscription after payment — clears cache and re-fetches fresh data
  verifySubscription: async () => {
    try {
      const response = await api.get("/subscription/verify");
      clearSubscriptionCache();
      // Write the verified status immediately so next check is instant
      if (response.data) writeCache(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Activate lifetime subscription
  activateLifetime: async (code) => {
    try {
      const response = await api.post("/subscription/activate-lifetime", { code });
      clearSubscriptionCache();
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default subscriptionService;
