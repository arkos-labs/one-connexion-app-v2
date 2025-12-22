-- ═══════════════════════════════════════════════════════════════════════════
-- 🚀 CONFIGURATION COMPLÈTE DE LA BASE DE DONNÉES POUR LIVRAISON EN TEMPS RÉEL
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- Ce script configure :
-- 1. Table driver_locations pour le tracking GPS en temps réel
-- 2. Activation du Realtime sur driver_locations et orders
-- 3. Politiques RLS (Row Level Security) complètes et sécurisées
--
-- Auteur: Expert Supabase/SQL
-- Date: 2025-12-21
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 0 : PRÉPARATION DES TABLES EXISTANTES
-- ═══════════════════════════════════════════════════════════════════════════

-- S'assurer que la colonne 'role' existe dans la table drivers (requis pour les politiques admin)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='role') THEN
        ALTER TABLE public.drivers ADD COLUMN role TEXT DEFAULT 'driver';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : CRÉATION/VÉRIFICATION DE LA TABLE driver_locations
-- ═══════════════════════════════════════════════════════════════════════════

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID NULL, -- Nullable pour permettre le tracking même sans course active
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Index pour améliorer les performances des requêtes
    CONSTRAINT driver_locations_latitude_check CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT driver_locations_longitude_check CHECK (longitude >= -180 AND longitude <= 180)
);

