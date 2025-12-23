
const LOCATIONIQ_API_KEY = "pk.cc49323fc6339e614aec809f78bc7db4"; // Should ideally be in env vars

export interface Coordinates {
    lat: number;
    lng: number;
}

export const locationService = {
    async geocodeAddress(address: string): Promise<Coordinates | null> {
        try {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodedAddress}&format=json&limit=1`
            );

            if (!response.ok) {
                console.warn("Geocoding failed", response.statusText);
                return null;
            }

            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error);
            return null;
        }
    },

    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
};
