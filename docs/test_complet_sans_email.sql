-- ============================================
-- SCRIPT DE TEST COMPLET - SANS VALIDATION EMAIL
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ÉTAPE 1 : Désactiver la validation email (TEMPORAIRE - POUR TESTS UNIQUEMENT)
-- Note: Ceci se fait dans Supabase Dashboard > Authentication > Settings
-- Email Auth > Confirm email = OFF

-- ÉTAPE 2 : Créer un compte chauffeur de test
DO $$
DECLARE
    v_user_id uuid;
    v_driver_id uuid;
BEGIN
    -- Supprimer l'ancien compte test s'il existe
    DELETE FROM auth.users WHERE email = 'chauffeur.test@oneconnexion.com';
    
    -- Créer un nouvel utilisateur dans auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'chauffeur.test@oneconnexion.com',
        crypt('Test1234!', gen_salt('bf')), -- Mot de passe: Test1234!
        NOW(), -- Email déjà confirmé
        '{"provider":"email","providers":["email"]}',
        '{"role":"driver"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE 'Utilisateur créé avec ID: %', v_user_id;

    -- Créer le profil chauffeur correspondant
    INSERT INTO public.drivers (
        id,
        user_id,
        first_name,
        last_name,
        phone,
        vehicle_type,
        vehicle_plate,
        license_number,
        status,
        availability_status,
        is_online,
        current_lat,
        current_lng,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        'Jean',
        'Testeur',
        '+33612345678',
        'Berline',
        'AB-123-CD',
        'TEST123456',
        'approved',
        'available',
        false,
        48.8566, -- Paris centre
        2.3522,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_driver_id;

    RAISE NOTICE 'Chauffeur créé avec ID: %', v_driver_id;
    RAISE NOTICE '✅ Compte test créé avec succès!';
    RAISE NOTICE 'Email: chauffeur.test@oneconnexion.com';
    RAISE NOTICE 'Mot de passe: Test1234!';
END $$;

-- ÉTAPE 3 : Créer une commande de test
DO $$
DECLARE
    v_order_id uuid;
BEGIN
    INSERT INTO public.orders (
        id,
        reference,
        status,
        pickup_address,
        pickup_lat,
        pickup_lng,
        pickup_contact_name,
        pickup_contact_phone,
        delivery_address,
        delivery_lat,
        delivery_lng,
        delivery_contact_name,
        delivery_contact_phone,
        price,
        distance_km,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'TEST-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
        'pending_acceptance',
        '15 Rue de Rivoli, 75001 Paris',
        48.8606,
        2.3376,
        'Client Test Pickup',
        '+33612345001',
        '25 Avenue des Champs-Élysées, 75008 Paris',
        48.8698,
        2.3078,
        'Client Test Delivery',
        '+33612345002',
        35.00,
        3.5,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_order_id;

    RAISE NOTICE '✅ Commande test créée avec ID: %', v_order_id;
    RAISE NOTICE 'Référence: TEST-XXXX';
    RAISE NOTICE 'Prix: 35.00€';
END $$;

-- ÉTAPE 4 : Vérifier que tout est en place
SELECT 
    '=== VÉRIFICATION FINALE ===' as section,
    '' as details
UNION ALL
SELECT 
    'Chauffeur test',
    CONCAT(first_name, ' ', last_name, ' (', email, ')')
FROM public.drivers d
JOIN auth.users u ON d.user_id = u.id
WHERE u.email = 'chauffeur.test@oneconnexion.com'
UNION ALL
SELECT 
    'Commandes disponibles',
    COUNT(*)::TEXT
FROM public.orders
WHERE status = 'pending_acceptance'
UNION ALL
SELECT 
    'Politiques RLS actives',
    COUNT(*)::TEXT
FROM pg_policies
WHERE tablename = 'orders';

-- ============================================
-- INSTRUCTIONS DE TEST
-- ============================================

/*
📋 ÉTAPES DE TEST COMPLET :

1. CONNEXION CHAUFFEUR
   - Ouvrir l'app chauffeur (localhost:5173)
   - Email: chauffeur.test@oneconnexion.com
   - Mot de passe: Test1234!
   - ✅ Vérifier que la connexion fonctionne

2. PASSER EN LIGNE
   - Cliquer sur le bouton pour passer en ligne
   - ✅ Vérifier que le statut passe à "online"
   - ✅ Vérifier que le point vert apparaît

3. ASSIGNER UNE COURSE (depuis l'admin)
   - Ouvrir le site admin (localhost:5174)
   - Aller sur la page Dispatch
   - ✅ Vérifier que le chauffeur "Jean Testeur" apparaît
   - Assigner la commande TEST-XXXX au chauffeur
   - ✅ Vérifier que la commande passe dans "En cours d'acceptation"

4. ACCEPTER LA COURSE (app chauffeur)
   - ✅ Vérifier que la modale de nouvelle course apparaît
   - Cliquer sur "Accepter"
   - ✅ Vérifier que la carte affiche l'itinéraire

5. SIMULER LE TRAJET
   - Cliquer sur le bouton ⚡ (Simuler le trajet)
   - ✅ Vérifier que le marqueur du chauffeur se déplace
   - ✅ Vérifier que l'admin voit la distance diminuer

6. ARRIVÉE AU POINT DE RETRAIT
   - Glisser "Je suis arrivé"
   - ✅ Vérifier que l'admin voit "Sur Place" (badge orange)
   - ✅ Vérifier que la distance est "0 m"

7. PRISE EN CHARGE
   - Glisser "Confirmer la Prise en charge"
   - ✅ Vérifier que l'admin voit "En Livraison" (badge violet)
   - ✅ Vérifier que la nouvelle destination s'affiche

8. SIMULER LA LIVRAISON
   - Cliquer sur ⚡ pour simuler le trajet vers la livraison
   - ✅ Vérifier que le chauffeur se déplace vers la destination

9. TERMINER LA COURSE
   - Glisser "Terminer la Course"
   - Choisir "Photo" ou "Signature"
   - Valider la preuve
   - ✅ Vérifier que l'admin voit "Livré" (badge vert)
   - ✅ Vérifier que les gains sont crédités (40% de 35€ = 14€)

10. VÉRIFIER LE RÉSUMÉ
    - ✅ Vérifier que le résumé de course s'affiche
    - ✅ Vérifier que les gains sont corrects
    - ✅ Vérifier que le chauffeur repasse en ligne

🎯 RÉSULTAT ATTENDU :
- Toutes les étapes doivent se dérouler sans erreur
- Les mises à jour doivent être instantanées (< 2 secondes)
- L'admin doit voir tous les changements de statut en temps réel
- Les gains doivent être de 14.00€ (40% de 35€)

⚠️ EN CAS DE PROBLÈME :
1. Ouvrir la console navigateur (F12)
2. Chercher les messages d'erreur (❌)
3. Vérifier les logs de synchronisation ([LocationSync], [OrderSlice])
4. Vérifier que Realtime est connecté (SUBSCRIBED)

🔧 POUR RÉINITIALISER :
- Réexécuter ce script pour recréer le compte et la commande
*/

-- ============================================
-- NETTOYAGE (optionnel)
-- ============================================

-- Décommenter pour supprimer le compte test et les commandes
/*
DELETE FROM auth.users WHERE email = 'chauffeur.test@oneconnexion.com';
DELETE FROM public.orders WHERE reference LIKE 'TEST-%';
*/
