-- 001_create_schema.sql
-- Idempotent schema creation for Escholar (based on database-schema.sql)

-- Ensure pgcrypto for gen_random_uuid() if desired by operators
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- students table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  year_of_admission integer,
  gender text,
  phone_number text,
  profile_picture text,
  school text,
  department text,
  level text,
  parent_name text,
  parent_phone text,
  account_number text,
  bank_name text,
  school_fees numeric DEFAULT 0,
  remarks text,
  admission_letter_url text,
  documents jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- payments table (student transactions / disbursements)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  date date DEFAULT now(),
  amount numeric DEFAULT 0,
  description text,
  status text DEFAULT 'paid',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- admins table (simple RBAC mapping)
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS students_email_idx ON public.students (email);
CREATE INDEX IF NOT EXISTS students_year_idx ON public.students (year_of_admission);
CREATE INDEX IF NOT EXISTS payments_student_idx ON public.payments (student_id);

-- Aggregated student totals view
CREATE OR REPLACE VIEW public.student_totals AS
SELECT
  s.id AS student_id,
  COALESCE(SUM(p.amount), 0) AS total_received,
  COALESCE(s.school_fees, 0) AS total_expected,
  (COALESCE(SUM(p.amount), 0) >= COALESCE(s.school_fees, 0)) AS fully_paid
FROM public.students s
LEFT JOIN public.payments p ON p.student_id = s.id
GROUP BY s.id, s.school_fees;

-- Enable RLS (policies defined in a separate migration)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Seed data: only insert when tables are empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students) THEN
    INSERT INTO public.students (id, full_name, email, year_of_admission, gender, phone_number, profile_picture, school, department, level, parent_name, parent_phone, account_number, bank_name, school_fees, remarks, admission_letter_url, status, created_at)
    VALUES
      ('11111111-1111-1111-1111-111111111111', 'Adebayo Johnson', 'adebayo.johnson@example.com', 2022, 'male', '+2348012345678', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'University of Lagos', 'Computer Science', '200', 'Mrs. Johnson', '+2348012345679', '1234567890', 'First Bank', 150000, 'Excellent candidate', 'https://example.com/admission1.pdf', 'active', now()),
      ('22222222-2222-2222-2222-222222222222', 'Fatima Abdul', 'fatima.abdul@example.com', 2021, 'female', '+2348023456789', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'University of Ibadan', 'Medicine', '300', 'Mr. Abdul', '+2348023456790', '0987654321', 'GTBank', 250000, 'Needs financial aid', 'https://example.com/admission2.pdf', 'active', now()),
      ('33333333-3333-3333-3333-333333333333', 'Chukwuemeka Nwosu', 'chukwuemeka.nwosu@example.com', 2018, 'male', '+2348034567890', 'https://images.unsplash.com/photo-1472099645785-5658ab4ff4e?w=150&h=150&fit=crop&crop=face', 'Obafemi Awolowo University', 'Engineering', '400', 'Mrs. Nwosu', '+2348034567891', '1122334455', 'Zenith Bank', 180000, 'Graduated with honours', 'https://example.com/admission3.pdf', 'graduated', now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.payments) THEN
    INSERT INTO public.payments (id, student_id, date, amount, description, status, created_at)
    VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '2024-02-01', 50000, 'First installment', 'paid', now()),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '2024-03-01', 50000, 'Second installment', 'paid', now()),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '2024-01-15', 125000, 'Half payment', 'paid', now()),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '2022-05-01', 180000, 'Final payment', 'paid', now());
  END IF;
END$$;
