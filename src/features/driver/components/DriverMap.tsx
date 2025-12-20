import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";

// Fix for default Leaflet icons in Webpack/Vite
// Fix for default Leaflet icons in Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: (icon as any).src || icon,
    shadowUrl: (iconShadow as any).src || iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const driverIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097180.png", // Car icon placeholder
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

const pickupIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface DriverMapProps {
    activeOrder: Order | null;
    driverLocation: { lat: number; lng: number };
    className?: string;
}

// Component to handle map bounds updates
const MapUpdater = ({ activeOrder, driverLocation }: { activeOrder: Order | null; driverLocation: { lat: number; lng: number } }) => {
    const map = useMap();

    useEffect(() => {
        if (activeOrder) {
            const bounds = L.latLngBounds([
                [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng],
                [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng],
                [driverLocation.lat, driverLocation.lng]
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([driverLocation.lat, driverLocation.lng], 15);
        }
    }, [activeOrder, driverLocation, map]);

    return null;
};

export const DriverMap = ({ activeOrder, driverLocation, className = "" }: DriverMapProps) => {
    return (
        <div className={`relative h-full w-full ${className}`}>
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false} // Disable scroll zoom for better UX on mobile embedded maps
                className="h-full w-full rounded-3xl z-0"
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />

                {/* Modern styled tiles (Voyager) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Driver Marker */}
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                    <Popup>Vous êtes ici</Popup>
                </Marker>

                {/* Order Markers */}
                {activeOrder && (
                    <>
                        <Marker
                            position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]}
                            icon={pickupIcon}
                        >
                            <Popup>Départ: {activeOrder.pickupLocation.address}</Popup>
                        </Marker>

                        <Marker
                            position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]}
                            icon={dropoffIcon}
                        >
                            <Popup>Arrivée: {activeOrder.dropoffLocation.address}</Popup>
                        </Marker>
                    </>
                )}

                <MapUpdater activeOrder={activeOrder} driverLocation={driverLocation} />
            </MapContainer>

            {/* Overlay gradient for better integration */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-t from-background/10 to-transparent" />
        </div>
    );
};
