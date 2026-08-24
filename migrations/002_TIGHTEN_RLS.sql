-- ============================================================
-- 002_TIGHTEN_RLS.sql
-- Replaces the permissive policies (`USING (true)` /
-- `auth.role() = 'authenticated'`) with role-scoped policies:
--   * a student may only read/modify rows belonging to them
--   * admins (a row in public.admins) get full read/write access
-- Also adds the `must_change_password` flag used to force a
-- password change on a student's first login.
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================

-- ------------------------------------------------------------
-- Helper: is the current user an administrator?
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.students;
DROP POLICY IF EXISTS "Students read own row" ON public.students;
DROP POLICY IF EXISTS "Students update own row" ON public.students;
DROP POLICY IF EXISTS "Admins manage students" ON public.students;

CREATE POLICY "Students read own row" ON public.students
FOR SELECT USING (auth.uid() = id);

-- Students may clear their own must_change_password flag / edit their own
-- profile, but cannot create or delete rows.
CREATE POLICY "Students update own row" ON public.students
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins manage students" ON public.students
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- payments
-- ------------------------------------------------------------
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Students read own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;

CREATE POLICY "Students read own payments" ON public.payments
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins manage payments" ON public.payments
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- academic_records
-- ------------------------------------------------------------
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for academic_records" ON public.academic_records;
DROP POLICY IF EXISTS "Students read own academic_records" ON public.academic_records;
DROP POLICY IF EXISTS "Admins manage academic_records" ON public.academic_records;

CREATE POLICY "Students read own academic_records" ON public.academic_records
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins manage academic_records" ON public.academic_records
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
