import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";

// --- Fix Webpack/Vite Icons ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: (icon as any).src || icon,
    shadowUrl: (iconShadow as any).src || iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Custom Icons ---
const driverIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3097/3097180.png",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -20],
    className: "drop-shadow-lg"
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

// --- Smart Focus Logic (Optimized) ---
const MapUpdater = ({ activeOrder, driverLocation }: { activeOrder: Order | null; driverLocation: { lat: number; lng: number } }) => {
    const map = useMap();
    const hasZoomedRef = useRef<string>("");

    useEffect(() => {
        // Clé unique pour l'état actuel (ID commande + Statut)
        const currentKey = activeOrder ? `${activeOrder.id}-${activeOrder.status}` : "idle";

        // Anti-rebond : On ne re-zoom pas si on est déjà calé sur cet état (sauf si c'est le premier render)
        // Cela permet au driver de bouger la carte sans que ça "saute" tout le temps
        if (hasZoomedRef.current === currentKey) return;

        if (!activeOrder) {
            map.setView([driverLocation.lat, driverLocation.lng], 15, { animate: true });
        } else {
            const points: L.LatLngTuple[] = [[driverLocation.lat, driverLocation.lng]];

            if (activeOrder.status === 'accepted') {
                points.push([activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]);
            } else if (activeOrder.status === 'in_progress') {
                points.push([activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]);
            }

            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
        }

        hasZoomedRef.current = currentKey;

    }, [activeOrder?.id, activeOrder?.status, map]); // RETRAIT DE driverLocation des dépendances !

    return null;
};

export const DriverMap = ({ activeOrder, driverLocation, className = "" }: DriverMapProps) => {
    const isPickupPhase = activeOrder?.status === 'accepted';
    const isInProgress = activeOrder?.status === 'in_progress';

    // Route Logic
    const routeToPickup = (activeOrder && isPickupPhase) ? [
        [driverLocation.lat, driverLocation.lng],
        [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]
    ] as [number, number][] : [];

    const routeToDropoff = activeOrder ? (
        isInProgress
            ? [[driverLocation.lat, driverLocation.lng], [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]]
            : [[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng], [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]]
    ) as [number, number][] : [];

    return (
        <div className={`relative h-full w-full ${className}`}>
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                className="h-full w-full rounded-3xl z-0"
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />

                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} zIndexOffset={1000} />

                {activeOrder && (
                    <>
                        {isPickupPhase && (
                            <>
                                <Polyline positions={routeToPickup} pathOptions={{ color: '#3b82f6', dashArray: '10, 10', weight: 5, opacity: 0.9 }} />
                                <Marker position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]} icon={pickupIcon}>
                                    <Popup>Retrait: {activeOrder.pickupLocation.address}</Popup>
                                </Marker>
                            </>
                        )}

                        <Polyline
                            positions={routeToDropoff}
                            pathOptions={{
                                color: isInProgress ? '#3b82f6' : '#94a3b8',
                                dashArray: isInProgress ? '10, 10' : '5, 15',
                                weight: isInProgress ? 5 : 3,
                                opacity: isInProgress ? 0.9 : 0.5
                            }}
                        />
                        <Marker position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]} icon={dropoffIcon}>
                            <Popup>Destination: {activeOrder.dropoffLocation.address}</Popup>
                        </Marker>
                    </>
                )}

                <MapUpdater activeOrder={activeOrder} driverLocation={driverLocation} />
            </MapContainer>
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-t from-background/10 to-transparent" />
        </div>
    );
};
