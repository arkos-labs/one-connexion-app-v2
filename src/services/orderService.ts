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
    let status: Order['status'] = 'pending';
    if (so.status === 'driver_accepted') status = 'accepted';
    else if (so.status === 'arrived_pickup') status = 'arrived_pickup';
    else if (so.status === 'in_progress') status = 'in_progress';
    else if (so.status === 'delivered') status = 'completed';
    else if (so.status === 'cancelled') status = 'cancelled';
    else if (so.status === 'assigned' || so.status === 'pending_acceptance') status = 'pending';

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
            // Si un ID chauffeur est fourni, on cherche :
            // 1. Les commandes SANS chauffeur (pending_acceptance)
            // 2. OU les commandes assignées à CE chauffeur (status=assigned/pending_acceptance)
            query = query.or(`and(status.eq.pending_acceptance,driver_id.is.null),and(driver_id.eq.${driverId},status.in.(assigned,pending_acceptance))`);
        } else {
            // Sinon comportement par défaut (seulement les sans chauffeur)
            query = query
                .or('status.eq.pending_acceptance,status.eq.assigned')
                .is('driver_id', null);
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
            .in('status', ['driver_accepted', 'in_progress'])
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

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error(`❌ [OrderService] Erreur mise à jour commande ${orderId}:`, error);
            throw error;
        }

        console.log(`✅ [OrderService] Commande ${orderId} mise à jour avec succès`);
        return mapSupabaseToOrder(data as SupabaseOrder);
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
            driver_current_lat: driverLocation.lat,
            driver_current_lng: driverLocation.lng,
            updated_at: timestamp
        };

        console.log(`📍 [OrderService] Mise à jour avec localisation pour ${orderId}:`, {
            status,
            location: driverLocation,
            timestamp
        });

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error(`❌ [OrderService] Erreur mise à jour avec localisation:`, error);
            throw error;
        }

        console.log(`✅ [OrderService] Position chauffeur mise à jour pour commande ${orderId}`);
        return mapSupabaseToOrder(data as SupabaseOrder);
    },

    subscribeToOrders(callback: (order: Order) => void) {
        console.log('🔔 [OrderService] Abonnement aux nouvelles commandes...');

        return supabase
            .channel('orders_channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                // On enlève le filtre status=eq.pending_acceptance pour recevoir AUSSI les commandes 'assigned'
            }, (payload) => {
                console.log('📥 [OrderService] Nouvelle commande reçue:', payload.new);
                callback(mapSupabaseToOrder(payload.new as SupabaseOrder));
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                console.log('🔄 [OrderService] Commande mise à jour:', payload.new);
                callback(mapSupabaseToOrder(payload.new as SupabaseOrder));
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

        const { data, error } = await supabase
            .from('orders')
            .update({
                driver_id: null,
                status: 'pending_acceptance', // Retour au pool ou statut spécifique 'rejected_by_driver'
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error(`❌ [OrderService] Erreur rejet commande:`, error);
            throw error;
        }

        console.log(`✅ [OrderService] Commande rejetée avec succès`);
        return mapSupabaseToOrder(data as SupabaseOrder);
    }
};
