-- 🧪 COMMANDES DE TEST - COPIEZ-COLLEZ DANS SUPABASE SQL EDITOR
-- ================================================================

-- 📦 COMMANDE 1 : En attente d'acceptation (PENDING)
-- Cette commande apparaîtra immédiatement dans l'app chauffeur
INSERT INTO orders (
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    delivery_contact_name,
    pickup_contact_phone,
    delivery_contact_phone,
    price,
    notes,
    created_at
) VALUES (
    'pending_acceptance',
    '12 Rue de Rivoli, 75001 Paris',
    48.8566,
    2.3522,
    '45 Avenue des Champs-Élysées, 75008 Paris',
    48.8698,
    2.3078,
    'Marie Dubois',
    'Jean Martin',
    '+33 6 12 34 56 78',
    '+33 6 98 76 54 32',
    25.50,
    'Livraison urgente - Fragile',
    NOW()
);

-- 📦 COMMANDE 2 : Livraison de restaurant
INSERT INTO orders (
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    delivery_contact_name,
    pickup_contact_phone,
    delivery_contact_phone,
    price,
    notes,
    created_at
) VALUES (
    'pending_acceptance',
    'Le Comptoir du Relais, 9 Carrefour de l''Odéon, 75006 Paris',
    48.8520,
    2.3396,
    '28 Rue de Vaugirard, 75006 Paris',
    48.8485,
    2.3354,
    'Restaurant Le Comptoir',
    'Sophie Laurent',
    '+33 1 44 27 07 97',
    '+33 6 45 67 89 01',
    18.90,
    'Menu déjeuner - À livrer chaud',
    NOW()
);

-- 📦 COMMANDE 3 : Livraison longue distance
INSERT INTO orders (
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    delivery_contact_name,
    pickup_contact_phone,
    delivery_contact_phone,
    price,
    notes,
    created_at
) VALUES (
    'pending_acceptance',
    'Gare du Nord, 18 Rue de Dunkerque, 75010 Paris',
    48.8809,
    2.3553,
    'Aéroport Charles de Gaulle, Terminal 2E, 95700 Roissy-en-France',
    49.0097,
    2.5479,
    'Pierre Durand',
    'Air France Comptoir',
    '+33 6 23 45 67 89',
    '+33 1 70 36 39 50',
    45.00,
    'Documents importants - Vol à 16h30',
    NOW()
);

-- 📦 COMMANDE 4 : Petite course locale
INSERT INTO orders (
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    delivery_contact_name,
    pickup_contact_phone,
    delivery_contact_phone,
    price,
    notes,
    created_at
) VALUES (
    'pending_acceptance',
    'Pharmacie Monge, 134 Rue Monge, 75005 Paris',
    48.8427,
    2.3518,
    '15 Rue Mouffetard, 75005 Paris',
    48.8425,
    2.3495,
    'Pharmacie Monge',
    'Mme Rousseau',
    '+33 1 43 31 63 60',
    '+33 6 78 90 12 34',
    8.50,
    'Médicaments - Personne âgée',
    NOW()
);

-- ================================================================
-- 💡 NOTES D'UTILISATION :
-- ================================================================
-- 1. Ces commandes apparaîtront dans l'app chauffeur avec le statut "pending_acceptance"
-- 2. Le prix affiché au chauffeur sera 40% du prix total (commission)
-- 3. Pour tester le flux complet, acceptez une commande depuis l'app
-- 4. Les coordonnées GPS sont réelles pour Paris
-- 5. Vous pouvez modifier les adresses et coordonnées selon vos besoins

-- ================================================================
-- 🔧 COMMANDES UTILES POUR LE DÉBOGAGE :
-- ================================================================

-- Voir toutes les commandes en attente :
-- SELECT * FROM orders WHERE status = 'pending_acceptance' ORDER BY created_at DESC;

-- Voir toutes les commandes d'un chauffeur :
-- SELECT * FROM orders WHERE driver_id = 'VOTRE_DRIVER_ID' ORDER BY created_at DESC;

-- Supprimer toutes les commandes de test :
-- DELETE FROM orders WHERE pickup_contact_name LIKE '%TEST%' OR notes LIKE '%TEST%';

-- Réinitialiser une commande pour la retester :
-- UPDATE orders SET status = 'pending_acceptance', driver_id = NULL WHERE id = 'VOTRE_ORDER_ID';
