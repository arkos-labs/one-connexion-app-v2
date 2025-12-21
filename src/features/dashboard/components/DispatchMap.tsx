import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Package } from "lucide-react";
import "leaflet/dist/leaflet.css";

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
const driverIconBase = (color: string) => new L.DivIcon({
    html: `<div style="background-color: ${color}; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; items-center; justify-center; color: white;">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
           </div>`,
    className: "custom-driver-marker",
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

const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pendingOrderIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface DispatchMapProps {
    drivers: any[];
    orders: any[];
}

export const DispatchMap = ({ drivers, orders }: DispatchMapProps) => {
    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-border/10 shadow-inner bg-secondary/5">
            <MapContainer
                center={[48.8566, 2.3522]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer url={TILE_URL} />

                {/* 1. Marqueurs Chauffeurs */}
                {drivers.map((driver) => {
                    const activeMission = orders.find(o => o.driver_id === driver.id && o.status !== 'delivered');
                    
                    let markerColor = driver.is_online ? '#22c55e' : '#94a3b8'; // Vert / Gris par défaut
                    if (activeMission) {
                        if (activeMission.status === 'in_progress') markerColor = '#a855f7'; // Violet pour Colis à bord
                        else markerColor = '#3b82f6'; // Bleu pour Accepté / En route
                    }

                    return driver.current_lat && (
                        <Marker
                            key={`driver-${driver.id}`}
                            position={[driver.current_lat, driver.current_lng]}
                            icon={driverIconBase(markerColor)}
                        >
                            <Popup>
                                <div className="p-2 min-w-[150px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`h-2 w-2 rounded-full ${driver.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <p className="font-bold text-sm">{driver.first_name} {driver.last_name}</p>
                                    </div>
                                    
                                    {activeMission && (
                                        <div className="mb-2 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground leading-none mb-1">Mission Active</p>
                                            <p className="text-[10px] font-bold text-primary truncate">#{activeMission.id.slice(0,8)}</p>
                                            {activeMission.status === 'in_progress' && (
                                                <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-purple-600 uppercase">
                                                    <Package className="h-3 w-3" />
                                                    Colis à bord
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Statut Flotte</p>
                                    <p className="text-xs font-bold text-primary">{driver.availability_status?.toUpperCase() || 'DISPONIBLE'}</p>
                                    <div className="mt-2 text-[9px] text-muted-foreground italic">
                                        Mis à jour: {driver.last_location_update ? new Date(driver.last_location_update).toLocaleTimeString() : 'N/A'}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* 2. Commandes Actives & Trajets */}
                {orders.map((order) => {
                    const isAssigned = !!order.driver_id;
                    const isAccepted = order.status === 'driver_accepted' || order.status === 'accepted';
                    const isArrivedPickup = order.status === 'arrived_pickup';
                    const isInProgress = order.status === 'in_progress';

                    const groupElements = [];

                    // Point de Retrait
                    if (order.pickup_lat) {
                        groupElements.push(
                            <Marker
                                key={`pickup-${order.id}`}
                                position={[order.pickup_lat, order.pickup_lng]}
                                icon={isAssigned ? pickupIcon : pendingOrderIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <p className="font-black text-[9px] text-blue-500 uppercase tracking-widest">RETRAIT</p>
                                        <p className="font-bold text-xs">#{order.id.slice(0, 8)}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-1">{order.pickup_address}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }

                    // Point de Livraison (Visible quand assigné/accepté)
                    if (order.delivery_lat && isAssigned) {
                        groupElements.push(
                            <Marker
                                key={`delivery-${order.id}`}
                                position={[order.delivery_lat, order.delivery_lng]}
                                icon={deliveryIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <p className="font-black text-[9px] text-green-500 uppercase tracking-widest">LIVRAISON</p>
                                        <p className="font-bold text-xs font-mono">#{order.id.slice(0, 8)}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-1">{order.delivery_address}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }

                    // Traçage du trajet en temps réel
                    if (order.driver_current_lat && order.driver_current_lng) {
                        const driverPos: [number, number] = [order.driver_current_lat, order.driver_current_lng];

                        // Si accepté mais pas encore récupéré -> Ligne vers Pickup
                        if (isAccepted || isArrivedPickup) {
                            groupElements.push(
                                <Polyline
                                    key={`line-p-${order.id}`}
                                    positions={[driverPos, [order.pickup_lat, order.pickup_lng]]}
                                    pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8, 8', opacity: 0.5 }}
                                />
                            );
                        }

                        // Si récupéré -> Ligne vers Delivery
                        if (isInProgress) {
                            groupElements.push(
                                <Polyline
                                    key={`line-d-${order.id}`}
                                    positions={[driverPos, [order.delivery_lat, order.delivery_lng]]}
                                    pathOptions={{ color: '#22c55e', weight: 4, dashArray: '10, 10', opacity: 0.7 }}
                                />
                            );
                        }
                    }

                    return <div key={`group-${order.id}`}>{groupElements}</div>;
                })}
            </MapContainer>
        </div>
    );
};

const Badge = ({ children, variant, className }: any) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>
        {children}
    </span>
);
