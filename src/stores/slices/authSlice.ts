import { StateCreator } from "zustand";
import { UserRole, AppStore, AuthSlice, User } from "../types";
import { supabase } from "../../lib/supabase";
import { driverService } from "../../services/driverService";

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

    signIn: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Fetch profile data from 'profiles' table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError) throw profileError;

            const user: User = {
                id: authData.user.id,
                email: authData.user.email!,
                fullName: (profileData.first_name || profileData.last_name)
                    ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
                    : 'Chauffeur',
                role: profileData.role as any,
                avatarUrl: undefined // Can be added later
            };

            set({
                user,
                isAuthenticated: true,
                isLoading: false
            });

            return { success: true };
        } catch (error: any) {
            console.error("Login error:", error);
            set({ isLoading: false });
            return { success: false, error: error.message || "An unknown error occurred" };
        }
    },

    signUp: async ({ email, password, fullName, vehicleType }) => {
        set({ isLoading: true });
        try {
            // 1. Prepare Profile Data (Metadata)
            const names = fullName.trim().split(/\s+/);
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(" ") || "";

            // 2. Create Auth User with Metadata
            // This will trigger public.handle_new_user() in DB which creates profiles and drivers records
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role: 'driver',
                        vehicle_type: vehicleType
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Erreur lors de la création du compte.");

            // 3. Update local state
            const user: User = {
                id: authData.user.id,
                email: authData.user.email!,
                fullName: fullName,
                role: 'driver'
            };

            set((state) => ({
                user,
                isAuthenticated: !!authData.session,
                isLoading: false,
                preferences: {
                    ...state.preferences,
                    vehicleType
                }
            }));

            return { success: true };
        } catch (error: any) {
            console.error("Signup error:", error);
            set({ isLoading: false });
            return { success: false, error: error.message || "An unknown error occurred" };
        }
    },

    logout: async () => {
        const state = get();

        // SECURITY: Prevent logout if driver has an active order
        if (state.currentOrder) {
            console.warn("Cannot logout: Active order in progress");
            return false;
        }

        try {
            // Sync offline status before logging out
            if (state.user && state.user.id) {
                await driverService.updateStatus(state.user.id, false, 'offline');
            }
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out from Supabase:", error);
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
