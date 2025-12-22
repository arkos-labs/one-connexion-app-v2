import { supabase } from "../lib/supabase";

export const driverService = {
    /**
     * Update driver availability and online status
     */
    async updateStatus(userId: string, isOnline: boolean, status: string = 'online') {
        const { error } = await supabase
            .from('drivers')
            .update({
                is_online: isOnline,
                status: isOnline ? status : 'offline',
                availability_status: isOnline ? (status === 'busy' ? 'busy' : 'available') : 'unavailable',
                last_location_update: new Date().toISOString()
            })
            .eq('user_id', userId); // Changé id par user_id pour matcher avec auth.uid()

        if (error) {
            console.error("Error updating driver status:", error);
            throw error;
        }
    },

    /**
     * Update driver's real-time position and log it to the tracking table
     */
    async updateLocation(userId: string, lat: number, lng: number, orderId?: string | number) {
        try {
            // 1. Update the latest position in the drivers table (summary)
            const { error: driverError } = await supabase
                .from('drivers')
                .update({
                    current_lat: lat,
                    current_lng: lng,
                    last_location_update: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (driverError) {
                console.error("Error updating driver summary location:", driverError);
            }

            // 2. Insert into the driver_locations table (granular real-time tracking)
            // This table is optimized for Realtime and history
            const { error: locationError } = await supabase
                .from('driver_locations')
                .insert({
                    driver_id: userId,
                    latitude: lat,
                    longitude: lng,
                    order_id: orderId || null
                });

            if (locationError) {
                console.error("Error logging to driver_locations:", locationError);
            }
        } catch (error) {
            console.error("CRITICAL: Error in updateLocation service:", error);
        }
    },

    /**
     * Fetch driver profile and status
     */
    async getDriverProfile(userId: string) {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    }
};
