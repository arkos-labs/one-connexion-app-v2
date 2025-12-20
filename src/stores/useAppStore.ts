import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";
import { createAuthSlice } from "./slices/authSlice";
import { createDriverSlice } from "./slices/driverSlice";
import { createOrderSlice } from "./slices/orderSlice";
import { AppStore } from "./types";

/**
 * Main Application Store - Sliced Architecture
 * 
 * ARCHITECTURE:
 * - AuthSlice: User authentication & session
 * - DriverSlice: Driver status, location, profile, preferences
 * - OrderSlice: Orders management & earnings
 * 
 * PERSISTENCE STRATEGY (SECURITY CRITICAL):
 * ✅ PERSISTED:
 *    - user, isAuthenticated (AuthSlice)
 *    - preferences, vehicle, documents (DriverSlice)
 * 
 * ❌ NOT PERSISTED (Security & Data Integrity):
 *    - driverLocation (real-time data, stale after restart)
 *    - driverStatus, isOnDuty (prevents ghost "online" status)
 *    - currentOrder, orders (prevents ghost active orders)
 *    - messages (chat is session-based)
 * 
 * PRICE HANDLING:
 * - All prices stored in cents (integers) to avoid floating-point errors
 * - Decimal.js used for all calculations
 * - Example: €15.50 stored as 1550 cents
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createDriverSlice(...args),
      ...createOrderSlice(...args),
    }),
    {
      name: "one-connexion-store-v4", // Incremented version for clean migration
      storage: createJSONStorage(() => localStorage),

      /**
       * Partialize - Define what gets persisted
       * CRITICAL: Only persist safe, non-volatile data
       */
      partialize: (state) => ({
        // ===== AUTH SLICE (Persisted) =====
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Note: isLoading and isSplashComplete are NOT persisted (runtime state)

        // ===== DRIVER SLICE (Partially Persisted) =====
        preferences: state.preferences,
        vehicle: state.vehicle,
        documents: state.documents,
        // Note: driverStatus, isOnDuty, driverLocation, messages NOT persisted

        // ===== ORDER SLICE (Partially Persisted) =====
        history: state.history,
        earningsInCents: state.earningsInCents,
        // Note: orders, currentOrder, lastCompletedOrder NOT persisted
      }),

      /**
       * Version for migration handling
       * Increment this when making breaking changes to the store structure
       */
      version: 4,

      /**
       * Migration function for handling version upgrades
       */
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<AppStore>;

        // Migration from v3 to v4: Convert earnings from float to cents
        if (version < 4) {
          const oldEarnings = (state as { earnings?: number }).earnings ?? 0;
          state.earningsInCents = Math.round(oldEarnings * 100);

          // Clean up old persisted fields that should not be persisted
          delete (state as { currentOrder?: unknown }).currentOrder;
          delete (state as { driverStatus?: unknown }).driverStatus;
          delete (state as { isOnDuty?: unknown }).isOnDuty;
          delete (state as { messages?: unknown }).messages;
          delete (state as { driverLocation?: unknown }).driverLocation;
          delete (state as { orders?: unknown }).orders;
          delete (state as { earnings?: unknown }).earnings;
        }

        return state as AppStore;
      },

      /**
       * Track hydration state to prevent premature redirects in AuthGuard
       * This is critical to avoid logging out users on page refresh
       */
      onRehydrateStorage: () => {
        console.log("🔄 Store hydration started...");
        return (state, error) => {
          if (error) {
            console.error("❌ Store hydration failed:", error);
          } else {
            console.log("✅ Store hydration complete");
          }
        };
      },
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 * Use these instead of accessing the full store when you only need specific slices
 */

// Auth selectors
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  setUser: state.setUser,
  logout: state.logout,
}));

// Driver selectors
export const useDriver = () => useAppStore((state) => ({
  driverStatus: state.driverStatus,
  isOnDuty: state.isOnDuty,
  driverLocation: state.driverLocation,
  vehicle: state.vehicle,
  preferences: state.preferences,
  setDriverStatus: state.setDriverStatus,
  setIsOnDuty: state.setIsOnDuty,
  setDriverLocation: state.setDriverLocation,
  updatePreferences: state.updatePreferences,
}));

// Order selectors
export const useOrders = () => useAppStore((state) => ({
  orders: state.orders,
  currentOrder: state.currentOrder,
  history: state.history,
  earnings: state.getEarnings(),
  acceptOrder: state.acceptOrder,
  updateOrderStatus: state.updateOrderStatus,
  completeOrder: state.completeOrder,
  rejectOrder: state.rejectOrder,
}));

/**
 * Hook to check if the store has been hydrated from localStorage
 * CRITICAL: Use this in AuthGuard to prevent premature redirects
 */
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if the store has been hydrated
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If already hydrated, set immediately
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsubscribe;
  }, []);

  return hydrated;
};

// Export types for convenience
export type { AppStore } from "./types";
export * from "./types";
