-- 🚚 SUIVI DES ÉTAPES (LIVRAISON GRANULAIRE)
-- Ajout des colonnes pour savoir quand le chauffeur arrive sur les lieux.

DO $$
BEGIN
    -- Heure d'arrivée au point de retrait
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='arrived_pickup_at') THEN
        ALTER TABLE orders ADD COLUMN arrived_pickup_at timestamptz;
    END IF;

    -- Heure d'arrivée au point de livraison
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='arrived_dropoff_at') THEN
        ALTER TABLE orders ADD COLUMN arrived_dropoff_at timestamptz;
    END IF;

    -- On ne modifie pas de contrainte CHECK sur le status car on suppose que c'est du TEXT libre ou qu'on va utiliser les valeurs existantes pour le moment, 
    -- MAIS pour être propre, si vous avez une contrainte, il faudrait la mettre à jour.
    -- On va insérer une commande de test pour vérifier que le statut 'arrived_pickup' passe.
END $$;
