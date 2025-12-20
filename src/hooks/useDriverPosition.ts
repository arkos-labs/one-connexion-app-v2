import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "@/hooks/use-toast";

export const useDriverPosition = () => {
    const { setDriverLocation, isOnDuty, driverLocation } = useAppStore();
    const watchId = useRef<number | null>(null);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    // 1. GPS Réel (Activé quand isOnDuty)
    useEffect(() => {
        if (!isOnDuty) {
            stopTracking();
            return;
        }

        if (!navigator.geolocation) {
            toast({ title: "Erreur GPS", description: "Géolocalisation non supportée", variant: "destructive" });
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                // On ne met à jour que si pas en mode simulation
                if (!simulationInterval.current) {
                    setDriverLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }
            },
            (error) => console.error("GPS Error:", error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => stopTracking();
    }, [isOnDuty, setDriverLocation]);

    const stopTracking = () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        if (simulationInterval.current) clearInterval(simulationInterval.current);
    };

    // 2. Moteur de Simulation (Interpolation linéaire simple)
    const simulateTravel = useCallback((to: { lat: number; lng: number }, durationSeconds: number = 5) => {
        if (simulationInterval.current) clearInterval(simulationInterval.current);

        const start = driverLocation;
        const steps = durationSeconds * 20; // 20 updates par seconde
        let step = 0;

        toast({ title: "Simulation", description: "Déplacement automatique..." });

        simulationInterval.current = setInterval(() => {
            step++;
            const progress = step / steps;

            if (progress >= 1) {
                if (simulationInterval.current) clearInterval(simulationInterval.current);
                simulationInterval.current = null;
                setDriverLocation(to); // Arrivée exacte
                toast({ title: "Arrivé", description: "Vous êtes à destination" });
            } else {
                setDriverLocation({
                    lat: start.lat + (to.lat - start.lat) * progress,
                    lng: start.lng + (to.lng - start.lng) * progress
                });
            }
        }, 1000 / 20); // 50ms interval
    }, [driverLocation, setDriverLocation]);

    return { simulateTravel };
};
