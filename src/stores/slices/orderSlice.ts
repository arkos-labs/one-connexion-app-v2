import { StateCreator } from "zustand";
import Decimal from "decimal.js";
import { Order } from "../../types";
import { AppStore, OrderSlice } from "../types";
import { orderService } from "../../services/orderService";

/**
 * OrderSlice - Manages orders, earnings, and order lifecycle
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
    earningsInCents: 0,
    lastCompletedOrder: null,

    // Actions
    initializeOrders: async () => {
        const { user } = get();
        if (!user) return;

        try {
            const [availableOrders, currentOrder] = await Promise.all([
                orderService.fetchAvailableOrders(user.id),
                orderService.fetchDriverCurrentOrder(user.id)
            ]);

            set({
                orders: availableOrders,
                currentOrder: currentOrder,
                driverStatus: currentOrder ? "busy" : "online"
            });
        } catch (error) {
            console.error("Failed to initialize orders:", error);
        }
    },

    subscribeToNewOrders: () => {
        const { user } = get();
        if (!user) return () => { };

        const subscription = orderService.subscribeToOrders((order) => {
            const state = get();

            // 1. Is this order relevant to us? (Assigned to us OR Unassigned pool)
            const isForMe = order.assignedDriverId === user.id;
            const isUnassigned = !order.assignedDriverId;

            // If assigned to someone else, remove it from our list if present
            if (!isForMe && !isUnassigned) {
                if (state.orders.some(o => o.id === order.id)) {
                    set({ orders: state.orders.filter(o => o.id !== order.id) });
                }
                return;
            }

            // 2. Handle Active Order Updates (accepted/in_progress/completed)
            // If I am the assigned driver, these updates affect my currentOrder
            if (isForMe && ['accepted', 'in_progress', 'completed'].includes(order.status)) {
                if (state.currentOrder?.id === order.id) {
                    set({ currentOrder: order });
                    // Ensure it's not in the pending list
                    set(prev => ({ orders: prev.orders.filter(o => o.id !== order.id) }));
                } else if (!state.currentOrder && order.status === 'accepted') {
                    // Case: Accepted on another device or missed state transition
                    set({ currentOrder: order, driverStatus: 'busy', orders: state.orders.filter(o => o.id !== order.id) });
                }
                return;
            }

            // 3. Handle Pending Offers (Assigned or Pool)
            // Note: 'assigned' status in DB is mapped to 'pending' in App by mapSupabaseToOrder
            if (order.status === 'pending') {
                set((prev) => {
                    const exists = prev.orders.some(o => o.id === order.id);
                    if (exists) {
                        // UPDATE existing order (e.g. details changed, or status changed from pool to assigned)
                        console.log(`🔄 [OrderSlice] Mise à jour commande existante ${order.id}`);
                        return {
                            orders: prev.orders.map(o => o.id === order.id ? order : o)
                        };
                    } else {
                        // INSERT new order
                        console.log(`📥 [OrderSlice] Ajout nouvelle commande ${order.id}`);
                        return {
                            orders: [...prev.orders, order]
                        };
                    }
                });
            }

            // 4. Handle Cancellations
            if (order.status === 'cancelled') {
                console.log(`🚫 [OrderSlice] Commande annulée ${order.id}`);
                set(prev => ({
                    orders: prev.orders.filter(o => o.id !== order.id),
                    currentOrder: prev.currentOrder?.id === order.id ? null : prev.currentOrder,
                    driverStatus: prev.currentOrder?.id === order.id ? 'online' : prev.driverStatus
                }));
            }
        });

        return () => subscription.unsubscribe();
    },

    acceptOrder: async (orderId) => {
        const { user, setDriverStatus, driverLocation } = get();
        if (!user) return;

        try {
            console.log(`🚗 [OrderSlice] Acceptation de la commande ${orderId}`);

            // Mise à jour avec la position actuelle du chauffeur
            const updatedOrder = await orderService.updateStatusWithLocation(
                orderId,
                'driver_accepted',
                driverLocation,
                {
                    driver_id: user.id,
                    accepted_at: new Date().toISOString()
                }
            );

            // Update status to busy (this will also keep isOnDuty = true)
            setDriverStatus("busy");

            set((state) => ({
                currentOrder: updatedOrder,
                orders: state.orders.filter(o => o.id !== orderId)
            }));

            console.log(`✅ [OrderSlice] Commande acceptée, admin notifié en temps réel`);
        } catch (error) {
            console.error("❌ [OrderSlice] Échec acceptation commande:", error);
        }
    },

    updateOrderStatus: async (status) => {
        const { currentOrder, driverLocation } = get();
        if (!currentOrder) return;

        try {
            let sbStatus = status as string;
            if (status === 'accepted') sbStatus = 'driver_accepted';
            if (status === 'completed') sbStatus = 'delivered';

            console.log(`📝 [OrderSlice] Mise à jour statut: ${status} -> ${sbStatus}`);

            // Déterminer les données additionnelles selon le statut
            const additionalData: any = {};

            if (status === 'in_progress') {
                // Le chauffeur a récupéré le colis
                additionalData.picked_up_at = new Date().toISOString();
                console.log(`📦 [OrderSlice] Colis récupéré à ${new Date().toLocaleTimeString()}`);
            } else if (status === 'arrived_pickup') {
                // Le chauffeur est arrivé au point de retrait
                additionalData.arrived_pickup_at = new Date().toISOString();
                console.log(`📍 [OrderSlice] Arrivé au point de retrait à ${new Date().toLocaleTimeString()}`);
            }

            // Mise à jour avec géolocalisation pour traçabilité
            const updatedOrder = await orderService.updateStatusWithLocation(
                currentOrder.id,
                sbStatus,
                driverLocation,
                additionalData
            );

            set({ currentOrder: updatedOrder });
            console.log(`✅ [OrderSlice] Statut mis à jour, admin notifié`);
        } catch (error) {
            console.error("❌ [OrderSlice] Échec mise à jour statut:", error);
        }
    },

    completeOrder: async (proof) => {
        const { currentOrder, earningsInCents, history, setDriverStatus, driverLocation } = get();
        if (!currentOrder) return;

        try {
            console.log(`🎯 [OrderSlice] Finalisation de la commande ${currentOrder.id}`);

            // Mise à jour avec géolocalisation de livraison + preuve
            const updatedOrder = await orderService.updateStatusWithLocation(
                currentOrder.id,
                'delivered',
                driverLocation,
                {
                    delivered_at: new Date().toISOString(),
                    proof_type: proof?.type,
                    proof_data: proof?.dataUrl
                }
            );

            // Fill local proof if returned or manually
            if (proof) {
                updatedOrder.proof = proof;
            }

            // Règle des 40% : Le chauffeur touche 40% du prix total
            const driverShare = new Decimal(currentOrder.price).times(0.40);

            const priceInCents = driverShare
                .times(100)
                .toDecimalPlaces(0)
                .toNumber();

            const newEarningsInCents = new Decimal(earningsInCents)
                .plus(priceInCents)
                .toNumber();

            console.log(`💰 [OrderSlice] Gains chauffeur: +${(priceInCents / 100).toFixed(2)}€ (40% de ${currentOrder.price}€)`);

            // Set status back to online (this will keep isOnDuty = true)
            setDriverStatus("online");

            set({
                earningsInCents: newEarningsInCents,
                history: [updatedOrder, ...history],
                currentOrder: null,
                lastCompletedOrder: updatedOrder
            });

            console.log(`✅ [OrderSlice] Commande livrée avec succès, admin notifié`);
        } catch (error) {
            console.error("❌ [OrderSlice] Échec finalisation commande:", error);
        }
    },

    clearSummary: () => set({ lastCompletedOrder: null }),

    rejectOrder: async (orderId) => {
        const { user } = get();
        if (!user) return;

        try {
            console.log(`👎 [OrderSlice] Refus de la commande ${orderId}`);

            // Remove locally first for immediate UI feedback
            set((state) => ({
                orders: state.orders.filter(o => o.id !== orderId)
            }));

            // Update server
            await orderService.rejectOrderAssignment(orderId, user.id);

            console.log(`✅ [OrderSlice] Commande refusée sur le serveur`);
        } catch (error) {
            console.error("❌ [OrderSlice] Échec refus commande:", error);
            // Optionally revert local state if needed, but for now we prioritize UI responsiveness
        }
    },

    triggerNewOrder: () => {
        const id = Math.random().toString(36).substring(2, 11);
        const newOrder: Order = {
            id,
            clientName: "Jean Dupont",
            pickupLocation: { lat: 48.8566, lng: 2.3522, address: "12 Rue de la Paix, Paris" },
            dropoffLocation: { lat: 48.8666, lng: 2.3622, address: "45 Avenue Montaigne, Paris" },
            pickupAddress: "12 Rue de la Paix, Paris",
            dropoffAddress: "45 Avenue Montaigne, Paris",
            price: 25.50,
            priceInCents: 2550,
            distance: "3.2 km",
            status: "pending",
            createdAt: new Date().toISOString(),
            paymentMethod: 'card'
        };
        set(state => ({ orders: [...state.orders, newOrder] }));
    },

    getEarnings: () => {
        const state = get();
        return new Decimal(state.earningsInCents)
            .dividedBy(100)
            .toDecimalPlaces(2)
            .toNumber();
    },
});
