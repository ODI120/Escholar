# Escholar - Scholarship Management Platform

A modern, minimalistic admin dashboard for managing sponsored students' academic progress and financial support.

## Features

- 🎨 **Modern Minimalistic UI** - Clean, professional interface with dark/light theme support
- 👥 **Student Management** - Complete CRUD operations for beneficiary profiles
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 🔍 **Advanced Filtering** - Search and filter students by multiple criteria
- 💰 **Financial Tracking** - Monitor school fees and payment history
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔐 **Secure Authentication** - Admin sign-in and sign-up with Supabase

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **UI Framework**: Bootstrap 5
- **Backend**: Supabase
- **Deployment**: Netlify
- **Styling**: Custom CSS with CSS Variables

## Student Data Structure

Each student record includes:

- **Basic Info**: Full name, gender, phone number, profile picture
- **Academic**: School, department, level (100-500)
- **Guardian**: Parent name and phone number
- **Financial**: Account number, bank name, school fees
- **Status**: Active, graduated, inactive, suspended
- **Payments**: Payment history with dates and amounts

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd escholar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`.env` is git-ignored and must never be committed. Only `.env.example` belongs in
version control.

> **Credential rotation required.** A `.env` containing the Supabase project URL
> and anon key was previously committed to this repository. The anon key is
> public-by-design in the browser bundle, but rotate it anyway (Supabase
> dashboard > Settings > API > Rotate anon key), then update `.env` locally and
> the environment variables in Netlify. Rotate the service role key as well if it
> was ever placed in a committed file, and confirm RLS policies are applied (see
> `migrations/002_TIGHTEN_RLS.sql`) since the anon key alone must not grant access
> to other users' data.

### 4. Set up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  phone_number TEXT NOT NULL,
  profile_picture TEXT,
  school TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('100', '200', '300', '400', '500')),
  parent_name TEXT,
  parent_phone TEXT,
  account_number TEXT,
  bank_name TEXT,
  school_fees DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

-- Students: a student may only see and edit their own row; admins have full access
CREATE POLICY "Students read own row" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students update own row" ON students
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins manage students" ON students
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Payments: read-only for the owning student; admins have full access
CREATE POLICY "Students read own payments" ON payments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins manage payments" ON payments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_level ON students(level);
CREATE INDEX idx_students_school ON students(school);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_date ON payments(date);
```

### 5. Enable Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Configure your site URL and redirect URLs for your deployment
3. Enable email confirmation if desired

### 6. Configure Edge Functions

The `create-student` and `create-admin` functions require these secrets
(`supabase secrets set NAME=value`):

- `SERVICE_ROLE_KEY` — Supabase service role key
- `ANON_KEY` — Supabase anon key
- `ALLOWED_ORIGIN` — the exact deployed frontend origin allowed to call the
  functions (e.g. `https://escholar.netlify.app`). CORS is restricted to this
  origin; for local development set it to `http://localhost:5173`.

Privileges:

- `create-admin` requires the caller to be an admin with `role = 'super_admin'`.
- `create-student` requires the caller to have any row in `admins`, since
  enrolling beneficiaries is routine administrative work.
- `create-student` uses the admin-supplied password when one is provided, and
  otherwise generates a random temporary password that is returned once in the
  response. New students are flagged `must_change_password` and are forced to set
  a new password at first login.

### 7. Run the Development Server

```bash
npm run dev
```

### 8. Build for Production

```bash
npm run build
```

## Deployment to Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Color Scheme Customization

The app uses CSS custom properties for theming. You can modify colors in `src/styles/tokens.css`:

```css
:root {
  /* Primary Brand Color */
  --color-primary: #22C55E;
  --color-primary-hover: #16A34A;
  --color-primary-soft: #4ADE80;

  /* Background Colors */
  --bg-primary: #0B0F19;
  --bg-secondary: #111827;
  --bg-tertiary: #1F2937;

  /* Add more color customizations... */
}
```

## Features Overview

### Dashboard
- Overview statistics (total, active, graduated, inactive students)
- Recent students list
- Quick navigation to student management

### Students Management
- Add, edit, and view student profiles
- Advanced filtering and search
- Export student data to CSV
- Pagination for large datasets

### Student Details
- Comprehensive student profile view
- Parent/guardian information
- Financial information and payment history
- Quick action buttons (call student/parent, mark as paid)

### Authentication
- Secure admin sign-in and sign-up
- Protected routes with automatic redirects
- Session management with Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
