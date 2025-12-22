import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "@/hooks/use-toast";
import { Geolocation, WatchPositionCallback } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { driverService } from "@/services/driverService";

/**
 * Hook GPS Intelligent avec Mode Simulation & Support Natif Capacitor
 */
export const useDriverPosition = () => {
    const setDriverLocation = useAppStore((state) => state.setDriverLocation);
    const isOnDuty = useAppStore((state) => state.isOnDuty);
    const driverLocation = useAppStore((state) => state.driverLocation);
    const user = useAppStore((state) => state.user);
    const currentOrder = useAppStore((state) => state.currentOrder);

    const [isSimulating, setIsSimulating] = useState(false);

    // Refs pour garder le contrôle sur les processus asynchrones
    const watchId = useRef<string | number | null>(null);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    // Demande de permissions pour le mobile
    const requestPermissions = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const status = await Geolocation.requestPermissions();
                console.log("📍 Permission GPS status:", status.location);
            } catch (error) {
                console.error("❌ Erreur permissions GPS:", error);
            }
        }
    };

    // 1. Gestion Intelligente du GPS Réel
    useEffect(() => {
        requestPermissions();

        // SCÉNARIO 1 : Si on simule ou qu'on est hors ligne, on coupe le GPS
        if (!isOnDuty || isSimulating) {
            if (watchId.current !== null) {
                console.log("🛑 GPS coupé (Simulation ou Hors Ligne)");
                if (Capacitor.isNativePlatform()) {
                    Geolocation.clearWatch({ id: watchId.current as string });
                } else {
                    navigator.geolocation.clearWatch(watchId.current as number);
                }
                watchId.current = null;
            }
            return;
        }

        const handlePositionUpdate = (position: any) => {
            if (!isSimulating && position) {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                setDriverLocation(newLocation);

                // Sync with Supabase (includes current order ID if available)
                if (user) {
                    driverService.updateLocation(user.id, newLocation.lat, newLocation.lng, currentOrder?.id);
                }
            }
        };

        const handleError = (error: any) => {
            console.error("GPS Error:", error);
        };

        const watchOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        // SCÉNARIO 3 : Activation du Tracking (Natif vs Web)
        console.log("📡 Démarrage du tracking GPS...");

        if (Capacitor.isNativePlatform()) {
            Geolocation.watchPosition(watchOptions, (position, err) => {
                if (err) handleError(err);
                else handlePositionUpdate(position);
            }).then(id => {
                watchId.current = id;
            });
        } else if (navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                handlePositionUpdate,
                handleError,
                watchOptions
            );
        } else {
            toast({
                title: "Erreur GPS",
                description: "La géolocalisation n'est pas supportée.",
                variant: "destructive"
            });
        }

        // Nettoyage au démontage
        return () => {
            if (watchId.current !== null) {
                if (Capacitor.isNativePlatform()) {
                    Geolocation.clearWatch({ id: watchId.current as string });
                } else {
                    navigator.geolocation.clearWatch(watchId.current as number);
                }
            }
        };
    }, [isOnDuty, isSimulating, setDriverLocation, user, currentOrder]);

    // 2. Moteur de Simulation (Interpolation Fluide)
    const simulateTravel = useCallback((to: { lat: number; lng: number }, durationSeconds: number = 5) => {
        setIsSimulating(true);
        if (simulationInterval.current) clearInterval(simulationInterval.current);

        const start = driverLocation;
        const fps = 60;
        const totalSteps = durationSeconds * fps;
        let step = 0;

        toast({ title: "🚗 Simulation active", description: "GPS réel désactivé temporairement." });

        simulationInterval.current = setInterval(() => {
            step++;
            const progress = step / totalSteps;

            if (progress >= 1) {
                if (simulationInterval.current) clearInterval(simulationInterval.current);
                simulationInterval.current = null;
                setDriverLocation(to);
                if (user) driverService.updateLocation(user.id, to.lat, to.lng, currentOrder?.id);

                setTimeout(() => {
                    setIsSimulating(false);
                    toast({ title: "✅ Arrivé", description: "Retour au GPS réel..." });
                }, 1000);
            } else {
                const newLoc = {
                    lat: start.lat + (to.lat - start.lat) * progress,
                    lng: start.lng + (to.lng - start.lng) * progress
                };
                setDriverLocation(newLoc);
                if (user) driverService.updateLocation(user.id, newLoc.lat, newLoc.lng, currentOrder?.id);
            }
        }, 1000 / fps);
    }, [driverLocation, setDriverLocation, user, currentOrder]);

    return { simulateTravel, isSimulating };
};
