import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";

// Icône Voiture Personnalisée (Rotative et Fluide)
const carIcon = new L.DivIcon({
    className: "bg-transparent", // Important pour ne pas avoir de carré blanc
    html: `<div style="
    font-size: 24px; 
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); 
    transform-origin: center;
  ">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15] // Centré
});

// Icônes Points A et B
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

// Composant pour recentrer la carte (Caméra Fluide)
const MapUpdater = ({ location, activeOrder }: { location: { lat: number; lng: number }, activeOrder: Order | null }) => {
    const map = useMap();

    useEffect(() => {
        // Si une commande est active, on cadre large pour voir Départ + Arrivée
        if (activeOrder) {
            const bounds = L.latLngBounds(
                [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng],
                [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]
            );
            bounds.extend([location.lat, location.lng]); // On inclut la voiture
            map.flyToBounds(bounds, { padding: [50, 150], duration: 1.5 }); // Zoom fluide
        } else {
            // Mode Libre : On suit la voiture de près
            map.flyTo([location.lat, location.lng], 16, { duration: 1.5 });
        }
    }, [location, activeOrder, map]);

    return null;
};

interface DriverMapProps {
    driverLocation: { lat: number; lng: number };
    activeOrder: Order | null;
}

export const DriverMap = ({ driverLocation, activeOrder }: DriverMapProps) => {
    return (
        <MapContainer
            center={[driverLocation.lat, driverLocation.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false} // On retire les boutons +/- pour le style "App Mobile"
            attributionControl={false} // On retire le copyright pour le style "Clean"
            className="z-0 outline-none" // Retire les bordures de focus
        >
            <TileLayer
                // Fond de carte "Voyager" (Clair et Pro)
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Voiture Chauffeur (Animée via CSS .leaflet-marker-icon) */}
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon} />

            {/* Points de la mission */}
            {activeOrder && (
                <>
                    <Marker position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]} icon={pickupIcon}>
                        <Popup>Retrait: {activeOrder.pickupLocation.address}</Popup>
                    </Marker>
                    <Marker position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]} icon={dropoffIcon}>
                        <Popup>Livraison: {activeOrder.dropoffLocation.address}</Popup>
                    </Marker>
                </>
            )}

            <MapUpdater location={driverLocation} activeOrder={activeOrder} />
        </MapContainer>
    );
};
