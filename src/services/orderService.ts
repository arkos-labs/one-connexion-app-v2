import { supabase } from "../lib/supabase";
import { Order } from "../types";

export interface SupabaseOrder {
    id: string;
    status: string;
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    delivery_address: string;
    delivery_lat: number;
    delivery_lng: number;
    price: number;
    pickup_contact_name: string;
    created_at: string;
    delivered_at?: string;
    driver_id?: string;
    proof_type?: 'signature' | 'photo';
    proof_data?: string;
}

export const mapSupabaseToOrder = (so: SupabaseOrder): Order => {
    // Map Supabase status to App status
    console.log(`🔍 [mapSupabaseToOrder] Statut brut reçu:`, so.status, typeof so.status);

    let status: Order['status'] = 'cancelled'; // Par défaut
    if (so.status === 'driver_accepted') status = 'accepted';
    else if (so.status === 'arrived_pickup') status = 'arrived_pickup';
    else if (so.status === 'in_progress') status = 'in_progress';
    else if (so.status === 'delivered') status = 'completed';
    else if (so.status === 'cancelled') status = 'cancelled';
    else if (so.status === 'pending_acceptance' || so.status === 'dispatched') status = 'pending';
    else status = 'assigned'; // Statut neutre qui ne déclenche pas la modale

    return {
        id: so.id,
        pickupLocation: {
            lat: Number(so.pickup_lat),
            lng: Number(so.pickup_lng),
            address: so.pickup_address
        },
        dropoffLocation: {
            lat: Number(so.delivery_lat),
            lng: Number(so.delivery_lng),
            address: so.delivery_address
        },
        pickupAddress: so.pickup_address,
        dropoffAddress: so.delivery_address,
        clientName: so.pickup_contact_name || "Client Inconnu",
        price: Number(so.price),
        priceInCents: Math.round(Number(so.price) * 100),
        distance: "N/A",
        status,
        assignedDriverId: so.driver_id,
        createdAt: so.created_at || new Date().toISOString(),
        completedAt: so.delivered_at,
        paymentMethod: 'card', // Default for now
        proof: so.proof_type && so.proof_data ? {
            type: so.proof_type,
            dataUrl: so.proof_data,
            timestamp: so.delivered_at || new Date().toISOString()
        } : undefined
    };
};

