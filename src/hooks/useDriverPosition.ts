import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "@/hooks/use-toast";

/**
 * Hook GPS Intelligent avec Mode Simulation
 * 
 * FONCTIONNALITÉS :
 * - GPS réel haute précision quand le chauffeur est en ligne
 * - Mode simulation qui COUPE physiquement le GPS pour éviter les conflits
 * - Interpolation fluide à 60 FPS pendant la simulation
 * - Prévention de la surchauffe en désactivant le GPS pendant la simulation
 */
export const useDriverPosition = () => {
    const setDriverLocation = useAppStore((state) => state.setDriverLocation);
    const isOnDuty = useAppStore((state) => state.isOnDuty);
    const driverLocation = useAppStore((state) => state.driverLocation);

    const [isSimulating, setIsSimulating] = useState(false);

    // Refs pour garder le contrôle sur les processus asynchrones
    const watchId = useRef<number | null>(null);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    // 1. Gestion Intelligente du GPS Réel
    useEffect(() => {
        // SCÉNARIO 1 : Si on simule ou qu'on est hors ligne, on coupe le GPS
        if (!isOnDuty || isSimulating) {
            if (watchId.current !== null) {
                console.log("🛑 GPS coupé (Simulation ou Hors Ligne)");
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            return;
        }

        // SCÉNARIO 2 : GPS non supporté
        if (!navigator.geolocation) {
            toast({
                title: "Erreur GPS",
                description: "La géolocalisation n'est pas supportée par votre appareil.",
                variant: "destructive"
            });
            return;
        }

        // SCÉNARIO 3 : Activation du Tracking
        console.log("📡 Démarrage du tracking GPS haute précision...");
        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                // Mise à jour uniquement si nous ne sommes PAS en simulation (double sécurité)
                if (!isSimulating) {
                    setDriverLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }
            },
            (error) => {
                console.error("GPS Error:", error);
                // Optionnel : Notification silencieuse ou réessai
            },
            {
                enableHighAccuracy: true, // Priorité précision
                timeout: 10000,           // Timeout 10s
                maximumAge: 0             // Pas de cache de position
            }
        );

        // Nettoyage au démontage
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [isOnDuty, isSimulating, setDriverLocation]);

    // 2. Moteur de Simulation (Interpolation Fluide)
    const simulateTravel = useCallback((to: { lat: number; lng: number }, durationSeconds: number = 5) => {
        // Active le mode simulation -> Cela déclenchera le useEffect pour couper le GPS réel
        setIsSimulating(true);

        // Nettoyage d'une éventuelle simulation précédente
        if (simulationInterval.current) clearInterval(simulationInterval.current);

        const start = driverLocation;
        const fps = 60; // 60 images par seconde pour une fluidité maximale
        const totalSteps = durationSeconds * fps;
        let step = 0;

        toast({ title: "🚗 Simulation active", description: "GPS réel désactivé temporairement." });

        simulationInterval.current = setInterval(() => {
            step++;
            const progress = step / totalSteps;

            if (progress >= 1) {
                // FIN DE TRAJET
                if (simulationInterval.current) clearInterval(simulationInterval.current);
                simulationInterval.current = null;
                setDriverLocation(to); // Force la position exacte d'arrivée

                // On attend 1 seconde avant de réactiver le GPS réel pour éviter un "saut" brutal
                setTimeout(() => {
                    setIsSimulating(false);
                    toast({ title: "✅ Arrivé", description: "Retour au GPS réel..." });
                }, 1000);
            } else {
                // CALCUL DE LA POSITION INTERMÉDIAIRE
                setDriverLocation({
                    lat: start.lat + (to.lat - start.lat) * progress,
                    lng: start.lng + (to.lng - start.lng) * progress
                });
            }
        }, 1000 / fps);
    }, [driverLocation, setDriverLocation]);

    return { simulateTravel, isSimulating };
};
