-- 🛠️ OUTILS ADMIN & ASSIGNATION
-- ================================================================

-- 1. FONCTION D'ASSIGNATION (Obligatoire pour le site Admin)
CREATE OR REPLACE FUNCTION assign_driver_to_order(
    p_order_id UUID,
    p_driver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Commande introuvable';
    END IF;

    -- Mise à jour : Status becomes 'assigned' (not accepted yet)
    UPDATE orders 
    SET 
        driver_id = p_driver_id,
        status = 'assigned', 
        updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true);
END;
$$;


-- 2. RECUPERER LA LISTE DES CHAUFFEURS (Email + ID)
-- Lancez ça pour copier l'ID du chauffeur que vous voulez
SELECT id, email, created_at FROM auth.users;


-- 3. EXEMPLE : ASSIGNER MANUELLEMENT (Pour test rapide)
-- Remplacez 'ID_CHAUFFEUR' par l'ID copié ci-dessus
/*
SELECT assign_driver_to_order(
    (SELECT id FROM orders WHERE status = 'pending_acceptance' LIMIT 1),
    'ID_CHAUFFEUR' -- COPIEZ L'ID ICI
);
*/
