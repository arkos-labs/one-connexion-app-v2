import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useToast } from "@/hooks/use-toast";

// Son MP3 court et percutant
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const useDriverAlerts = () => {
    const { orders, earnings, isOnDuty } = useAppStore();
    const { toast } = useToast();

    // Refs pour comparer l'état précédent (Pattern "Previous Value")
    const prevPendingCount = useRef(orders.length);
    const prevEarnings = useRef(earnings);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialisation Audio
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        audioRef.current.volume = 0.8;
    }, []);

    const playSound = () => {
        if (audioRef.current && isOnDuty) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn("Audio autoplay blocked", e));
        }
    };

    // 1. Détection : Nouvelle Commande (Ding)
    useEffect(() => {
        const pendingCount = orders.filter(o => o.status === 'pending').length;

        // Si le nombre augmente ET qu'on est en ligne
        if (pendingCount > prevPendingCount.current && isOnDuty) {
            playSound();
            toast({
                title: "🔔 Nouvelle Course !",
                description: "Un client demande une livraison.",
                className: "bg-green-600 text-white border-none shadow-lg"
            });
        }

        prevPendingCount.current = pendingCount;
    }, [orders, isOnDuty, toast]);

    // 2. Détection : Paiement (Cash)
    useEffect(() => {
        if (earnings > prevEarnings.current) {
            const diff = earnings - prevEarnings.current;
            toast({
                title: "💰 Paiement reçu",
                description: `+${diff.toFixed(2)}€ ajoutés à votre solde.`,
                className: "bg-black text-white border-white/20 shadow-xl"
            });
        }
        prevEarnings.current = earnings;
    }, [earnings, toast]);
};
