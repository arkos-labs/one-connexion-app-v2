import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { orderService } from '@/services/orderService';
import { driverService } from '@/services/driverService';

/**
 * Hook pour synchroniser la position du chauffeur en temps réel
 * Permet à l'admin de suivre le chauffeur pendant toute la course
 */
export const useDriverLocationSync = () => {
    const { currentOrder, driverLocation, isOnDuty } = useAppStore();
    const lastUpdateRef = useRef<number>(0);
    const locationRef = useRef(driverLocation);
    const orderRef = useRef(currentOrder);
    const UPDATE_INTERVAL = 3000; // Synchronisation toutes les 3 secondes

    // Update refs whenever the store values change
    useEffect(() => {
        locationRef.current = driverLocation;
        orderRef.current = currentOrder;
    }, [driverLocation, currentOrder]);

    useEffect(() => {
        // Ne démarrer le cycle que si le chauffeur est en mission
        if (!isOnDuty) return;

        const syncLocation = async () => {
            const now = Date.now();
            const activeOrder = orderRef.current;
            const currentLoc = locationRef.current;
            const { user } = useAppStore.getState();

            // S'assurer que les coordonnées sont valides
            if (!currentLoc || (currentLoc.lat === 0 && currentLoc.lng === 0)) return;

            // Éviter les mises à jour trop fréquentes
            if (now - lastUpdateRef.current < UPDATE_INTERVAL - 500) {
                return;
            }

            try {
                const promises = [];

                // 1. Mise à jour spécifique à la mission active (si présente)
                // NOTE: Désactivé car driver_current_lat/lng n'existent pas dans orders
                // La localisation est déjà mise à jour dans driver_locations (étape 2)
                /*
                if (activeOrder) {
                    let sbStatus = activeOrder.status as string;
                    if (activeOrder.status === 'accepted') sbStatus = 'driver_accepted';
                    if (activeOrder.status === 'completed') sbStatus = 'delivered';

                    promises.push(
                        orderService.updateStatusWithLocation(
                            activeOrder.id,
                            sbStatus,
                            currentLoc,
                            { last_location_update: new Date().toISOString() }
                        )
                    );
                }
                */

                // 2. MISE À JOUR GLOBALE (Indispensable pour la Live Map de l'admin)
                if (user) {
                    promises.push(
                        driverService.updateLocation(
                            user.id,
                            currentLoc.lat,
                            currentLoc.lng,
                            activeOrder?.id
                        )
                    );
                }

                await Promise.all(promises);

                lastUpdateRef.current = now;
                console.log('✅ [LocationSync] Position globale et mission synchronisées');
            } catch (error) {
                console.error('❌ [LocationSync] Erreur synchronisation:', error);
            }
        };

        const interval = setInterval(syncLocation, UPDATE_INTERVAL);
        syncLocation();

        return () => clearInterval(interval);
    }, [isOnDuty]);
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
