import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";
import { LocateFixed } from "lucide-react";

// --- CONFIGURATION API ---
const LOCATIONIQ_KEY = "pk.cc49323fc6339e614aec809f78bc7db4";
const TILE_URL = `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;

// --- ASSETS GRAPHIQUES ---
// Voiture (Emoji haute qualité ou SVG personnalisé)
const carIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4)); transform: translateY(-5px);">🚖</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20] // Centré parfaitement
});

// Marqueurs standards Leaflet (corrigés pour React)
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

// --- SOUS-COMPOSANT : CONTRÔLEUR DE CAMÉRA ---
// C'est lui qui décide si on bouge la carte ou non
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

    // Détecte quand l'utilisateur touche la carte
    useMapEvents({
        dragstart: () => {
            onUserInteraction(); // Active le mode "Manuel"
        },
        zoomstart: () => {
            onUserInteraction(); // Le zoom compte aussi comme une interaction
        }
    });

    useEffect(() => {
        // Si l'utilisateur a pris le contrôle, on ne fait RIEN.
        if (isInteracting) return;

        if (activeOrder) {
            // SCÉNARIO MISSION : On cadre tout (Départ + Arrivée + Chauffeur)
            const bounds = L.latLngBounds(
                [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng],
                [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]
            );
            bounds.extend([location.lat, location.lng]); // On s'assure que le chauffeur est visible

            map.flyToBounds(bounds, {
                padding: [50, 50],
                duration: 1.5,
                animate: true
            });
        } else {
            // SCÉNARIO LIBRE : On suit la voiture de près (Zoom 16)
            map.flyTo([location.lat, location.lng], 16, {
                duration: 1.5,
                animate: true
            });
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
    // État : Est-ce que l'utilisateur manipule la carte ?
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    // Fonction pour recentrer manuellement
    const handleRecenter = () => {
        setIsUserInteracting(false); // Rend le contrôle au GPS
    };

    return (
        <div className="relative h-full w-full bg-gray-100">
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false} // On cache le zoom par défaut pour un look mobile
                attributionControl={false} // On retire le copyright par défaut (optionnel)
                className="z-0 outline-none"
            >
                {/* 1. TUILES LOCATION IQ */}
                <TileLayer
                    url={TILE_URL}
                    maxZoom={18}
                    attribution='&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a>'
                />

                {/* 2. MARQUEUR CHAUFFEUR */}
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon} />

                {/* 3. MARQUEURS MISSION */}
                {activeOrder && (
                    <>
                        <Marker position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]} icon={pickupIcon}>
                            <Popup className="font-semibold">Pickup: {activeOrder.pickupLocation.address}</Popup>
                        </Marker>
                        <Marker position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]} icon={dropoffIcon}>
                            <Popup className="font-semibold">Dropoff: {activeOrder.dropoffLocation.address}</Popup>
                        </Marker>
                    </>
                )}

                {/* 4. LOGIQUE CAMÉRA */}
                <MapController
                    location={driverLocation}
                    activeOrder={activeOrder}
                    isInteracting={isUserInteracting}
                    onUserInteraction={() => setIsUserInteracting(true)}
                />
            </MapContainer>

            {/* 5. BOUTON RECENTRER (Apparaît seulement si nécessaire) */}
            {isUserInteracting && (
                <button
                    onClick={handleRecenter}
                    className="absolute bottom-8 right-6 z-[400] bg-black text-white px-4 py-3 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    <LocateFixed size={20} className="mr-2 animate-pulse" />
                    <span className="font-bold text-sm">Recentrer</span>
                </button>
            )}
        </div>
    );
};
