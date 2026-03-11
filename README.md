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

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON students
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

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

### 6. Run the Development Server

```bash
npm run dev
```

### 7. Build for Production

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
