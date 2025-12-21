-- 🛠️ SCRIPT DE RÉPARATION ET TEST
-- ================================================================

-- 1. AJOUT DES COLONNES MANQUANTES (Si elles n'existent pas)
--    Cela permet de s'assurer que la table `orders` a bien la structure attendue par l'application.

DO $$
BEGIN
    -- Ajout de pickup_contact_name (Utilisé pour 'clientName')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pickup_contact_name') THEN
        ALTER TABLE orders ADD COLUMN pickup_contact_name text;
    END IF;

    -- Ajout de delivery_contact_name (Optionnel mais utile)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_contact_name') THEN
        ALTER TABLE orders ADD COLUMN delivery_contact_name text;
    END IF;

    -- Ajout de pickup_contact_phone (Pour contacter le client)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pickup_contact_phone') THEN
        ALTER TABLE orders ADD COLUMN pickup_contact_phone text;
    END IF;

    -- Ajout de delivery_contact_phone (Pour contacter le destinataire)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_contact_phone') THEN
        ALTER TABLE orders ADD COLUMN delivery_contact_phone text;
    END IF;

    -- Ajout de notes (Instructions spéciales)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='notes') THEN
        ALTER TABLE orders ADD COLUMN notes text;
    END IF;
END $$;

-- ================================================================
-- 2. CRÉATION DES COMMANDES DE TEST
-- ================================================================

-- 📦 COMMANDE 1 : En attente d'acceptation (PENDING)
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
    18.90,
    'Menu déjeuner - À livrer chaud',
    NOW()
);

-- ================================================================
-- 📊 VÉRIFICATIONS (Optionnel)
-- ================================================================
SELECT id, status, pickup_contact_name, price, created_at FROM orders WHERE status = 'pending_acceptance' ORDER BY created_at DESC LIMIT 5;
