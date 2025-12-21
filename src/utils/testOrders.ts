import { supabase } from '@/lib/supabase';

/**
 * 🧪 Générateur de commandes de test
 * Permet de créer rapidement des commandes pour tester le système de tracking
 */

interface TestOrder {
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    deliveryAddress: string;
    deliveryLat: number;
    deliveryLng: number;
    clientName: string;
    price: number;
}

const TEST_ORDERS: TestOrder[] = [
    {
        pickupAddress: '12 Rue de Rivoli, 75001 Paris',
        pickupLat: 48.8566,
        pickupLng: 2.3522,
        deliveryAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
        deliveryLat: 48.8698,
        deliveryLng: 2.3078,
        clientName: 'Marie Dubois',
        price: 25.50
    },
    {
        pickupAddress: '1 Parvis de La Défense, 92800 Puteaux',
        pickupLat: 48.8920,
        pickupLng: 2.2369,
        deliveryAddress: '15 Rue de la Paix, 75002 Paris',
        deliveryLat: 48.8689,
        deliveryLng: 2.3314,
        clientName: 'Jean Martin',
        price: 32.00
    },
    {
        pickupAddress: 'Place du Tertre, 75018 Paris',
        pickupLat: 48.8867,
        pickupLng: 2.3408,
        deliveryAddress: '10 Boulevard Saint-Germain, 75005 Paris',
        deliveryLat: 48.8534,
        deliveryLng: 2.3488,
        clientName: 'Sophie Laurent',
        price: 28.75
    },
    {
        pickupAddress: '5 Rue de la Huchette, 75005 Paris',
        pickupLat: 48.8527,
        pickupLng: 2.3456,
        deliveryAddress: '20 Rue Mouffetard, 75005 Paris',
        deliveryLat: 48.8426,
        deliveryLng: 2.3505,
        clientName: 'Pierre Durand',
        price: 18.50
    },
    {
        pickupAddress: 'Gare Montparnasse, 75015 Paris',
        pickupLat: 48.8409,
        pickupLng: 2.3208,
        deliveryAddress: 'Château de Versailles, 78000 Versailles',
        deliveryLat: 48.8049,
        deliveryLng: 2.1204,
        clientName: 'Claire Rousseau',
        price: 45.00
    }
];

/**
 * Crée une commande de test dans Supabase
 */
export async function createTestOrder(orderIndex: number = 0): Promise<void> {
    const order = TEST_ORDERS[orderIndex % TEST_ORDERS.length];

    console.log(`🧪 [TestOrders] Création de la commande test #${orderIndex + 1}...`);

    try {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                status: 'pending_acceptance',
                pickup_address: order.pickupAddress,
                pickup_lat: order.pickupLat,
                pickup_lng: order.pickupLng,
                delivery_address: order.deliveryAddress,
                delivery_lat: order.deliveryLat,
                delivery_lng: order.deliveryLng,
                pickup_contact_name: order.clientName,
                price: order.price,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ [TestOrders] Commande créée avec succès:`, {
            id: data.id,
            client: order.clientName,
            prix: `${order.price}€`
        });
    } catch (error) {
        console.error('❌ [TestOrders] Erreur création commande:', error);
        throw error;
    }
}

/**
 * Crée les 5 commandes de test d'un coup
 */
export async function createAllTestOrders(): Promise<void> {
    console.log('🧪 [TestOrders] Création de 5 commandes de test...');

    try {
        const orders = TEST_ORDERS.map(order => ({
            status: 'pending_acceptance',
            pickup_address: order.pickupAddress,
            pickup_lat: order.pickupLat,
            pickup_lng: order.pickupLng,
            delivery_address: order.deliveryAddress,
            delivery_lat: order.deliveryLat,
            delivery_lng: order.deliveryLng,
            pickup_contact_name: order.clientName,
            price: order.price,
            created_at: new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from('orders')
            .insert(orders)
            .select();

        if (error) throw error;

        console.log(`✅ [TestOrders] ${data.length} commandes créées avec succès!`);
        data.forEach((order, index) => {
            console.log(`   ${index + 1}. ${order.pickup_contact_name} - ${order.price}€`);
        });
    } catch (error) {
        console.error('❌ [TestOrders] Erreur création commandes:', error);
        throw error;
    }
}

/**
 * Supprime toutes les commandes en attente (pour nettoyer les tests)
 */
export async function clearPendingTestOrders(): Promise<void> {
    console.log('🧹 [TestOrders] Nettoyage des commandes en attente...');

    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('status', 'pending_acceptance');

        if (error) throw error;

        console.log('✅ [TestOrders] Commandes en attente supprimées');
    } catch (error) {
        console.error('❌ [TestOrders] Erreur nettoyage:', error);
        throw error;
    }
}

// Exposer les fonctions globalement pour les tests en console
if (typeof window !== 'undefined') {
    (window as any).testOrders = {
        createOne: createTestOrder,
        createAll: createAllTestOrders,
        clear: clearPendingTestOrders
    };

    console.log('🧪 Fonctions de test disponibles:');
    console.log('   window.testOrders.createOne(index)  - Créer 1 commande');
    console.log('   window.testOrders.createAll()       - Créer 5 commandes');
    console.log('   window.testOrders.clear()           - Nettoyer les tests');
}
