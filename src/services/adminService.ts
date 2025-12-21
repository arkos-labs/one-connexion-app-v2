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
                id,
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
    },

    /**
     * Get all orders that are not delivered or cancelled
     */
    async fetchAllActiveOrders() {
        // Fetch orders and join with drivers to get the name of the assigned chauffeur
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                drivers(id, first_name, last_name, email)
            `)
            .not('status', 'in', '("delivered","cancelled")')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Flatten the driver data for easier UI consumption if needed
        return data.map((order: any) => ({
            ...order,
            driver_first_name: order.drivers?.first_name,
            driver_last_name: order.drivers?.last_name,
            driver_email: order.drivers?.email
        }));
    }
};
