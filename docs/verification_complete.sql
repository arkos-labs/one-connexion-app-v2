-- ============================================
-- SCRIPT DE VÉRIFICATION COMPLÈTE
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Vérifier que toutes les colonnes nécessaires existent
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND column_name IN (
        'driver_id',
        'arrived_pickup_at',
        'picked_up_at',
        'delivered_at',
        'driver_current_lat',
        'driver_current_lng',
        'proof_type',
        'proof_data'
    )
ORDER BY column_name;

-- 2. Vérifier les politiques RLS actives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- 3. Vérifier l'état de la table drivers
SELECT 
    id,
    first_name,
    last_name,
    is_online,
    availability_status,
    current_lat,
    current_lng,
    last_location_update
FROM drivers
ORDER BY updated_at DESC
LIMIT 5;

-- 4. Vérifier les commandes récentes et leurs statuts
SELECT 
    id,
    reference,
    status,
    driver_id,
    arrived_pickup_at,
    picked_up_at,
    delivered_at,
    driver_current_lat,
    driver_current_lng,
    created_at,
    updated_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- 5. Test de création d'une commande test
INSERT INTO orders (
    reference,
    status,
    pickup_address,
    pickup_lat,
    pickup_lng,
    delivery_address,
    delivery_lat,
    delivery_lng,
    price,
    pickup_contact_name,
    pickup_contact_phone
) VALUES (
    'TEST-' || FLOOR(RANDOM() * 10000)::TEXT,
    'pending_acceptance',
    '15 Rue de la Paix, Paris',
    48.8698,
    2.3317,
    '25 Avenue des Champs-Élysées, Paris',
    48.8738,
    2.2950,
    35.00,
    'Client Test',
    '+33612345678'
)
RETURNING id, reference, status;

-- 6. Vérifier que Realtime est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('orders', 'drivers');

-- ============================================
-- RÉSULTATS ATTENDUS :
-- ============================================
-- 1. Toutes les colonnes doivent exister
-- 2. Au moins une politique RLS doit être active
-- 3. Au moins un chauffeur doit être visible
-- 4. Les commandes doivent avoir les bons statuts
-- 5. Une nouvelle commande test doit être créée
-- 6. rowsecurity doit être 'true' pour les deux tables
