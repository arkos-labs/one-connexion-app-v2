import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useIncomingOrderAlert = () => {
    const { orders, driverStatus, user } = useAppStore();
    const pendingOrder = orders.find(o => o.status === 'pending');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const vibrationInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const shouldRing = pendingOrder && driverStatus === 'online';
        const pendingOrderId = pendingOrder?.id;

        if (shouldRing) {
            console.log(`🔔 [IncomingOrderAlert] Démarrage alerte pour ${pendingOrderId}`);
            startAlert();
        } else {
            stopAlert();
        }

        return () => stopAlert();
    }, [pendingOrder?.id, driverStatus]);

    const startAlert = () => {
        // 1. Configuration Audio
        if (!audioRef.current) {
            audioRef.current = new Audio(RINGTONE_URL);
            audioRef.current.loop = true;
            audioRef.current.volume = 1.0;
        }

        // 2. Lecture Sécurisée (Safe Play)
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay Audio bloqué par le navigateur :", error);

                // Fallback Haptique Mobile
                if (Capacitor.isNativePlatform()) {
                    Haptics.vibrate();
                } else if (navigator.vibrate) {
                    navigator.vibrate([500, 100, 500, 100, 500]);
                }
            });
        }

        // 3. Vibration / Haptique Standard
        triggerHaptic();
        if (!vibrationInterval.current) {
            vibrationInterval.current = setInterval(() => {
                triggerHaptic();
            }, 1500);
        }
    };

    const triggerHaptic = async () => {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
            setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 200);
        } else if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500]);
        }
    };

    const stopAlert = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
            vibrationInterval.current = null;
        }
        if (!Capacitor.isNativePlatform() && navigator.vibrate) {
            navigator.vibrate(0);
        }
    };
};
