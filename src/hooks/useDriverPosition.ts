import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "@/hooks/use-toast";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { driverService } from "@/services/driverService";

export const useDriverPosition = () => {
    const setDriverLocation = useAppStore((state) => state.setDriverLocation);
    const isOnDuty = useAppStore((state) => state.isOnDuty);
    const driverLocation = useAppStore((state) => state.driverLocation);
    const user = useAppStore((state) => state.user);
    const currentOrder = useAppStore((state) => state.currentOrder);

    const [isSimulating, setIsSimulating] = useState(false);
    const watchId = useRef<string | number | null>(null);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    const requestPermissions = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Geolocation.requestPermissions();
            } catch (error) {
                console.error("❌ Erreur permissions GPS:", error);
            }
        }
    };

    useEffect(() => {
        requestPermissions();

        if (!isOnDuty || isSimulating) {
            if (watchId.current !== null) {
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

                if (user) {
                    driverService.updateLocation(user.id, newLocation.lat, newLocation.lng, currentOrder?.id);
                }
            }
        };

        const watchOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        if (Capacitor.isNativePlatform()) {
            Geolocation.watchPosition(watchOptions, (position, err) => {
                if (!err) handlePositionUpdate(position);
            }).then(id => { watchId.current = id; });
        } else if (navigator.geolocation) {
            watchId.current = navigator.geolocation.watchPosition(
                handlePositionUpdate,
                (err) => console.error(err),
                watchOptions
            );
        }

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

    const simulateTravel = useCallback((to: { lat: number; lng: number }, durationSeconds: number = 5) => {
        setIsSimulating(true);
        if (simulationInterval.current) clearInterval(simulationInterval.current);

        const start = driverLocation;
        const fps = 60;
        const totalSteps = durationSeconds * fps;
        let step = 0;

        simulationInterval.current = setInterval(() => {
            step++;
            const progress = step / totalSteps;

            if (progress >= 1) {
                clearInterval(simulationInterval.current!);
                simulationInterval.current = null;
                setDriverLocation(to);
                if (user) driverService.updateLocation(user.id, to.lat, to.lng, currentOrder?.id);
                setTimeout(() => setIsSimulating(false), 1000);
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
