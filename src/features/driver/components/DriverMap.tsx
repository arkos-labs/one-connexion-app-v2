import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Configuration LocationIQ
const LOCATIONIQ_KEY = "pk.cc49323fc6339e614aec809f78bc7db4";
const TILE_URL = `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;

// Fix pour les icônes par défaut de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Icônes personnalisées
const carIcon = new L.DivIcon({
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: rotate(0deg); transition: transform 0.3s ease;">🚖</div>`,
    className: "custom-car-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface DriverMapProps {
    activeOrder: Order | null;
    driverLocation: { lat: number; lng: number };
}

// Logic Camera & Anti-Snap
const MapController = ({
    driverLocation,
    activeOrder,
    isUserInteracting,
    onInteraction
}: {
    driverLocation: { lat: number; lng: number },
    activeOrder: Order | null,
    isUserInteracting: boolean,
    onInteraction: () => void
}) => {
    const map = useMap();

    useMapEvents({
        dragstart: onInteraction,
        zoomstart: onInteraction,
        mousedown: onInteraction
    });

    useEffect(() => {
        if (isUserInteracting) return;

        if (activeOrder) {
            const bounds = L.latLngBounds([
                [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng],
                [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng],
                [driverLocation.lat, driverLocation.lng]
            ]);

            map.flyToBounds(bounds, {
                padding: [80, 80],
                maxZoom: 16,
                duration: 1.5
            });
        } else {
            map.flyTo([driverLocation.lat, driverLocation.lng], 16, {
                duration: 1.5
            });
        }
    }, [driverLocation, activeOrder, isUserInteracting, map]);

    return null;
};

export const DriverMap = ({ activeOrder, driverLocation }: DriverMapProps) => {
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    const handleRecenter = useCallback(() => {
        setIsUserInteracting(false);
    }, []);

    // Polylines pour visualiser le trajet
    const getPolylines = () => {
        if (!activeOrder) return null;

        const driverToPickup = [
            [driverLocation.lat, driverLocation.lng] as [number, number],
            [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng] as [number, number]
        ];

        const pickupToDropoff = [
            [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng] as [number, number],
            [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng] as [number, number]
        ];

        return (
            <>
                {/* Trajet vers le point de retrait */}
                <Polyline
                    positions={driverToPickup}
                    pathOptions={{ color: 'hsl(var(--primary))', weight: 4, dashArray: '10, 10', opacity: 0.6 }}
                />
                {/* Trajet vers la destination */}
                <Polyline
                    positions={pickupToDropoff}
                    pathOptions={{ color: '#666', weight: 4, dashArray: '5, 10', opacity: 0.4 }}
                />
            </>
        );
    };

    return (
        <div className="relative w-full h-full z-0">
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={16}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url={TILE_URL} />

                <MapController
                    driverLocation={driverLocation}
                    activeOrder={activeOrder}
                    isUserInteracting={isUserInteracting}
                    onInteraction={() => setIsUserInteracting(true)}
                />

                {/* Marqueur Chauffeur */}
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
                    <Popup className="custom-popup">
                        <div className="text-center font-bold">Vous êtes ici</div>
                    </Popup>
                </Marker>

                {/* Marqueurs de Course */}
                {activeOrder && (
                    <>
                        <Marker position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]} icon={pickupIcon}>
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-blue-600 uppercase text-[10px] tracking-widest">Retrait</p>
                                    <p className="text-sm font-medium">{activeOrder.clientName}</p>
                                    <p className="text-xs text-muted-foreground">{activeOrder.pickupAddress}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Marker position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]} icon={dropoffIcon}>
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-green-600 uppercase text-[10px] tracking-widest">Destination</p>
                                    <p className="text-xs text-muted-foreground">{activeOrder.dropoffAddress}</p>
                                </div>
                            </Popup>
                        </Marker>
                        {getPolylines()}
                    </>
                )}
            </MapContainer>

            {/* Bouton Recentrer Anti-Snap */}
            <AnimatePresence>
                {isUserInteracting && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-[401]"
                    >
                        <Button
                            onClick={handleRecenter}
                            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full py-6 px-8 shadow-2xl border border-white/10 gap-3"
                        >
                            <LocateFixed className="h-5 w-5 animate-pulse" />
                            <span className="font-bold tracking-tight">Recentrer sur moi</span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attribution discrète */}
            <div className="absolute bottom-2 left-2 z-[400] text-[8px] text-muted-foreground opacity-50 bg-white/50 px-1 rounded">
                © LocationIQ | © OpenStreetMap contributors
            </div>
        </div>
    );
};
