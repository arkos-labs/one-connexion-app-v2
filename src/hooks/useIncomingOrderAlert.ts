import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";

// Son de sonnerie (style téléphone classique ou notification urgente)
const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useIncomingOrderAlert = () => {
    const { orders, driverStatus } = useAppStore();

    // On cherche s'il y a une commande en attente
    const pendingOrder = orders.find(o => o.status === 'pending');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const vibrationInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Si on a une commande en attente ET qu'on est en ligne/dispo
        const shouldRing = pendingOrder && driverStatus === 'online';

        if (shouldRing) {
            startAlert();
        } else {
            stopAlert();
        }

        // Nettoyage si le composant est démonté
        return () => stopAlert();
    }, [pendingOrder, driverStatus]);

    const startAlert = () => {
        // 1. Audio en boucle
        if (!audioRef.current) {
            audioRef.current = new Audio(RINGTONE_URL);
            audioRef.current.loop = true; // IMPORTANT : Jouer en boucle
            audioRef.current.volume = 1.0; // Volume max
        }

        // Jouer le son (nécessite une interaction utilisateur préalable sur certains navigateurs)
        audioRef.current.play().catch(err => console.log("Lecture audio bloquée par le navigateur:", err));

        // 2. Vibration (Pattern : Vibre 500ms, Pause 200ms, Vibre 500ms...)
        if (navigator.vibrate) {
            // Vibre tout de suite
            navigator.vibrate([500, 200, 500]);

            // Puis répète toutes les 1.5 secondes
            if (!vibrationInterval.current) {
                vibrationInterval.current = setInterval(() => {
                    navigator.vibrate([500, 200, 500]);
                }, 1500);
            }
        }
    };

    const stopAlert = () => {
        // Arrêter le son
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Arrêter la vibration
        if (vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
            vibrationInterval.current = null;
        }
        if (navigator.vibrate) {
            navigator.vibrate(0); // Stop immédiat
        }
    };
};