export const orderService = {
    async fetchAvailableOrders(driverId?: string) {
        let query = supabase
            .from('orders')
            .select('*');

        if (driverId) {
            // STRICT DISPATCH MODE: Seules les commandes assignées spécifiquement à ce chauffeur
            query = query.or(`and(driver_id.eq.${driverId},status.in.(assigned,dispatched,pending_acceptance))`);
        } else {
            // Si pas d'ID chauffeur, on ne retourne rien par sécurité
            return [];
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data as SupabaseOrder[]).map(mapSupabaseToOrder);
    },

    async fetchDriverCurrentOrder(driverId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', driverId)
            .in('status', ['driver_accepted', 'arrived_pickup', 'in_progress'])
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
        return data ? mapSupabaseToOrder(data as SupabaseOrder) : null;
    },

    /**
     * Met à jour le statut d'une commande avec géolocalisation et timestamp
     * L'admin voit ces mises à jour en temps réel via Supabase Realtime
     */
    async updateStatus(orderId: string, status: string, additionalData: any = {}) {
        const timestamp = new Date().toISOString();

        // Préparer les données de mise à jour avec logs détaillés
        const updateData = {
            status,
            ...additionalData,
            updated_at: timestamp
        };

        console.log(`📡 [OrderService] Mise à jour commande ${orderId}:`, {
            status,
            timestamp,
            additionalData
        });

        try {
            const { data, error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                // RLS Fallback (Error 406, 401, 42501)
                if (error.code === '406' || error.code === '42501' || error.message?.includes('401') || error.message?.includes('Permission denied')) {
                    console.warn(`⚠️ [OrderService] Erreur permission RLS (${error.code}) sur updateStatus, tentative sans select...`);
                    const { error: retryError } = await supabase
                        .from('orders')
                        .update(updateData)
                        .eq('id', orderId);

                    if (retryError) throw retryError;

                    // Retourner un objet simulé
                    return {
                        id: orderId,
                        status,
                        ...additionalData,
                        updated_at: timestamp,
                        pickup_lat: 0, pickup_lng: 0, delivery_lat: 0, delivery_lng: 0
                    } as any;
                }
                throw error;
            }

            console.log(`✅ [OrderService] Commande ${orderId} mise à jour avec succès`);
            return mapSupabaseToOrder(data as SupabaseOrder);
        } catch (error) {
            console.error(`❌ [OrderService] Erreur updateStatus pour ${orderId}:`, error);
            throw error;
        }
    },

    /**
     * Met à jour le statut avec la position actuelle du chauffeur
     * Permet à l'admin de voir où se trouve le chauffeur à chaque étape
     */
    async updateStatusWithLocation(
        orderId: string,
        status: string,
        driverLocation: { lat: number; lng: number },
        additionalData: any = {}
    ) {
        const timestamp = new Date().toISOString();

        const updateData = {
            status,
            ...additionalData,
            updated_at: timestamp
        };

        console.log(`📍 [OrderService] Mise à jour avec localisation pour ${orderId}:`, {
            status,
            location: driverLocation,
            timestamp
        });
        console.log(`🔍 [OrderService] updateData complet:`, updateData);

        try {
            const { data, error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                // RLS Fallback
                if (error.code === '406' || error.code === '42501' || error.message?.includes('401') || error.message?.includes('Permission denied')) {
                    console.warn(`⚠️ [OrderService] Erreur permission RLS (${error.code}) sur update+loc, continuation sans select...`);
                    const { error: retryError } = await supabase
                        .from('orders')
                        .update(updateData)
                        .eq('id', orderId);

                    if (retryError) throw retryError;

                    // Retourner un objet simulé cohérent
                    return {
                        id: orderId,
                        status,
                        ...updateData,
                        pickup_lat: 0, pickup_lng: 0, delivery_lat: 0, delivery_lng: 0 // Champs techniques requis par map
                    } as any;
                }
                throw error;
            }

            console.log(`🔍 [OrderService] Data brute retournée par Supabase:`, data);
            console.log(`🔍 [OrderService] Type de data:`, typeof data, Array.isArray(data));
            console.log(`✅ [OrderService] Position chauffeur mise à jour pour commande ${orderId}`);
            return mapSupabaseToOrder(data as SupabaseOrder);
        } catch (error) {
            console.error(`❌ [OrderService] Erreur mise à jour avec localisation:`, error);
            throw error;
        }
    },

    subscribeToOrders(callback: (order: Order) => void) {
        console.log('🔔 [OrderService] Abonnement aux nouvelles commandes...');

        // Blacklist locale pour éviter le spam après refus
        const refusedOrders = new Map<string, number>(); // orderId -> timestamp du refus
        const REFUSAL_COOLDOWN = 5 * 60 * 1000; // 5 minutes

        return supabase
            .channel('orders_channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                // On enlève le filtre status=eq.pending_acceptance pour recevoir AUSSI les commandes 'assigned'
            }, (payload) => {
                const newOrder = mapSupabaseToOrder(payload.new as SupabaseOrder);

                // Vérifier si cette commande est en blacklist
                const refusalTime = refusedOrders.get(newOrder.id);
                if (refusalTime) {
                    const elapsed = Date.now() - refusalTime;
                    if (elapsed < REFUSAL_COOLDOWN) {
                        console.log(`🚫 [OrderService] Commande ${newOrder.id} ignorée (refusée il y a ${Math.round(elapsed / 1000)}s)`);
                        return; // Ignorer cette commande
                    } else {
                        // Cooldown expiré, retirer de la blacklist
                        refusedOrders.delete(newOrder.id);
                    }
                }

                console.log('📥 [OrderService] Nouvelle commande reçue:', payload.new);
                callback(newOrder);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                const updatedOrder = mapSupabaseToOrder(payload.new as SupabaseOrder);

                // Note: La blacklist est maintenant gérée dans orderSlice.ts

                // Vérifier si cette commande est en blacklist
                const refusalTime = refusedOrders.get(updatedOrder.id);
                if (refusalTime) {
                    const elapsed = Date.now() - refusalTime;
                    if (elapsed < REFUSAL_COOLDOWN) {
                        console.log(`🚫 [OrderService] Mise à jour ignorée pour commande ${updatedOrder.id} (refusée il y a ${Math.round(elapsed / 1000)}s)`);
                        return; // Ignorer cette mise à jour
                    } else {
                        // Cooldown expiré, retirer de la blacklist
                        refusedOrders.delete(updatedOrder.id);
                    }
                }

                console.log('🔄 [OrderService] Commande mise à jour:', payload.new);
                callback(updatedOrder);
            })
            .subscribe((status) => {
                console.log('📡 [OrderService] Statut abonnement Realtime:', status);
            });
    },

    /**
     * Rejette l'assignation d'une commande
     * La remet dans le pool ou notifie l'admin
     */
    async rejectOrderAssignment(orderId: string, driverId: string) {
        console.log(`🚫 [OrderService] Rejet de la commande ${orderId} par le chauffeur ${driverId}`);

        // Utiliser la fonction RPC qui bypass RLS de manière sécurisée
        const { data, error } = await supabase
            .rpc('refuse_order', { order_id_param: orderId });

        if (error) {
            console.error(`❌ [OrderService] Erreur rejet commande:`, error);
            throw error;
        }

        // Créer un événement de refus pour l'admin
        try {
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'driver_declined',
                    description: `Course refusée par le chauffeur`,
                    actor_type: 'driver',
                    actor_id: driverId,
                    metadata: {
                        refused_at: new Date().toISOString(),
                    }
                });
        } catch (eventError) {
            console.warn('⚠️ [OrderService] Impossible de créer l\'événement de refus:', eventError);
        }

        console.log(`✅ [OrderService] Commande rejetée avec succès via RPC`);

        // Convertir le résultat JSON en Order
        return {
            id: data.id,
            reference: data.reference,
            status: data.status,
            assignedDriverId: data.driver_id
        } as any; // Simplification pour le retour
    }
};
