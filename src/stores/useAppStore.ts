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

// 1. Nouvelles Interfaces
export interface DriverDocument {
  id: string;
  name: string; // ex: "Permis de conduire", "Assurance"
  status: 'verified' | 'pending' | 'expired' | 'missing';
  expiryDate?: string;
}

export interface DriverPreferences {
  vehicleType: "car" | "bike" | "scooter";
  navigationApp: "waze" | "google_maps" | "apple_maps";
  soundEnabled: boolean;
  darkMode: boolean;
  autoAccept: boolean; // NOUVEAU
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSplashComplete: boolean;

  // Driver State
  driverStatus: DriverStatus;
  isOnDuty: boolean;
  driverLocation: { lat: number; lng: number };

  // Data State
  orders: Order[];
  currentOrder: Order | null;
  history: Order[];
  earnings: number;
  lastCompletedOrder: Order | null;

  // 2. Nouveaux États
  vehicle: { model: string; plate: string; color: string } | null;
  documents: DriverDocument[];
  preferences: DriverPreferences;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setSplashComplete: (complete: boolean) => void;

  logout: () => void;
  setDriverStatus: (status: DriverStatus) => void;
  setIsOnDuty: (isOnDuty: boolean) => void;
  setDriverLocation: (location: { lat: number; lng: number }) => void;

  // Workflow Actions
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (status: Order['status']) => void;
  completeOrder: () => void;
  rejectOrder: (orderId: string) => void;
  triggerNewOrder: () => void;
  clearSummary: () => void;

  // Preferences Actions
  updatePreferences: (prefs: Partial<DriverPreferences>) => void;

  // 3. Nouvelles Actions (from User Request + existing updatePreferences)
  updatePreference: (key: keyof DriverPreferences, value: any) => void; // Keep simpler version for UI binding
  updateDocumentStatus: (docId: string, status: DriverDocument['status']) => void;
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

      // Initialisation Mockée (Updated)
      vehicle: { model: "Toyota Prius", plate: "AB-123-CD", color: "Gris Minéral" },
      documents: [
        { id: "1", name: "Permis de conduire", status: "verified", expiryDate: "2025-01-01" },
        { id: "2", name: "Carte VTC", status: "verified", expiryDate: "2024-12-15" },
        { id: "3", name: "Assurance RC Pro", status: "expired", expiryDate: "2023-11-20" },
        { id: "4", name: "Kbis", status: "pending" },
      ],
      preferences: {
        vehicleType: "car",
        navigationApp: "google_maps",
        soundEnabled: true,
        darkMode: false,
        autoAccept: false,
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

      // Update Action (Batch)
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),

      // Single Key Update Action
      updatePreference: (key, value) => set((state) => ({
        preferences: { ...state.preferences, [key]: value }
      })),

      updateDocumentStatus: (docId, status) => set((state) => ({
        documents: state.documents.map(d => d.id === docId ? { ...d, status } : d)
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
        preferences: state.preferences,
        documents: state.documents, // Add documents to persistence
        vehicle: state.vehicle // Add vehicle to persistence
      }),
    }
  )
);
