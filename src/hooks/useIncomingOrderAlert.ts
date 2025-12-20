import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";

/**
 * Hook pour gérer les alertes de nouvelles commandes
 * 
 * AMÉLIORATIONS v2.0 :
 * - Gestion de l'Auto-Play Policy (initialisation au premier clic)
 * - API Vibration défensive (vérification de compatibilité)
 * - Prévention des fuites mémoire
 * - Logs de débogage
 */

// Son de sonnerie (style téléphone classique ou notification urgente)
const RINGTONE_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useIncomingOrderAlert = () => {
    const orders = useAppStore((state) => state.orders);
    const driverStatus = useAppStore((state) => state.driverStatus);
    const isOnDuty = useAppStore((state) => state.isOnDuty);

    // On cherche s'il y a une commande en attente
    const pendingOrder = orders.find(o => o.status === 'pending');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const vibrationInterval = useRef<NodeJS.Timeout | null>(null);
    const [audioInitialized, setAudioInitialized] = useState(false);

    // 1. INITIALISATION AUDIO (Au premier passage "En Ligne")
    useEffect(() => {
        if (isOnDuty && !audioInitialized) {
            initializeAudio();
        }
    }, [isOnDuty, audioInitialized]);

    // 2. GESTION DES ALERTES
    useEffect(() => {
        // Si on a une commande en attente ET qu'on est en ligne/dispo
        const shouldRing = pendingOrder && (driverStatus === 'online' || driverStatus === 'busy');

        if (shouldRing) {
            startAlert();
        } else {
            stopAlert();
        }

        // Nettoyage si le composant est démonté
        return () => stopAlert();
    }, [pendingOrder, driverStatus]);

    /**
     * Initialise l'audio au premier passage en ligne
     * Cela contourne l'Auto-Play Policy car c'est déclenché par une action utilisateur
     */
    const initializeAudio = () => {
        try {
            console.log("🔊 Initialisation audio...");

            if (!audioRef.current) {
                audioRef.current = new Audio(RINGTONE_URL);
                audioRef.current.loop = true;
                audioRef.current.volume = 1.0;

                // Préchargement du son
                audioRef.current.load();
            }

            // Test de lecture (volume 0 pour ne pas déranger)
            const originalVolume = audioRef.current.volume;
            audioRef.current.volume = 0;

            audioRef.current.play()
                .then(() => {
                    console.log("✅ Audio initialisé avec succès");
                    audioRef.current!.pause();
                    audioRef.current!.currentTime = 0;
                    audioRef.current!.volume = originalVolume;
                    setAudioInitialized(true);
                })
                .catch(err => {
                    console.warn("⚠️ Auto-play bloqué, l'audio sera initialisé à la première alerte:", err);
                    // On marque quand même comme initialisé pour ne pas réessayer
                    setAudioInitialized(true);
                });
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation audio:", error);
            setAudioInitialized(true); // Éviter les boucles infinies
        }
    };

    /**
     * Démarre l'alerte (son + vibration)
     */
    const startAlert = () => {
        // 1. AUDIO EN BOUCLE
        if (!audioRef.current) {
            // Si l'audio n'est pas initialisé, on le crée maintenant
            audioRef.current = new Audio(RINGTONE_URL);
            audioRef.current.loop = true;
            audioRef.current.volume = 1.0;
        }

        // Jouer le son (avec gestion d'erreur)
        if (audioRef.current.paused) {
            audioRef.current.play()
                .then(() => {
                    console.log("🔊 Alerte audio démarrée");
                })
                .catch(err => {
                    console.warn("⚠️ Lecture audio bloquée par le navigateur:", err.message);
                    // Fallback : Essayer de jouer à nouveau après un court délai
                    setTimeout(() => {
                        audioRef.current?.play().catch(() => {
                            console.warn("⚠️ Impossible de jouer l'audio. L'utilisateur doit interagir avec la page.");
                        });
                    }, 100);
                });
        }

        // 2. VIBRATION (Défensive - Vérification de compatibilité)
        startVibration();
    };

    /**
     * Démarre la vibration de manière défensive
     */
    const startVibration = () => {
        // Vérification défensive de l'API Vibration
        if (!('vibrate' in navigator)) {
            console.log("ℹ️ API Vibration non supportée sur cet appareil");
            return;
        }

        try {
            // Pattern : Vibre 500ms, Pause 200ms, Vibre 500ms
            const vibrated = navigator.vibrate([500, 200, 500]);

            if (vibrated) {
                console.log("📳 Vibration démarrée");
            } else {
                console.log("ℹ️ Vibration refusée par le navigateur");
            }

            // Répète toutes les 1.5 secondes
            if (!vibrationInterval.current) {
                vibrationInterval.current = setInterval(() => {
                    try {
                        navigator.vibrate([500, 200, 500]);
                    } catch (error) {
                        console.warn("⚠️ Erreur lors de la vibration:", error);
                        // Arrêter l'interval si la vibration échoue
                        if (vibrationInterval.current) {
                            clearInterval(vibrationInterval.current);
                            vibrationInterval.current = null;
                        }
                    }
                }, 1500);
            }
        } catch (error) {
            console.warn("⚠️ Erreur lors du démarrage de la vibration:", error);
        }
    };

    /**
     * Arrête l'alerte (son + vibration)
     */
    const stopAlert = () => {
        // Arrêter le son
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            console.log("🔇 Alerte audio arrêtée");
        }

        // Arrêter la vibration
        if (vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
            vibrationInterval.current = null;
        }

        // Stop immédiat de la vibration (si supporté)
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(0);
                console.log("📴 Vibration arrêtée");
            } catch (error) {
                console.warn("⚠️ Erreur lors de l'arrêt de la vibration:", error);
            }
        }
    };

    // Retourner l'état pour permettre un contrôle externe si nécessaire
    return {
        isAlertActive: !!pendingOrder && (driverStatus === 'online' || driverStatus === 'busy'),
        audioInitialized,
        hasVibrationSupport: 'vibrate' in navigator
    };
};
