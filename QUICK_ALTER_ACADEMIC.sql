-- QUICK COPY-PASTE FOR YOUR EXISTING academic_records TABLE
-- Run this in Supabase SQL Editor

ALTER TABLE public.academic_records
ADD COLUMN IF NOT EXISTS semester_number INTEGER;

ALTER TABLE public.academic_records
ADD CONSTRAINT check_semester_number CHECK (semester_number > 0);

CREATE INDEX IF NOT EXISTS idx_academic_records_student_semester 
ON public.academic_records (student_id, semester_number);

CREATE OR REPLACE FUNCTION public.calculate_semester_number(year_number INTEGER, semester_position INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF semester_position NOT IN (1, 2) THEN
    RAISE EXCEPTION 'semester_position must be 1 or 2';
  END IF;
  RETURN ((year_number - 1) * 2) + semester_position;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS course_duration INTEGER DEFAULT 4;

CREATE POLICY "Allow all for academic_records" ON public.academic_records 
FOR ALL USING (true) WITH CHECK (true);
