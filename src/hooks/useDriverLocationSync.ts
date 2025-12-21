import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { orderService } from '@/services/orderService';

/**
 * Hook pour synchroniser la position du chauffeur en temps réel
 * Permet à l'admin de suivre le chauffeur pendant toute la course
 */
export const useDriverLocationSync = () => {
    const { currentOrder, driverLocation, isOnDuty } = useAppStore();
    const lastUpdateRef = useRef<number>(0);
    const UPDATE_INTERVAL = 3000; // Mise à jour toutes les 3 secondes (Temps réel fluide)

    useEffect(() => {
        // Ne synchroniser que si le chauffeur est en mission
        if (!currentOrder || !isOnDuty) {
            return;
        }

        const syncLocation = async () => {
            const now = Date.now();

            // Éviter les mises à jour trop fréquentes
            if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
                return;
            }

            try {
                console.log('📍 [LocationSync] Synchronisation position chauffeur...');

                await orderService.updateStatusWithLocation(
                    currentOrder.id,
                    currentOrder.status === 'accepted' ? 'driver_accepted' : 'in_progress',
                    driverLocation,
                    {
                        // Pas de changement de statut, juste mise à jour de position
                        last_location_update: new Date().toISOString()
                    }
                );

                lastUpdateRef.current = now;
                console.log('✅ [LocationSync] Position synchronisée avec succès');
            } catch (error) {
                console.error('❌ [LocationSync] Erreur synchronisation:', error);
            }
        };

        // Synchroniser immédiatement puis toutes les 10 secondes
        syncLocation();
        const interval = setInterval(syncLocation, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [currentOrder, driverLocation, isOnDuty]);
};

/**
 * Hook pour afficher des notifications de progression au chauffeur
 * Fournit un feedback visuel sur l'état de synchronisation
 */
export const useOrderProgressNotifications = () => {
    const { currentOrder } = useAppStore();
    const previousStatusRef = useRef<string | null>(null);

    useEffect(() => {
        if (!currentOrder) {
            previousStatusRef.current = null;
            return;
        }

        // Détecter les changements de statut
        if (previousStatusRef.current && previousStatusRef.current !== currentOrder.status) {
            const statusMessages: Record<string, string> = {
                'accepted': '✅ Course acceptée - En route vers le point de retrait',
                'in_progress': '📦 Colis récupéré - En route vers la livraison',
                'completed': '🎉 Livraison terminée avec succès',
            };

            const message = statusMessages[currentOrder.status];
            if (message) {
                console.log(`🔔 [Notification] ${message}`);
                // Ici vous pouvez ajouter une notification toast si vous avez un système de notifications
            }
        }

        previousStatusRef.current = currentOrder.status;
    }, [currentOrder]);
};
