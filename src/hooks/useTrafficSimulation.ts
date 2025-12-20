import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { toast } from '@/hooks/use-toast';

export const useTrafficSimulation = () => {
    const { driverStatus, orders, currentOrder, triggerNewOrder } = useAppStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Stop simulation if:
        // - Driver is not online
        // - Driver has an active order (currentOrder)
        // - There are already pending orders in the list
        if (driverStatus !== 'online' || currentOrder || orders.length > 0) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // Si on est en ligne et dispo, on lance un timer pour une nouvelle commande
        // Délai aléatoire entre 5 et 10 secondes pour la démo
        const delay = Math.floor(Math.random() * 5000) + 5000;

        // Éviter de relancer le timer si déjà actif (sauf si dépendances changent, ce qui nettoiera l'ancien via le return)

        timerRef.current = setTimeout(() => {
            triggerNewOrder();
            // Le toast est déjà géré par l'UI ou pourrait être ajouté ici
        }, delay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [driverStatus, currentOrder, orders.length, triggerNewOrder]);
};
