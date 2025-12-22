-- ==============================================================================
-- 🚀 CREATION COMPTE TEST (BYPASS SIGNUP DISABLED)
-- ==============================================================================
-- Ce script crée directement un utilisateur dans la base, contournant
-- la restriction "Signups not allowed" de l'API.

DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'test@driver.com';
    v_password text := 'test1234';
BEGIN
    -- 1. Nettoyage préventif
    DELETE FROM auth.users WHERE email = v_email;

    -- 2. Création directe dans auth.users
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
        is_sso_user,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        v_email,
        crypt(v_password, gen_salt('bf')),
        NOW(), -- ✅ Email confirmé automatiquement
        '{"provider":"email","providers":["email"]}',
        '{"role":"driver","first_name":"Jean","last_name":"Test","vehicle_type":"scooter"}',
        false,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_user_id;

    -- NOTE: Le trigger 'handle_new_user' que nous avons corrigé 
    -- va automatiquement créer le profil et l'entrée driver.

    RAISE NOTICE '✅ Compte créé avec succès !';
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE 'Password: %', v_password;
END $$;
