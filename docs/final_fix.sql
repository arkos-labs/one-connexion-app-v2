-- 🚨 SCRIPT DE DÉPANNAGE ULTIME
-- Ce script résout TOUS les problèmes de permissions ET de structure de base de données.

-- 1. Nettoyage de sécurité
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- On supprime TOUTES les anciennes politiques pour repartir à zéro
DROP POLICY IF EXISTS "Drivers view orders" ON orders;
DROP POLICY IF EXISTS "Drivers update orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view pending orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view their own orders" ON orders;
DROP POLICY IF EXISTS "Drivers can update their own orders" ON orders;
DROP POLICY IF EXISTS "Public read access" ON orders;
DROP POLICY IF EXISTS "Authenticated users all access" ON orders;

-- 2. CRÉATION D'UNE "SUPER RÈGLE" POUR LE DÉVELOPPEMENT
-- Cette règle dit : "Si tu es connecté, tu peux TOUT faire sur les commandes".
CREATE POLICY "Authenticated users all access"
ON orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. AJOUT DES COLONNES MANQUANTES (CRITIQUE POUR L'APPLI CHAUFFEUR)
-- L'application tente de mettre à jour ces colonnes. Si elles manquent, l'action "Accepter" échoue.
DO $$
BEGIN
    -- Géolocalisation Chauffeur
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='driver_current_lat') THEN
        ALTER TABLE orders ADD COLUMN driver_current_lat double precision;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='driver_current_lng') THEN
        ALTER TABLE orders ADD COLUMN driver_current_lng double precision;
    END IF;

    -- Timestamps du cycle de vie
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='accepted_at') THEN
        ALTER TABLE orders ADD COLUMN accepted_at timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='picked_up_at') THEN
        ALTER TABLE orders ADD COLUMN picked_up_at timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='arrived_pickup_at') THEN
        ALTER TABLE orders ADD COLUMN arrived_pickup_at timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='arrived_dropoff_at') THEN
        ALTER TABLE orders ADD COLUMN arrived_dropoff_at timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivered_at') THEN
        ALTER TABLE orders ADD COLUMN delivered_at timestamptz;
    END IF;

    -- Preuve de livraison
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='proof_type') THEN
        ALTER TABLE orders ADD COLUMN proof_type text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='proof_data') THEN
        ALTER TABLE orders ADD COLUMN proof_data text;
    END IF;

    -- Infos Client (déjà dans fix_and_test mais on assure ici)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pickup_contact_name') THEN
        ALTER TABLE orders ADD COLUMN pickup_contact_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pickup_contact_phone') THEN
        ALTER TABLE orders ADD COLUMN pickup_contact_phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='notes') THEN
        ALTER TABLE orders ADD COLUMN notes text;
    END IF;
END $$;

-- 4. CRÉATION D'UNE COMMANDE DE TEST PARFAITE
INSERT INTO orders (
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    pickup_contact_name,
    pickup_contact_phone,
    price,
    notes,
    created_at
) VALUES (
    'pending_acceptance',
    'Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
    48.8584,
    2.2945,
    'Musée du Louvre, Rue de Rivoli, 75001 Paris',
    48.8606,
    2.3376,
    'Jean Valjean',
    '+33 6 00 00 00 00',
    50.00,
    'TEST FINAL - DOIT ÊTRE VISIBLE',
    NOW()
);

-- 5. VÉRIFICATION
SELECT id, status, driver_current_lat, created_at FROM orders WHERE notes = 'TEST FINAL - DOIT ÊTRE VISIBLE';
