
-- Fix RLS for store registration

-- 1. Allow authenticated users to create a store where they are the owner
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stores' 
        AND policyname = 'Users can create their own store'
    ) THEN
        CREATE POLICY "Users can create their own store"
        ON public.stores FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = owner_id);
    END IF;
END
$$;

-- 2. Allow authenticated users to see their own store
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stores' 
        AND policyname = 'Owners can view their own store'
    ) THEN
        CREATE POLICY "Owners can view their own store"
        ON public.stores FOR SELECT
        TO authenticated
        USING (auth.uid() = owner_id);
    END IF;
END
$$;

-- 3. Allow public to see active stores (for the catalog)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stores' 
        AND policyname = 'Anyone can view active stores'
    ) THEN
        CREATE POLICY "Anyone can view active stores"
        ON public.stores FOR SELECT
        TO anon, authenticated
        USING (active = true);
    END IF;
END
$$;

-- 4. Fix RLS for store_users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'store_users' 
        AND policyname = 'Users can link themselves to a store'
    ) THEN
        CREATE POLICY "Users can link themselves to a store"
        ON public.store_users FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 5. Fix RLS for store_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'store_settings' 
        AND policyname = 'Owners can manage their store settings'
    ) THEN
        CREATE POLICY "Owners can manage their store settings"
        ON public.store_settings FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.stores
                WHERE stores.id = store_settings.store_id
                AND stores.owner_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.stores
                WHERE stores.id = store_settings.store_id
                AND stores.owner_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- 6. Allow initial settings creation during registration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'store_settings' 
        AND policyname = 'Allow initial settings creation'
    ) THEN
        CREATE POLICY "Allow initial settings creation"
        ON public.store_settings FOR INSERT
        TO authenticated
        WITH CHECK (true); -- The logic in step 5 already covers updates/deletes securely
    END IF;
END
$$;
