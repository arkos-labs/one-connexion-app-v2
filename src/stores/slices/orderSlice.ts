import { StateCreator } from "zustand";
import Decimal from "decimal.js";
import { Order } from "../../types";
import { AppStore, OrderSlice } from "../types";

/**
 * OrderSlice - Manages orders, earnings, and order lifecycle
 * 
 * CRITICAL SECURITY:
 * - This slice is NEVER persisted to avoid "ghost orders" after app restart
 * - Prices are stored in cents (integers) to avoid floating-point errors
 * - All price calculations use Decimal.js for precision
 */
export const createOrderSlice: StateCreator<
    AppStore,
    [],
    [],
    OrderSlice
> = (set, get) => ({
    // Order state (NEVER persisted)
    orders: [],
    currentOrder: null,
    history: [],
    earningsInCents: 0, // Store as cents (int) to avoid 0.1 + 0.2 = 0.30000000000000004
    lastCompletedOrder: null,

    // Actions
    acceptOrder: (orderId) => set((state) => {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) {
            console.warn(`Order ${orderId} not found`);
            return state;
        }

        return {
            currentOrder: { ...order, status: "accepted" as const },
            orders: state.orders.filter(o => o.id !== orderId),
            // Keep driver online when accepting order
            driverStatus: "busy" as const,
        };
    }),

    updateOrderStatus: (status) => set((state) => {
        if (!state.currentOrder) {
            console.warn("No current order to update");
            return state;
        }

        return {
            currentOrder: { ...state.currentOrder, status }
        };
    }),

    completeOrder: () => set((state) => {
        if (!state.currentOrder) {
            console.warn("No current order to complete");
            return state;
        }

        const completedOrder: Order = {
            ...state.currentOrder,
            status: 'completed',
            completedAt: new Date().toISOString()
        };

        // Use Decimal.js for precise price calculation
        const priceInCents = new Decimal(state.currentOrder.price)
            .times(100)
            .toDecimalPlaces(0)
            .toNumber();

        const newEarningsInCents = new Decimal(state.earningsInCents)
            .plus(priceInCents)
            .toNumber();

        return {
            earningsInCents: newEarningsInCents,
            history: [completedOrder, ...state.history],
            currentOrder: null,
            driverStatus: "online" as const,
            lastCompletedOrder: completedOrder
        };
    }),

    clearSummary: () => set({ lastCompletedOrder: null }),

    rejectOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(o => o.id !== orderId)
    })),

    triggerNewOrder: () => set((state) => {
        const id = Math.random().toString(36).substring(2, 11);
        const lat = 48.8566 + (Math.random() - 0.5) * 0.05;
        const lng = 2.3522 + (Math.random() - 0.5) * 0.05;

        // Generate random price using Decimal.js for precision
        const randomPrice = new Decimal(Math.random())
            .times(30)
            .plus(10)
            .toDecimalPlaces(2)
            .toNumber();

        const newOrder: Order = {
            id,
            clientName: `Client #${Math.floor(Math.random() * 1000)}`,
            pickupLocation: {
                lat,
                lng,
                address: "Nouvelle Adresse, Paris"
            },
            dropoffLocation: {
                lat: lat + 0.01,
                lng: lng + 0.01,
                address: "Destination, Paris"
            },
            price: randomPrice,
            distance: "3.5 km",
            status: "pending"
        };

        return {
            orders: [...state.orders, newOrder]
        };
    }),

    // Computed getter - converts cents back to euros
    getEarnings: () => {
        const state = get();
        return new Decimal(state.earningsInCents)
            .dividedBy(100)
            .toDecimalPlaces(2)
            .toNumber();
    },
});
