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
            .eq('id', userId); // Changé user_id par id (PK)

        if (error) {
            console.error("Error updating driver status:", error);
            throw error;
        }
    },

    /**
     * Update driver's real-time position
     */
    async updateLocation(userId: string, lat: number, lng: number) {
        const { error } = await supabase
            .from('drivers')
            .update({
                current_lat: lat,
                current_lng: lng,
                last_location_update: new Date().toISOString()
            })
            .eq('id', userId); // Changé user_id par id

        if (error) {
            console.error("Error updating driver location:", error);
        }
    }
};
