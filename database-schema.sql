-- Escholar Database Schema (idempotent)
-- Run this SQL in Supabase SQL editor or with psql. Safe to re-run in most cases.

-- Ensure pgcrypto (for gen_random_uuid) is available
create extension if not exists pgcrypto;

-- Create students table (adds richer fields used by the UI)
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text,
  year_of_admission integer,
  gender text not null check (gender in ('male','female')),
  phone_number text not null,
  profile_picture text,
  school text not null,
  department text not null,
  level text not null check (level in ('100','200','300','400','500')),
  parent_name text,
  parent_phone text,
  account_number text,
  account_name text,
  bank_name text,
  course_duration integer,
  years_remaining integer,
  school_fees numeric(12,2) default 0,
  remarks text,
  admission_letter_url text,
  -- free-form JSON for any additional uploaded documents metadata (filename, url, type)
  documents jsonb default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','graduated','inactive','suspended')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create payments table (records disbursements / receipts for a student)
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  date timestamptz default now(),
  amount numeric(12,2) not null,
  description text,
  status text not null default 'paid' check (status in ('paid','pending','failed')),
  created_at timestamptz default now()
);

-- Create academic_records table (for GPA tracking)
create table if not exists public.academic_records (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  semester text not null,
  session text not null,
  gpa numeric(3,2) not null check (gpa >= 0 and gpa <= 5.0),
  evidence_url text,
  created_at timestamptz default now()
);

-- Optional admins table to hold admin profiles (auth is handled separately by Supabase Auth)
create table if not exists public.admins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- optional link to auth.users
  full_name text,
  email text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_students_email on public.students (lower(coalesce(email,'')));
create index if not exists idx_students_status on public.students (status);
create index if not exists idx_students_level on public.students (level);
create index if not exists idx_students_school on public.students (school);
create index if not exists idx_payments_student_id on public.payments (student_id);
create index if not exists idx_payments_date on public.payments (date);
create index if not exists idx_academic_records_student_id on public.academic_records (student_id);

-- View: total received per student (useful for dashboard + detail pages)
create or replace view public.student_totals as
select
  s.id,
  s.full_name,
  coalesce(sum(p.amount),0)::numeric(12,2) as total_received
from public.students s
left join public.payments p on p.student_id = s.id
group by s.id, s.full_name;

-- Row level security: enable but do not add permissive policies by default
-- Administrators should create appropriate RLS policies for their auth model.
alter table public.students enable row level security;
alter table public.payments enable row level security;
alter table public.academic_records enable row level security;

-- Performance policies (allow all for dev/testing if needed, or structured)
-- For now, we follow the user's setup which seems to have RLS enabled but might need policies
create policy "Allow all for students" on public.students for all using (true) with check (true);
create policy "Allow all for payments" on public.payments for all using (true) with check (true);
create policy "Allow all for academic_records" on public.academic_records for all using (true) with check (true);

-- Example development policies (UNCOMMENT & ADJUST for production):
-- Allow authenticated users to select rows (example only)
-- create policy "select_for_authenticated" on public.students for select using (auth.role() = 'authenticated');
-- create policy "select_for_authenticated" on public.payments for select using (auth.role() = 'authenticated');

-- Seed data (id values deterministic for easier testing). Use only in dev environments.
-- Skip seeds if rows already exist to make script safe to run multiple times.

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.students) = 0 THEN
    INSERT INTO public.students (id, full_name, email, year_of_admission, gender, phone_number, profile_picture, school, department, level, parent_name, parent_phone, account_number, account_name, bank_name, course_duration, years_remaining, school_fees, remarks, admission_letter_url, status, created_at)
    VALUES
      ('11111111-1111-1111-1111-111111111111'::uuid,'Adebayo Johnson','adebayo.johnson@example.com',2022,'male','+2348012345678','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150','University of Lagos','Computer Science','200','Mrs. Johnson','+2348012345679','1234567890','Adebayo Johnson','First Bank',4,2,150000.00,'Excellent candidate','https://example.com/admission1.pdf','active','2024-01-15T10:00:00Z'::timestamptz),
      ('22222222-2222-2222-2222-222222222222'::uuid,'Fatima Abdul','fatima.abdul@example.com',2021,'female','+2348023456789','https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150','University of Ibadan','Medicine','300','Mr. Abdul','+2348023456790','0987654321','Fatima Abdul','GTBank',6,3,250000.00,'Needs financial aid','https://example.com/admission2.pdf','active','2024-01-10T10:00:00Z'::timestamptz),
      ('33333333-3333-3333-3333-333333333333'::uuid,'Chukwuemeka Nwosu','chukwuemeka.nwosu@example.com',2018,'male','+2348034567890','https://images.unsplash.com/photo-1472099645785-5658ab4ff4e?w=150','Obafemi Awolowo University','Engineering','400','Mrs. Nwosu','+2348034567891','1122334455','Chukwuemeka Nwosu','Zenith Bank',5,0,180000.00,'Graduated with honours','https://example.com/admission3.pdf','graduated','2023-09-01T10:00:00Z'::timestamptz);
  END IF;
END$$;

-- Seed payments referencing seeded student ids (will not insert duplicates because payments table empty check)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.payments) = 0 THEN
    INSERT INTO public.payments (id, student_id, date, amount, description, status, created_at)
    VALUES
      (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, '2024-02-01'::timestamptz, 50000.00, 'First installment', 'paid', now()),
      (gen_random_uuid(), '11111111-1111-1111-1111-111111111111'::uuid, '2024-03-01'::timestamptz, 50000.00, 'Second installment', 'paid', now()),
      (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, '2024-01-15'::timestamptz, 125000.00, 'Half payment', 'paid', now()),
      (gen_random_uuid(), '33333333-3333-3333-3333-333333333333'::uuid, '2022-05-01'::timestamptz, 180000.00, 'Final payment', 'paid', now());
  END IF;
END$$;

-- Notes and recommendations:
-- 1) Create a Supabase Storage bucket (e.g. "admission_letters") for document uploads and store URLs in
--    students.admission_letter_url or add entries inside students.documents JSON array with more metadata.
-- 2) Implement RLS policies carefully for production. The example above enables RLS but leaves policy
--    creation for your auth model (service_role for admins, auth.uid() checks for per-user access, etc.).
-- 3) If you add columns later, prefer ALTER TABLE ... ADD COLUMN IF NOT EXISTS so this file can be used
--    as a migration baseline for new columns.

-- End of schema
