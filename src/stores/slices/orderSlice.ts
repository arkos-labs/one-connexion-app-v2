import { StateCreator } from "zustand";
import Decimal from "decimal.js";
import { Order } from "../../types";
import { AppStore, OrderSlice } from "../types";
import { orderService, mapSupabaseToOrder } from "../../services/orderService";
import { driverService } from "../../services/driverService";
import { supabase } from "../../lib/supabase";

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
    refusedOrderIds: [], // Blacklist des commandes refusées

    // Actions
    initializeOrders: async () => {
        const { user } = get();
        if (!user) return;

        try {
            console.log(`📡 [OrderSlice] Initialisation pour l'utilisateur: ${user.id}`);
            const [availableOrders, currentOrder, driverProfile] = await Promise.all([
                orderService.fetchAvailableOrders(user.id),
                orderService.fetchDriverCurrentOrder(user.id),
                driverService.getDriverProfile(user.id).catch(e => {
                    console.warn("⚠️ Impossible de récupérer le profil chauffeur, utilisation des défauts", e);
                    return null;
                })
            ]);

            console.log(`📦 [OrderSlice] Initialisé:`, {
                offresDispo: availableOrders.length,
                missionActive: currentOrder?.id || 'Aucune',
                dbStatus: driverProfile?.status || 'unknown'
            });

            // Déterminer le statut correct
            let newStatus = driverProfile?.status || 'offline';
            let newIsOnDuty = driverProfile?.is_online || false;

            // Si une commande est active, on force le statut 'busy' et 'isOnDuty'
            if (currentOrder) {
                newStatus = 'busy';
                newIsOnDuty = true;
            }

            set({
                orders: availableOrders,
                currentOrder: currentOrder,
                driverStatus: newStatus as any, // Cast nécessaire si le typage TS strict rale un peu
                isOnDuty: newIsOnDuty,
                isLoading: false
            });
        } catch (error) {
            console.error("❌ [OrderSlice] Échec initialisation:", error);
            set({ isLoading: false });
        }
    },

    subscribeToNewOrders: () => {
        const { user } = get();
        if (!user) return () => { };

        const subscription = orderService.subscribeToOrders((order) => {
            const state = get();
            const { user, refusedOrderIds } = state;
            if (!user) return;

            // 🚫 BLACKLIST: Ignorer les commandes refusées par ce chauffeur
            if (refusedOrderIds && refusedOrderIds.includes(order.id)) {
                console.log(`🚫 [OrderSlice] Commande ${order.id} ignorée (refusée précédemment par ce chauffeur)`);
                return;
            }

            const isForMe = order.assignedDriverId === user.id;
            const isUnassigned = !order.assignedDriverId;

            console.log(`🔔 [OrderSlice] Signal reçu pour commande ${order.id}:`, {
                status: order.status,
                isForMe,
                isUnassigned,
                assignedTo: order.assignedDriverId,
                me: user.id
            });

            // --- 1. GESTION DE LA MISSION ACTIVE ---
            const activeStatuses = ['accepted', 'arrived_pickup', 'in_progress'];
            if (isForMe && activeStatuses.includes(order.status)) {
                console.log(`🚀 [OrderSlice] Transition vers mission active: ${order.id}`);
                set(prev => ({
                    currentOrder: order,
                    driverStatus: 'busy',
                    orders: prev.orders.filter(o => o.id !== order.id)
                }));
                return;
            }

            // --- 2. GESTION DES OFFRES (Modale) ---
            if (order.status === 'pending') {
                if (isUnassigned || isForMe) {
                    // Si c'est déjà notre mission active, on ne l'ajoute pas aux offres
                    if (state.currentOrder?.id === order.id) return;

                    set((prev) => {
                        const existing = prev.orders.find(o => o.id === order.id);
                        // OPTIMISATION : Ne pas mettre à jour si l'ordre est identique (statut et assignation)
                        if (existing &&
                            existing.status === order.status &&
                            existing.assignedDriverId === order.assignedDriverId) {
                            return prev;
                        }

                        const others = prev.orders.filter(o => o.id !== order.id);
                        console.log(`📥 [OrderSlice] Offre mise à jour: ${order.id} (Assignée: ${isForMe ? 'OUI' : 'NON'})`);
                        return { orders: [...others, order] };
                    });
                } else {
                    // Assignée à quelqu'un d'autre -> On s'assure qu'elle n'est pas dans nos offres
                    if (state.orders.some(o => o.id === order.id)) {
                        console.log(`🚫 [OrderSlice] Retrait offre ${order.id} (assignée à autrui)`);
                        set(prev => ({ orders: prev.orders.filter(o => o.id !== order.id) }));
                    }
                }
                return;
            }

            // --- 3. GESTION DES ANNULATIONS / FINALISATIONS / NETTOYAGE ---
            if (['completed', 'cancelled', 'expired'].includes(order.status)) {
                console.log(`🏁 [OrderSlice] Terminaison: ${order.id} (${order.status})`);
                set(prev => ({
                    orders: prev.orders.filter(o => o.id !== order.id),
                    currentOrder: prev.currentOrder?.id === order.id ? null : prev.currentOrder,
                    driverStatus: prev.currentOrder?.id === order.id ? 'online' : prev.driverStatus
                }));
                return;
            }

            // --- 4. NETTOYAGE GÉNÉRIQUE ---
            // Si on arrive ici, l'ordre n'est ni en mission active (block 1) ni en offre (block 2)
            // On s'assure qu'il disparait des offres.
            if (state.orders.some(o => o.id === order.id)) {
                console.log(`🧹 [OrderSlice] Nettoyage offre ${order.id} (nouveau statut: ${order.status})`);
                set(prev => ({ orders: prev.orders.filter(o => o.id !== order.id) }));
            }
        });

        return () => subscription.unsubscribe();
    },

    acceptOrder: async (orderId) => {
        const { user, setDriverStatus, driverLocation } = get();
        if (!user) return;

        try {
            console.log(`🚗 [OrderSlice] Acceptation de la commande ${orderId}`);

            // UPDATE direct avec RLS permissif
            const { data, error } = await supabase
                .from('orders')
                .update({
                    status: 'driver_accepted',
                    accepted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                console.error("❌ [OrderSlice] Erreur UPDATE accept:", error);
                throw error;
            }

            console.log(`✅ [OrderSlice] Commande acceptée:`, data);

            const updatedOrder = mapSupabaseToOrder(data as any);

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

    updateOrderStatus: async (orderId, status) => {
        const { currentOrder, driverLocation } = get();
        if (!currentOrder) return;

        try {
            let sbStatus = status as string;
            if (status === 'accepted') sbStatus = 'driver_accepted';
            if (status === 'completed') sbStatus = 'delivered';

            console.log(`📝 [OrderSlice] Mise à jour statut pour ${orderId}: ${status} -> ${sbStatus}`);

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

            console.log(`🔍 [OrderSlice] Commande mise à jour reçue:`, {
                id: updatedOrder.id,
                status: updatedOrder.status,
                hasAllFields: !!(updatedOrder.pickupLocation && updatedOrder.dropoffLocation)
            });

            set({ currentOrder: updatedOrder });
            console.log(`✅ [OrderSlice] Statut mis à jour, admin notifié`);
            console.log(`🔍 [OrderSlice] currentOrder après mise à jour:`, get().currentOrder);
        } catch (error) {
            console.error("❌ [OrderSlice] Échec mise à jour statut:", error);
        }
    },

    completeOrder: async (proof) => {
        const { currentOrder, earningsInCents, history, setDriverStatus, driverLocation } = get();
        if (!currentOrder) return;

        try {
            console.log(`🎯 [OrderSlice] Finalisation de la commande ${currentOrder.id}`);
            console.log(`📍 [OrderSlice] Position actuelle:`, driverLocation);
            console.log(`📸 [OrderSlice] Preuve:`, proof);

            // Mise à jour avec géolocalisation de livraison + preuve
            console.log(`🔄 [OrderSlice] Appel updateStatusWithLocation...`);
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
            console.log(`✅ [OrderSlice] updateStatusWithLocation terminé:`, updatedOrder);

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

            // 🚫 BLACKLIST: Ajouter à la liste des refus pour éviter le spam
            set((state) => ({
                orders: state.orders.filter(o => o.id !== orderId),
                refusedOrderIds: [...state.refusedOrderIds, orderId]
            }));

            console.log(`🚫 [OrderSlice] Commande ${orderId} ajoutée à la blacklist locale`);

            // Update server
            await orderService.rejectOrderAssignment(orderId, user.id);

            // Revenir en ligne
            get().setDriverStatus("online");

            console.log(`✅ [OrderSlice] Commande refusée sur le serveur et chauffeur remis en ligne`);
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