-- Créer des index pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_order_id ON public.driver_locations(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_updated_at ON public.driver_locations(updated_at DESC);

-- Créer un index composite pour les requêtes combinées
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_order ON public.driver_locations(driver_id, order_id);

-- Commentaires pour la documentation
COMMENT ON TABLE public.driver_locations IS 'Stocke les positions GPS des chauffeurs en temps réel';
COMMENT ON COLUMN public.driver_locations.driver_id IS 'Référence au chauffeur (auth.users)';
COMMENT ON COLUMN public.driver_locations.order_id IS 'Référence à la course active (nullable)';
COMMENT ON COLUMN public.driver_locations.latitude IS 'Latitude GPS (-90 à 90)';
COMMENT ON COLUMN public.driver_locations.longitude IS 'Longitude GPS (-180 à 180)';
COMMENT ON COLUMN public.driver_locations.updated_at IS 'Horodatage de la dernière mise à jour';

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : ACTIVATION DU REALTIME (TEMPS RÉEL)
-- ═══════════════════════════════════════════════════════════════════════════

-- Activer Realtime sur driver_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Activer Realtime sur orders (si pas déjà fait)
DO $$
BEGIN
    -- Vérifier si orders est déjà dans la publication
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : CONFIGURATION DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 3.1 : POLITIQUES POUR LA TABLE orders
-- ───────────────────────────────────────────────────────────────────────────

-- Activer RLS sur orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Drivers can view pending orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers view orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers update orders" ON public.orders;
DROP POLICY IF EXISTS "Public read access" ON public.orders;
DROP POLICY IF EXISTS "Admins full access" ON public.orders;

-- 📖 LECTURE : Les chauffeurs peuvent voir les commandes en attente ET leurs propres commandes
CREATE POLICY "orders_select_policy"
ON public.orders FOR SELECT
TO authenticated
USING (
    status = 'pending_acceptance' 
    OR driver_id = auth.uid()
);

-- ✏️ MISE À JOUR : Les chauffeurs peuvent mettre à jour UNIQUEMENT leurs propres commandes
CREATE POLICY "orders_update_by_driver"
ON public.orders FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- 👑 ADMIN : Accès complet pour les admins (lecture, insertion, mise à jour, suppression)
-- Note: Vous devez avoir une colonne 'role' dans auth.users ou une table users séparée
-- Alternative : Utiliser une fonction pour vérifier si l'utilisateur est admin
CREATE POLICY "orders_admin_full_access"
ON public.orders FOR ALL
TO authenticated
USING (
    -- Vérifier si l'utilisateur a le rôle admin
    -- Option 1 : Via metadata dans auth.users
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR
    -- Option 2 : Via une table drivers avec un champ role
    EXISTS (
        SELECT 1 FROM public.drivers 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- ───────────────────────────────────────────────────────────────────────────
-- 3.2 : POLITIQUES POUR LA TABLE driver_locations
-- ───────────────────────────────────────────────────────────────────────────

-- Activer RLS sur driver_locations
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "driver_locations_insert" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_update" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_select_admin" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_select_own" ON public.driver_locations;

-- 📝 INSERTION : Un chauffeur peut insérer SA propre position
CREATE POLICY "driver_locations_insert_own"
ON public.driver_locations FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

-- ✏️ MISE À JOUR : Un chauffeur peut mettre à jour SA propre position
CREATE POLICY "driver_locations_update_own"
ON public.driver_locations FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- 📖 LECTURE (Chauffeur) : Un chauffeur peut voir SA propre position
CREATE POLICY "driver_locations_select_own"
ON public.driver_locations FOR SELECT
TO authenticated
USING (driver_id = auth.uid());

-- 📖 LECTURE (Admin) : Les admins peuvent voir TOUTES les positions
CREATE POLICY "driver_locations_select_admin"
ON public.driver_locations FOR SELECT
TO authenticated
USING (
    -- Vérifier si l'utilisateur est admin
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR
    EXISTS (
        SELECT 1 FROM public.drivers 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : FONCTION UTILITAIRE POUR NETTOYER LES ANCIENNES POSITIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Cette fonction supprime les positions de plus de 24 heures
-- À exécuter périodiquement via un cron job Supabase
CREATE OR REPLACE FUNCTION public.cleanup_old_driver_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.driver_locations
    WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_driver_locations IS 'Supprime les positions GPS de plus de 24 heures';

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 5 : FONCTION POUR OBTENIR LA DERNIÈRE POSITION D'UN CHAUFFEUR
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_latest_driver_location(p_driver_id UUID)
RETURNS TABLE (
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT dl.latitude, dl.longitude, dl.updated_at
    FROM public.driver_locations dl
    WHERE dl.driver_id = p_driver_id
    ORDER BY dl.updated_at DESC
    LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.get_latest_driver_location IS 'Retourne la dernière position connue d''un chauffeur';

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 6 : TRIGGER POUR METTRE À JOUR updated_at AUTOMATIQUEMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- Créer la fonction trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Appliquer le trigger sur driver_locations
DROP TRIGGER IF EXISTS update_driver_locations_updated_at ON public.driver_locations;
CREATE TRIGGER update_driver_locations_updated_at
    BEFORE UPDATE ON public.driver_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 7 : VÉRIFICATIONS ET TESTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Vérifier que la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'driver_locations') THEN
        RAISE NOTICE '✅ Table driver_locations créée avec succès';
    ELSE
        RAISE EXCEPTION '❌ Erreur : Table driver_locations non créée';
    END IF;
END $$;

-- Vérifier que Realtime est activé
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename IN ('driver_locations', 'orders')
    ) THEN
        RAISE NOTICE '✅ Realtime activé sur driver_locations et orders';
    ELSE
        RAISE WARNING '⚠️ Vérifiez manuellement l''activation de Realtime';
    END IF;
END $$;

-- Vérifier que RLS est activé
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('driver_locations', 'orders')
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS activé sur driver_locations et orders';
    ELSE
        RAISE WARNING '⚠️ RLS pourrait ne pas être activé correctement';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 🎉 SCRIPT TERMINÉ AVEC SUCCÈS !
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- PROCHAINES ÉTAPES :
-- 1. Exécutez ce script dans l'éditeur SQL de Supabase
-- 2. Vérifiez les messages de succès (✅) dans les logs
-- 3. Testez l'insertion d'une position : 
--    INSERT INTO driver_locations (driver_id, latitude, longitude) 
--    VALUES (auth.uid(), 48.8566, 2.3522);
-- 4. Vérifiez le Realtime dans votre application
-- 5. Configurez un cron job pour cleanup_old_driver_locations() (optionnel)
--
-- NOTES IMPORTANTES :
-- - Pour les admins, assurez-vous que le champ 'role' existe dans votre table drivers
--   OU configurez user_metadata dans auth.users
-- - Les coordonnées GPS sont validées (-90/90 pour latitude, -180/180 pour longitude)
-- - Les anciennes positions peuvent être nettoyées avec cleanup_old_driver_locations()
-- ═══════════════════════════════════════════════════════════════════════════
