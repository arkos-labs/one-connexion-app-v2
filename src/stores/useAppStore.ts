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
    dropoffLocation: { lat: 48.8606, lng: 2.3376, address: "Louvre Museum, Paris" },
    price: 15.50,
    distance: "2.5 km",
    status: "pending"
  },
  {
    id: "2",
    clientName: "Jean Martin",
    pickupLocation: { lat: 48.8584, lng: 2.2945, address: "Eiffel Tower, Paris" },
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
      isSplashComplete: false,

      orders: MOCK_ORDERS,
      currentOrder: null,
      earnings: 0,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setDriverStatus: (driverStatus) => set({ driverStatus }),

      setIsOnDuty: (isOnDuty) =>
        set({
          isOnDuty,
          driverStatus: isOnDuty ? "online" : "offline",
        }),

      setSplashComplete: (isSplashComplete) => set({ isSplashComplete }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          driverStatus: "offline",
          isOnDuty: false,
          orders: MOCK_ORDERS, // Reset to mock data for demo purposes on logout? Or clear? 
          // Usually clear, but to keep "initial state" consistent with "Initialise with mock" instruction:
          currentOrder: null,
          earnings: 0,
        }),

      // Workflow Actions Implementation
      acceptOrder: (orderId) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return state; // No change if order not found

          const acceptedOrder = { ...order, status: "accepted" as const };

          return {
            currentOrder: acceptedOrder,
            orders: state.orders.filter((o) => o.id !== orderId),
            driverStatus: "busy", // Driver is now busy
          };
        }),

      updateOrderStatus: (status) =>
        set((state) => ({
          currentOrder: state.currentOrder
            ? { ...state.currentOrder, status }
            : null,
        })),

      completeOrder: () =>
        set((state) => {
          if (!state.currentOrder) return state;

          // In a real app, we might add to a history array.
          // Here we just update earnings and clear currentOrder.
          return {
            earnings: state.earnings + state.currentOrder.price,
            currentOrder: null,
            driverStatus: "online", // Driver is available again
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
        // Persist workflow state if needed, but maybe not mocks?
        // Let's stick to what was there unless requested. 
        // Logic suggests currentOrder might be good to persist in case of reload.
        currentOrder: state.currentOrder,
        earnings: state.earnings,
      }),
    }
  )
);
