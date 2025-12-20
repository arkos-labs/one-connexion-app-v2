import { StateCreator } from "zustand";
import { AppStore, AuthSlice } from "../types";

/**
 * AuthSlice - Manages user authentication and session
 * 
 * SECURITY: This slice is PERSISTED to maintain user session
 * Only authentication-related data is stored here
 */
export const createAuthSlice: StateCreator<
    AppStore,
    [],
    [],
    AuthSlice
> = (set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isSplashComplete: false,

    // Actions
    setUser: (user) => set({
        user,
        isAuthenticated: !!user
    }),

    setIsLoading: (isLoading) => set({ isLoading }),

    setSplashComplete: (isSplashComplete) => set({ isSplashComplete }),

    logout: () => {
        const state = get();

        // SECURITY: Prevent logout if driver has an active order
        if (state.currentOrder) {
            console.warn("Cannot logout: Active order in progress");
            return false;
        }

        // Clear all user-related data
        set({
            user: null,
            isAuthenticated: false,
            // Also reset driver state on logout
            driverStatus: "offline",
            isOnDuty: false,
            // Clear order history and earnings
            history: [],
            earningsInCents: 0,
            currentOrder: null,
            messages: []
        });

        return true;
    },
});
