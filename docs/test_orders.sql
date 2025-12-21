-- ========================================
-- 🧪 COMMANDES DE TEST POUR LE SYSTÈME
-- ========================================
-- Ces commandes permettent de tester le flux complet :
-- Acceptation → Récupération → Livraison
-- avec suivi en temps réel pour l'admin

-- Commande 1 : Livraison de documents urgents (Paris Centre)
INSERT INTO orders (
    id,
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    price,
    created_at
) VALUES (
    gen_random_uuid(),
    'pending_acceptance',
    '12 Rue de Rivoli, 75001 Paris',
    48.8566,
    2.3522,
    '45 Avenue des Champs-Élysées, 75008 Paris',
    48.8698,
    2.3078,
    'Marie Dubois',
    25.50,
    NOW()
);

-- Commande 2 : Livraison de colis (La Défense)
INSERT INTO orders (
    id,
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    price,
    created_at
) VALUES (
    gen_random_uuid(),
    'pending_acceptance',
    '1 Parvis de La Défense, 92800 Puteaux',
    48.8920,
    2.2369,
    '15 Rue de la Paix, 75002 Paris',
    48.8689,
    2.3314,
    'Jean Martin',
    32.00,
    NOW()
);

-- Commande 3 : Livraison express (Montmartre)
INSERT INTO orders (
    id,
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    price,
    created_at
) VALUES (
    gen_random_uuid(),
    'pending_acceptance',
    'Place du Tertre, 75018 Paris',
    48.8867,
    2.3408,
    '10 Boulevard Saint-Germain, 75005 Paris',
    48.8534,
    2.3488,
    'Sophie Laurent',
    28.75,
    NOW()
);

-- Commande 4 : Livraison de repas (Quartier Latin)
INSERT INTO orders (
    id,
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    price,
    created_at
) VALUES (
    gen_random_uuid(),
    'pending_acceptance',
    '5 Rue de la Huchette, 75005 Paris',
    48.8527,
    2.3456,
    '20 Rue Mouffetard, 75005 Paris',
    48.8426,
    2.3505,
    'Pierre Durand',
    18.50,
    NOW()
);

-- Commande 5 : Livraison longue distance (Paris → Versailles)
INSERT INTO orders (
    id,
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    price,
    created_at
) VALUES (
    gen_random_uuid(),
    'pending_acceptance',
    'Gare Montparnasse, 75015 Paris',
    48.8409,
    2.3208,
    'Château de Versailles, 78000 Versailles',
    48.8049,
    2.1204,
    'Claire Rousseau',
    45.00,
    NOW()
);

-- ========================================
-- 📊 VÉRIFICATION DES COMMANDES CRÉÉES
-- ========================================
SELECT 
    id,
    status,
    pickup_contact_name AS client,
    pickup_address AS depart,
    delivery_address AS arrivee,
    price AS "prix (€)",
    created_at AS "créé le"
FROM orders
WHERE status = 'pending_acceptance'
ORDER BY created_at DESC
LIMIT 5;
