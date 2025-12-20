import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order } from "../types";

export type UserRole = "driver" | "dispatcher" | "admin";
export type DriverStatus = "online" | "busy" | "offline";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

// NEW: Types pour les préférences
export interface DriverPreferences {
  vehicleType: "car" | "bike" | "scooter";
  navigationApp: "waze" | "google_maps" | "apple_maps";
  soundEnabled: boolean;
  darkMode: boolean;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSplashComplete: boolean; // Keep existing state

  // Driver State
  driverStatus: DriverStatus;
  isOnDuty: boolean;
  driverLocation: { lat: number; lng: number };

  // Data State
  orders: Order[];
  currentOrder: Order | null;
  history: Order[];
  earnings: number;
  lastCompletedOrder: Order | null; // Keep existing state

  // NEW: Preferences State
  preferences: DriverPreferences;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void; // Keep existing action
  setSplashComplete: (complete: boolean) => void; // Keep existing action

  logout: () => void;
  setDriverStatus: (status: DriverStatus) => void;
  setIsOnDuty: (isOnDuty: boolean) => void; // Keep existing action used by toggle
  setDriverLocation: (location: { lat: number; lng: number }) => void;

  // Workflow Actions
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (status: Order['status']) => void;
  completeOrder: () => void;
  rejectOrder: (orderId: string) => void;
  triggerNewOrder: () => void;
  clearSummary: () => void; // Keep existing action

  // NEW: Preferences Actions
  updatePreferences: (prefs: Partial<DriverPreferences>) => void;
}

// MOCK DATA
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    clientName: "Alice Dupont",
    pickupLocation: { lat: 48.8566, lng: 2.3522, address: "10 Rue de Rivoli, Paris" },
    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: "Musée du Louvre, Paris" },
    price: 15.50,
    distance: "2.5 km",
    status: "pending"
  },
  {
    id: "2",
    clientName: "Jean Martin",
    pickupLocation: { lat: 48.8584, lng: 2.2945, address: "Tour Eiffel, Paris" },
    dropoffLocation: { lat: 48.8738, lng: 2.2950, address: "Arc de Triomphe, Paris" },
    price: 22.00,
    distance: "3.2 km",
    status: "pending"
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSplashComplete: false,

      driverStatus: "offline",
      isOnDuty: false,
      driverLocation: { lat: 48.8566, lng: 2.3522 },

      orders: MOCK_ORDERS,
      currentOrder: null,
      history: [],
      earnings: 0,
      lastCompletedOrder: null,

      // Default Preferences
      preferences: {
        vehicleType: "car",
        navigationApp: "google_maps",
        soundEnabled: true,
        darkMode: false
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setSplashComplete: (isSplashComplete) => set({ isSplashComplete }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        driverStatus: "offline",
        isOnDuty: false,
        history: [],
        earnings: 0,
        currentOrder: null
      }),

      setDriverStatus: (status) => set({ driverStatus: status, isOnDuty: status === 'online' }),
      setIsOnDuty: (isOnDuty) => set({
        isOnDuty,
        driverStatus: isOnDuty ? "online" : "offline"
      }),
      setDriverLocation: (loc) => set({ driverLocation: loc }),

      acceptOrder: (orderId) => set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return state;
        return {
          currentOrder: { ...order, status: "accepted" },
          orders: state.orders.filter(o => o.id !== orderId),
          driverStatus: "busy"
        };
      }),

      updateOrderStatus: (status) => set((state) => ({
        currentOrder: state.currentOrder ? { ...state.currentOrder, status } : null
      })),

      completeOrder: () => set((state) => {
        if (!state.currentOrder) return state;

        const completedOrder: Order = {
          ...state.currentOrder,
          status: 'completed',
          completedAt: new Date().toISOString()
        };

        return {
          earnings: state.earnings + state.currentOrder.price,
          history: [completedOrder, ...state.history],
          currentOrder: null,
          driverStatus: "online",
          lastCompletedOrder: completedOrder
        };
      }),

      clearSummary: () => set({ lastCompletedOrder: null }),

      rejectOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(o => o.id !== orderId)
      })),

      triggerNewOrder: () => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        const lat = 48.8566 + (Math.random() - 0.5) * 0.05;
        const lng = 2.3522 + (Math.random() - 0.5) * 0.05;

        const newOrder: Order = {
          id,
          clientName: `Client #${Math.floor(Math.random() * 1000)}`,
          pickupLocation: { lat, lng, address: "Nouvelle Adresse, Paris" },
          dropoffLocation: { lat: lat + 0.01, lng: lng + 0.01, address: "Destination, Paris" },
          price: Math.floor(Math.random() * 30) + 10,
          distance: "3.5 km",
          status: "pending"
        };

        return { orders: [...state.orders, newOrder] };
      }),

      // Update Action
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
    }),
    {
      name: "one-connexion-store-v2",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        history: state.history,
        earnings: state.earnings,
        currentOrder: state.currentOrder,
        preferences: state.preferences // Persistance des préférences
      }),
    }
  )
);
