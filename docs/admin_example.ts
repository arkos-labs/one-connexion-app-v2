/**
 * 📡 EXEMPLE DE CODE POUR L'ADMIN
 * 
 * Ce fichier montre comment l'admin peut s'abonner aux mises à jour
 * en temps réel du parcours du chauffeur
 */

import { supabase } from './supabase'; // Votre client Supabase

/**
 * S'abonner aux mises à jour des commandes en temps réel
 */
export function subscribeToOrderUpdates(onUpdate: (order: any) => void) {
    console.log('📡 [Admin] Abonnement aux mises à jour des commandes...');

    const subscription = supabase
        .channel('admin_order_tracking')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders'
        }, (payload) => {
            const order = payload.new;

            console.log('🔔 [Admin] Mise à jour reçue:', {
                orderId: order.id,
                status: order.status,
                position: {
                    lat: order.driver_current_lat,
                    lng: order.driver_current_lng
                },
                timestamps: {
                    accepted: order.accepted_at,
                    pickedUp: order.picked_up_at,
                    delivered: order.delivered_at
                }
            });

            // Appeler le callback avec les données
            onUpdate(order);
        })
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
        }, (payload) => {
            console.log('📥 [Admin] Nouvelle commande créée:', payload.new);
            onUpdate(payload.new);
        })
        .subscribe((status) => {
            console.log('📡 [Admin] Statut de l\'abonnement:', status);
        });

    // Retourner une fonction pour se désabonner
    return () => {
        console.log('🔌 [Admin] Désabonnement...');
        subscription.unsubscribe();
    };
}

/**
 * Exemple d'utilisation dans un composant React
 */
export function AdminDashboard() {
    const [orders, setOrders] = React.useState<any[]>([]);
    const [driverPositions, setDriverPositions] = React.useState<Map<string, { lat: number, lng: number }>>(new Map());

    React.useEffect(() => {
        // S'abonner aux mises à jour
        const unsubscribe = subscribeToOrderUpdates((order) => {
            // Mettre à jour la liste des commandes
            setOrders(prev => {
                const index = prev.findIndex(o => o.id === order.id);
                if (index >= 0) {
                    // Mise à jour d'une commande existante
                    const newOrders = [...prev];
                    newOrders[index] = order;
                    return newOrders;
                } else {
                    // Nouvelle commande
                    return [...prev, order];
                }
            });

            // Mettre à jour la position du chauffeur sur la carte
            if (order.driver_current_lat && order.driver_current_lng) {
                setDriverPositions(prev => {
                    const newMap = new Map(prev);
                    newMap.set(order.id, {
                        lat: order.driver_current_lat,
                        lng: order.driver_current_lng
                    });
                    return newMap;
                });
            }

            // Afficher une notification selon le statut
            showNotification(order);
        });

        // Se désabonner au démontage
        return unsubscribe;
    }, []);

    return (
        <div>
        <h1>Tableau de bord Admin </h1>
    {/* Afficher les commandes et la carte */ }
    </div>
  );
}

/**
 * Afficher une notification selon le statut de la commande
 */
function showNotification(order: any) {
    const notifications = {
        'driver_accepted': {
            title: '✅ Course acceptée',
            message: `Le chauffeur a accepté la commande #${order.id.substring(0, 8)}`
        },
        'in_progress': {
            title: '📦 Colis récupéré',
            message: `Le chauffeur a récupéré le colis et est en route vers la livraison`
        },
        'delivered': {
            title: '🎉 Livraison terminée',
            message: `La commande #${order.id.substring(0, 8)} a été livrée avec succès`
        }
    };

    const notification = notifications[order.status as keyof typeof notifications];
    if (notification) {
        console.log(`🔔 ${notification.title}: ${notification.message}`);
        // Ici, vous pouvez utiliser votre système de notifications (toast, etc.)
    }
}

/**
 * Récupérer toutes les commandes actives
 */
export async function fetchActiveOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending_acceptance', 'driver_accepted', 'in_progress'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ [Admin] Erreur récupération commandes:', error);
        throw error;
    }

    console.log(`✅ [Admin] ${data.length} commandes actives récupérées`);
    return data;
}

/**
 * Récupérer l'historique des commandes d'un chauffeur
 */
export async function fetchDriverHistory(driverId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', driverId)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('❌ [Admin] Erreur récupération historique:', error);
        throw error;
    }

    console.log(`✅ [Admin] ${data.length} commandes dans l'historique`);
    return data;
}

/**
 * Calculer les statistiques d'un chauffeur
 */
export async function getDriverStats(driverId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('price, delivered_at')
        .eq('driver_id', driverId)
        .eq('status', 'delivered');

    if (error) {
        console.error('❌ [Admin] Erreur calcul stats:', error);
        throw error;
    }

    const totalOrders = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + order.price, 0);
    const driverEarnings = totalRevenue * 0.40; // 40% pour le chauffeur

    console.log(`📊 [Admin] Stats chauffeur ${driverId}:`, {
        totalOrders,
        totalRevenue: `${totalRevenue.toFixed(2)}€`,
        driverEarnings: `${driverEarnings.toFixed(2)}€`
    });

    return {
        totalOrders,
        totalRevenue,
        driverEarnings
    };
}

/**
 * Exemple d'affichage sur une carte (avec Leaflet ou Google Maps)
 */
export function displayDriverOnMap(map: any, order: any) {
    if (!order.driver_current_lat || !order.driver_current_lng) {
        return;
    }

    const position = {
        lat: order.driver_current_lat,
        lng: order.driver_current_lng
    };

    // Créer ou mettre à jour le marqueur du chauffeur
    const marker = L.marker([position.lat, position.lng], {
        icon: L.icon({
            iconUrl: '/driver-icon.png',
            iconSize: [32, 32]
        })
    });

    marker.addTo(map);
    marker.bindPopup(`
    <div>
      <h3>Chauffeur en course</h3>
      <p>Commande: #${order.id.substring(0, 8)}</p>
      <p>Statut: ${order.status}</p>
      <p>Client: ${order.pickup_contact_name}</p>
    </div>
  `);

    // Centrer la carte sur le chauffeur
    map.setView([position.lat, position.lng], 14);

    return marker;
}

/**
 * Exemple complet d'utilisation
 */
export async function adminExample() {
    console.log('🚀 [Admin] Démarrage du tableau de bord...');

    // 1. Récupérer les commandes actives
    const activeOrders = await fetchActiveOrders();
    console.log('📋 Commandes actives:', activeOrders);

    // 2. S'abonner aux mises à jour en temps réel
    const unsubscribe = subscribeToOrderUpdates((order) => {
        console.log('📡 Mise à jour:', order);

        // Mettre à jour l'interface
        // updateUI(order);

        // Mettre à jour la carte
        // displayDriverOnMap(map, order);
    });

    // 3. Nettoyer au démontage
    // return unsubscribe;
}

// Export pour utilisation dans la console
if (typeof window !== 'undefined') {
    (window as any).adminTracking = {
        subscribe: subscribeToOrderUpdates,
        fetchActive: fetchActiveOrders,
        fetchHistory: fetchDriverHistory,
        getStats: getDriverStats,
        example: adminExample
    };

    console.log('📡 Fonctions admin disponibles:');
    console.log('   window.adminTracking.subscribe(callback)');
    console.log('   window.adminTracking.fetchActive()');
    console.log('   window.adminTracking.fetchHistory(driverId)');
    console.log('   window.adminTracking.getStats(driverId)');
    console.log('   window.adminTracking.example()');
}
