import { supabase } from "../lib/supabase";

export const adminService = {
    /**
     * Get real-time stats for the dashboard
     */
    async getDashboardStats() {
        const [
            { count: onlineDriversCount },
            { count: activeOrdersCount },
            { count: pendingOrdersCount }
        ] = await Promise.all([
            // 1. Chauffeurs en ligne
            supabase
                .from('drivers')
                .select('*', { count: 'exact', head: true })
                .eq('is_online', true),

            // 2. Courses en cours
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['driver_accepted', 'in_progress']),

            // 3. Courses en attente
            supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['pending', 'pending_acceptance', 'assigned'])
        ]);

        return {
            onlineDrivers: onlineDriversCount || 0,
            activeOrders: activeOrdersCount || 0,
            pendingOrders: pendingOrdersCount || 0
        };
    },

    /**
     * Get list of all drivers and their current status/location
     */
    async getDriversStatus() {
        const { data, error } = await supabase
            .from('drivers')
            .select(`
                user_id,
                email,
                first_name,
                last_name,
                is_online,
                status,
                availability_status,
                current_lat,
                current_lng,
                last_location_update
            `)
            .order('last_location_update', { ascending: false });

        if (error) throw error;
        return data;
    }
};
