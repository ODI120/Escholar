-- 002_rls_policies.sql
-- Secure Row Level Security (RLS) policy examples for Escholar
-- INTENT: Allow authenticated users and platform admins to manage/read records.
-- Review and adapt to your authentication model before applying in production.

-- Drop existing example policies (idempotent)
DROP POLICY IF EXISTS "students_select_authenticated" ON public.students;
DROP POLICY IF EXISTS "students_insert_authenticated" ON public.students;
DROP POLICY IF EXISTS "students_update_owner_or_admin" ON public.students;
DROP POLICY IF EXISTS "payments_select_owner_or_admin" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_owner_or_admin" ON public.payments;

-- Students: allow SELECT for authenticated users, INSERT/UPDATE only for admins or service role
CREATE POLICY "students_select_authenticated" ON public.students
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "students_insert_admins_or_service" ON public.students
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id::text = auth.uid()::text)
  );

CREATE POLICY "students_update_admins_or_service" ON public.students
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id::text = auth.uid()::text)
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id::text = auth.uid()::text)
  );

-- Payments: allow SELECT for authenticated users, INSERT only for admins or service role
CREATE POLICY "payments_select_authenticated" ON public.payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "payments_insert_admins_or_service" ON public.payments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id::text = auth.uid()::text)
  );

-- Notes:
-- - `auth.uid()` and `auth.role()` are available in Supabase RLS expressions.
-- - The `admins` table should store `user_id` values that map to `auth.users` `id` (the `sub` claim).
-- - If you want authenticated users (non-admins) to read records, add a policy that allows
--   `auth.role() = 'authenticated'` with appropriate checks; avoid allowing anon/public access.
-- - Test these policies in a staging environment. Use `migrations/003_dev_permissive_policies.sql`
--   only for local development when you need a quick permissive workaround.
