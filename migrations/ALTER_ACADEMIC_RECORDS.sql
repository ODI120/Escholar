-- ALTER EXISTING academic_records TABLE
-- Copy and paste this into Supabase SQL Editor

-- ============================================
-- Add semester_number column to track semester order
-- ============================================
ALTER TABLE public.academic_records
ADD COLUMN IF NOT EXISTS semester_number INTEGER;

-- Add constraint to ensure valid semester numbers
ALTER TABLE public.academic_records
ADD CONSTRAINT check_semester_number CHECK (semester_number > 0);

-- ============================================
-- Create index for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_academic_records_student_semester 
ON public.academic_records (student_id, semester_number);

-- ============================================
-- Create helper function to calculate semester_number
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_semester_number(year_number INTEGER, semester_position INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF semester_position NOT IN (1, 2) THEN
    RAISE EXCEPTION 'semester_position must be 1 or 2';
  END IF;
  RETURN ((year_number - 1) * 2) + semester_position;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Create view that shows all expected semesters
-- ============================================
DROP VIEW IF EXISTS public.student_academic_progress CASCADE;

CREATE VIEW public.student_academic_progress AS
WITH semester_range AS (
  -- Generate all expected semesters for each student
  SELECT 
    s.id,
    s.full_name,
    s.course_duration,
    s.level,
    (s.course_duration * 2) as total_expected_semesters,
    generate_series(1, s.course_duration * 2) as semester_number
  FROM public.students s
),
semester_labels AS (
  -- Calculate semester label based on semester_number
  SELECT 
    id,
    full_name,
    course_duration,
    level,
    total_expected_semesters,
    semester_number,
    'Semester ' || 
    CASE 
      WHEN (semester_number - 1) % 2 = 0 THEN '1'
      ELSE '2'
    END || 
    ' - Year ' || 
    CEIL(semester_number::numeric / 2) as expected_semester_label
  FROM semester_range
),
recorded_semesters AS (
  -- Join with actual academic records
  SELECT 
    sl.id,
    sl.full_name,
    sl.course_duration,
    sl.total_expected_semesters,
    sl.semester_number,
    sl.expected_semester_label,
    ar.id as record_id,
    ar.gpa,
    ar.session,
    ar.semester,
    ar.evidence_url,
    ar.created_at
  FROM semester_labels sl
  LEFT JOIN public.academic_records ar ON 
    ar.student_id = sl.id AND 
    ar.semester_number = sl.semester_number
)
SELECT 
  id,
  full_name,
  course_duration,
  total_expected_semesters,
  semester_number,
  expected_semester_label,
  record_id,
  gpa,
  session,
  semester,
  evidence_url,
  created_at,
  CASE WHEN record_id IS NOT NULL THEN 'Recorded' ELSE 'Pending' END as status
FROM recorded_semesters
ORDER BY id, semester_number;

-- ============================================
-- Add RLS policies if they don't exist
-- ============================================
CREATE POLICY "Allow all for academic_records" ON public.academic_records 
FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Test queries (uncomment to verify setup)
-- ============================================

-- \\ View expected semesters for a student:
-- SELECT * FROM public.student_academic_progress 
-- WHERE id = '11111111-1111-1111-1111-111111111111'
-- ORDER BY semester_number;

-- \\ View current academic_records table:
-- SELECT * FROM public.academic_records LIMIT 10;

-- \\ Update existing records with semester_number (if you have old data):
-- UPDATE public.academic_records ar
-- SET semester_number = 
--   CASE 
--     WHEN ar.semester = '1st' THEN calculate_semester_number(1, 1)
--     WHEN ar.semester = '2nd' THEN calculate_semester_number(1, 2)
--     ELSE NULL
--   END
-- WHERE semester_number IS NULL;

-- ============================================
-- Add columns to students table if missing
-- ============================================
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS course_duration INTEGER DEFAULT 4;

-- Add constraint
ALTER TABLE public.students
ADD CONSTRAINT check_course_duration 
CHECK (course_duration > 0 AND course_duration <= 7);

-- Note: Ensure all students have course_duration set correctly
-- Example update:
-- UPDATE public.students SET course_duration = 4 WHERE course_duration IS NULL;
