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

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Driver State
  driverStatus: DriverStatus;
  isOnDuty: boolean;
  driverLocation: { lat: number; lng: number }; // NEW

  // Driver Workflow State
  orders: Order[];
  currentOrder: Order | null;
  earnings: number;

  // UI State
  isSplashComplete: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setDriverStatus: (status: DriverStatus) => void;
  setIsOnDuty: (onDuty: boolean) => void;
  setDriverLocation: (location: { lat: number; lng: number }) => void; // NEW
  setSplashComplete: (complete: boolean) => void;
  logout: () => void;

  // Workflow Actions
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (status: Order['status']) => void;
  completeOrder: () => void;
  rejectOrder: (orderId: string) => void;
}

// Mock Data
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
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      driverStatus: "offline",
      isOnDuty: false,
      driverLocation: { lat: 48.8566, lng: 2.3522 }, // Default: Paris Châtelet
      isSplashComplete: false,

      orders: MOCK_ORDERS,
      currentOrder: null,
      earnings: 0,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setDriverStatus: (driverStatus) => set({ driverStatus }),
      setIsOnDuty: (isOnDuty) => set({ isOnDuty, driverStatus: isOnDuty ? "online" : "offline" }),
      setDriverLocation: (location) => set({ driverLocation: location }),
      setSplashComplete: (isSplashComplete) => set({ isSplashComplete }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          driverStatus: "offline",
          isOnDuty: false,
          orders: MOCK_ORDERS,
          currentOrder: null,
          earnings: 0,
        }),

      // Workflow Actions
      acceptOrder: (orderId) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return state;
          return {
            currentOrder: { ...order, status: "accepted" },
            orders: state.orders.filter((o) => o.id !== orderId),
            driverStatus: "busy",
          };
        }),

      updateOrderStatus: (status) =>
        set((state) => ({
          currentOrder: state.currentOrder ? { ...state.currentOrder, status } : null,
        })),

      completeOrder: () =>
        set((state) => {
          if (!state.currentOrder) return state;
          return {
            earnings: state.earnings + state.currentOrder.price,
            currentOrder: null,
            driverStatus: "online",
          };
        }),

      rejectOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        })),
    }),
    {
      name: "one-connexion-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentOrder: state.currentOrder,
        earnings: state.earnings,
      }),
    }
  )
);
