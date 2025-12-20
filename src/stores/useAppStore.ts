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
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSplashComplete: boolean;

  // Driver State
  driverStatus: DriverStatus;
  isOnDuty: boolean;
  driverLocation: { lat: number; lng: number };

  // Data State (Financial & History)
  orders: Order[];
  currentOrder: Order | null;
  history: Order[];
  earnings: number;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setSplashComplete: (complete: boolean) => void;

  logout: () => void;
  setDriverStatus: (status: DriverStatus) => void;
  setIsOnDuty: (isOnDuty: boolean) => void; // RESTORED
  setDriverLocation: (location: { lat: number; lng: number }) => void;

  // Workflow Actions
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (status: Order['status']) => void;
  completeOrder: () => void;
  rejectOrder: (orderId: string) => void;
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
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isSplashComplete: false,

      driverStatus: "offline",
      isOnDuty: false,
      driverLocation: { lat: 48.8566, lng: 2.3522 },

      orders: MOCK_ORDERS,
      currentOrder: null,
      history: [],
      earnings: 0,

      // Actions
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
        currentOrder: null,
      }),

      setDriverStatus: (status) => set({ driverStatus: status, isOnDuty: status === 'online' }),

      // RESTORED FUNCTION
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
          driverStatus: "online"
        };
      }),

      rejectOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(o => o.id !== orderId)
      })),
    }),
    {
      name: "one-connexion-store-v2",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        history: state.history,
        earnings: state.earnings,
        currentOrder: state.currentOrder
      }),
    }
  )
);
