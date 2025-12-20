import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";

const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useIncomingOrderAlert = () => {
    const { orders, driverStatus } = useAppStore();
    const pendingOrder = orders.find(o => o.status === 'pending');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const vibrationInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const shouldRing = pendingOrder && driverStatus === 'online';

        if (shouldRing) {
            startAlert();
        } else {
            stopAlert();
        }

        return () => stopAlert();
    }, [pendingOrder, driverStatus]);

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
                // Fallback : On force une vibration plus intense si le son échoue
                if (navigator.vibrate) navigator.vibrate([500, 100, 500, 100, 500]);
            });
        }

        // 3. Vibration Standard
        if (navigator.vibrate) {
            navigator.vibrate([500, 200, 500]);
            if (!vibrationInterval.current) {
                vibrationInterval.current = setInterval(() => {
                    navigator.vibrate([500, 200, 500]);
                }, 1500);
            }
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
        if (navigator.vibrate) navigator.vibrate(0);
    };
};
