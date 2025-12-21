-- 🛡️ SECURITY FIX (RLS)
-- Le problème vient probablement du fait que votre chauffeur n'a pas la PERMISSION de voir les commandes.
-- Exécutez ce script pour autoriser les chauffeurs à voir et accepter les commandes.

-- 1. Activer la sécurité (si ce n'est pas déjà fait)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER LES ANCIENNES POLITIQUES (Pour éviter les conflits)
DROP POLICY IF EXISTS "Drivers can view pending orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view their own orders" ON orders;
DROP POLICY IF EXISTS "Drivers can update their own orders" ON orders;
DROP POLICY IF EXISTS "Public read access" ON orders; 

-- 3. CRÉER LES NOUVELLES POLITIQUES PERMISSIVES (POUR LE TEST)

-- A. LECTURE : Tout le monde authentifié peut voir les commandes en attente ET ses propres commandes
CREATE POLICY "Drivers view orders"
ON orders FOR SELECT
TO authenticated
USING (
    status = 'pending_acceptance' 
    OR driver_id = auth.uid()
);

-- B. MISE À JOUR : Un chauffeur peut mettre à jour une commande s'il l'accepte ou si c'est la sienne
CREATE POLICY "Drivers update orders"
ON orders FOR UPDATE
TO authenticated
USING (
    status = 'pending_acceptance' 
    OR driver_id = auth.uid()
)
WITH CHECK (
    driver_id = auth.uid() -- On vérifie qu'il s'assigne bien lui-même
    OR 
    status IN ('driver_accepted', 'in_progress', 'completed', 'cancelled')
);

-- C. INSERTION : (Optionnel, si les chauffeurs créent des commandes ?)
-- CREATE POLICY "Drivers create orders" ... (Pas nécessaire pour l'instant)

-- 4. VÉRIFICATION
-- Ce code ne retourne rien, mais si vous l'exécutez sans erreur, c'est bon.
