-- 003_dev_permissive_policies.sql
-- DEVELOPMENT ONLY: Temporary permissive policies to restore UI access.
-- DO NOT apply to production. Replace with proper RLS policies matching your auth model.

-- Allow anyone (including anon key) to SELECT students and payments for development/testing
CREATE POLICY IF NOT EXISTS "dev_allow_select_students" ON public.students
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "dev_allow_select_payments" ON public.payments
  FOR SELECT
  USING (true);

-- Notes: remove this migration and replace with secure policies before deploying to production.
