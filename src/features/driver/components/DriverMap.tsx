import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";
import { LocateFixed } from "lucide-react";

// --- CONFIGURATION ---
const LOCATIONIQ_KEY = "pk.cc49323fc6339e614aec809f78bc7db4";
const TILE_URL = `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;

// --- ICONES ---
const carIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4)); transform: translateY(-5px);">🚖</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const pickupIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- CONTROLEUR DE CAMÉRA INTELLIGENT ---
// Remplace l'ancien "MapUpdater" buggé
const MapController = ({
    location,
    activeOrder,
    isInteracting,
    onUserInteraction
}: {
    location: { lat: number; lng: number },
    activeOrder: Order | null,
    isInteracting: boolean,
    onUserInteraction: () => void
}) => {
    const map = useMap();

    // Détecte l'interaction chauffeur (doigt sur l'écran)
    useMapEvents({
        dragstart: () => onUserInteraction(),
        zoomstart: () => onUserInteraction()
    });

    useEffect(() => {
        // Si le chauffeur touche la carte, ON NE BOUGE PLUS RIEN
        if (isInteracting) return;

        if (activeOrder) {
            // Mode Mission : Vue d'ensemble
            const bounds = L.latLngBounds(
                [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng],
                [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]
            );
            bounds.extend([location.lat, location.lng]);
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        } else {
            // Mode Libre : Suivi voiture
            map.flyTo([location.lat, location.lng], 16, { duration: 1.5 });
        }
    }, [location, activeOrder, isInteracting, map]);

    return null;
};

// --- COMPOSANT PRINCIPAL ---
interface DriverMapProps {
    driverLocation: { lat: number; lng: number };
    activeOrder: Order | null;
}

export const DriverMap = ({ driverLocation, activeOrder }: DriverMapProps) => {
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    return (
        <div className="relative h-full w-full bg-gray-100">
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl={false}
                className="z-0 outline-none"
            >
                {/* Tuiles LocationIQ */}
                <TileLayer url={TILE_URL} maxZoom={18} attribution='&copy; LocationIQ' />

                {/* Marqueurs */}
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon} />

                {activeOrder && (
                    <>
                        <Marker position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]} icon={pickupIcon}>
                            <Popup>Pickup: {activeOrder.pickupLocation.address}</Popup>
                        </Marker>
                        <Marker position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]} icon={dropoffIcon}>
                            <Popup>Dropoff: {activeOrder.dropoffLocation.address}</Popup>
                        </Marker>
                    </>
                )}

                {/* Contrôleur "Anti-Snap" */}
                <MapController
                    location={driverLocation}
                    activeOrder={activeOrder}
                    isInteracting={isUserInteracting}
                    onUserInteraction={() => setIsUserInteracting(true)}
                />
            </MapContainer>

            {/* BOUTON RECENTRER (Apparaît uniquement en mode manuel) */}
            {isUserInteracting && (
                <button
                    onClick={() => setIsUserInteracting(false)}
                    className="absolute bottom-8 right-6 z-[400] bg-black text-white px-4 py-3 rounded-full shadow-2xl flex items-center animate-in fade-in slide-in-from-bottom-4"
                >
                    <LocateFixed size={20} className="mr-2 animate-pulse" />
                    <span className="font-bold text-sm">Recentrer</span>
                </button>
            )}
        </div>
    );
};
