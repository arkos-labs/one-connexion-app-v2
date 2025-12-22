-- ==============================================================================
-- 🛠️ UNIFIED SCHEMA FIX SCRIPT (CLIENT, ADMIN, CHAUFFEUR)
-- ==============================================================================
-- This script ensures the correct database structure for all user types.
-- It handles Profiles, Drivers, Orders, and the critical Auth Triggers.

-- 1. PROFILES TABLE (Central User Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('admin', 'driver', 'client')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. DRIVERS TABLE (Specific Driver Data)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    vehicle_type TEXT,
    vehicle_plate TEXT,
    license_number TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    availability_status TEXT DEFAULT 'offline', -- 'offline', 'online', 'busy'
    is_online BOOLEAN DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    last_location_update TIMESTAMPTZ,
    earnings_total INTEGER DEFAULT 0, -- In cents
    rating DECIMAL(3,2) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 3. ORDERS TABLE (Core Logic)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.profiles(id),
    driver_id UUID REFERENCES auth.users(id), -- Direct link to Auth User ID for RLS simplicity
    status TEXT DEFAULT 'pending_acceptance', -- 'pending_acceptance', 'accepted', 'pickup_in_progress', 'arrived_pickup', 'in_progress', 'delivered', 'cancelled'
    
    -- Locations
    pickup_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    delivery_address TEXT NOT NULL,
    delivery_lat DOUBLE PRECISION,
    delivery_lng DOUBLE PRECISION,
    
    -- Meta
    price DECIMAL(10,2) NOT NULL,
    distance_km DECIMAL(10,2),
    duration_min INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    arrived_pickup_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Details
    package_type TEXT,
    notes TEXT,
    pickup_contact_name TEXT,
    pickup_contact_phone TEXT,
    delivery_contact_name TEXT,
    delivery_contact_phone TEXT
);

-- Enable RLS and Realtime
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;

-- 4. HANDLE NEW USER TRIGGER (The Glue)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_vehicle_type TEXT;
BEGIN
    v_role := new.raw_user_meta_data->>'role';
    v_first_name := new.raw_user_meta_data->>'first_name';
    v_last_name := new.raw_user_meta_data->>'last_name';
    v_vehicle_type := new.raw_user_meta_data->>'vehicle_type';

    -- Default role if missing
    IF v_role IS NULL THEN v_role := 'client'; END IF;

    -- 1. Create Profile
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (new.id, new.email, v_first_name, v_last_name, v_role);

    -- 2. If Driver, Create Driver Entry
    IF v_role = 'driver' THEN
        INSERT INTO public.drivers (
            user_id,
            first_name,
            last_name,
            vehicle_type,
            status,
            availability_status,
            is_online
        ) VALUES (
            new.id,
            v_first_name,
            v_last_name,
            v_vehicle_type,
            'approved', -- Auto-approve for demo/dev speed
            'offline',
            false
        );
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. RLS POLICIES (Security)

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Drivers Policies
DROP POLICY IF EXISTS "Drivers view own" ON public.drivers;
CREATE POLICY "Drivers view own" ON public.drivers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all drivers" ON public.drivers FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Drivers update own status" ON public.drivers FOR UPDATE USING (user_id = auth.uid());
-- Allow public "online" drivers to be seen? Maybe just authenticated.
CREATE POLICY "Auth users see online drivers" ON public.drivers FOR SELECT USING (is_online = true);

-- Orders Policies
DROP POLICY IF EXISTS "Drivers view pending orders" ON public.orders;
CREATE POLICY "Drivers view pending orders" ON public.orders FOR SELECT USING (status = 'pending_acceptance');
CREATE POLICY "Drivers view assigned orders" ON public.orders FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Drivers update assigned orders" ON public.orders FOR UPDATE USING (driver_id = auth.uid());
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Clients view own orders" ON public.orders FOR SELECT USING (client_id = auth.uid());

-- 6. UTILITY: Create an Admin User (Idempotent-ish)
-- Note: You must sign up as 'admin@oneconnexion.com' manually, then run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@oneconnexion.com';
