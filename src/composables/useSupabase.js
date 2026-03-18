import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key')

// Determine whether to use mock data
export const isMock = !supabaseUrl || supabaseUrl.includes('placeholder')

// Auth helpers
export const useSupabaseAuth = () => {
  const signUp = async (email, password, metadata = {}) => {
    if (isMock) return { data: null, error: { message: 'Mock mode: signup not available' } }
    try {
      // metadata is stored in user_metadata by default
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Supabase signUp failed' } }
    }
  }

  const signIn = async (email, password) => {
    if (isMock) return { data: null, error: { message: 'Mock mode: signIn not available' } }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (data?.session?.access_token) {
        localStorage.setItem('supabase.auth.token', data.session.access_token)
      }
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Supabase signIn failed' } }
    }
  }

  const signOut = async () => {
    if (isMock) {
      localStorage.removeItem('supabase.auth.token')
      return { error: null }
    }
    try {
      const { error } = await supabase.auth.signOut()
      localStorage.removeItem('supabase.auth.token')
      return { error }
    } catch (err) {
      localStorage.removeItem('supabase.auth.token')
      return { error: { message: err.message || 'Unable to sign out.' } }
    }
  }

  const getCurrentUser = () => {
    if (isMock) return { data: { user: null }, error: null }
    try {
      return supabase.auth.getUser()
    } catch (err) {
      return { data: { user: null }, error: null }
    }
  }

  if (!isMock) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem('supabase.auth.token', session.access_token)
      } else {
        localStorage.removeItem('supabase.auth.token')
      }
    })
  }

  return { signUp, signIn, signOut, getCurrentUser }
}

// Students helpers
export const useSupabaseStudents = () => {
  const uploadAcademicEvidence = async (studentId, file) => {
    if (!file || !studentId) return { url: '', error: null }

    // Mock mode: return a local preview URL only (not persisted)
    if (isMock) {
      try {
        return { url: URL.createObjectURL(file), error: null }
      } catch (err) {
        return { url: '', error: { message: err?.message || 'Unable to create preview URL.' } }
      }
    }

    try {
      // IMPORTANT: this must match your Supabase Storage bucket name exactly
      const bucket = 'academic-evidence'
      const safeName = String(file.name || 'evidence')
        .replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_')
      const path = `${studentId}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined
        })

      if (uploadError) return { url: '', error: uploadError }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { url: data?.publicUrl || '', error: null }
    } catch (err) {
      return { url: '', error: { message: err?.message || 'Evidence upload failed.' } }
    }
  }

  // Mock data for development
  const mockStudents = [
    {
      id: '1',
      full_name: 'John Doe',
      school: 'University of Lagos',
      department: 'Computer Science',
      level: '300',
      course_duration: 4,
      years_remaining: 1,
      gender: 'male',
      phone_number: '08012345678',
      year_of_admission: 2021,
      account_number: '1234567890',
      account_name: 'John Doe',
      bank_name: 'First Bank',
      school_fees: 150000,
      profile_picture: 'https://i.pravatar.cc/150?u=1',
      admission_letter_url: 'https://example.com/admission1.pdf',
      payments: [
        { id: 'p1', date: '2023-01-15', amount: 150000, description: 'First semester fees', status: 'paid' },
        { id: 'p2', date: '2023-08-20', amount: 150000, description: 'Second semester fees', status: 'paid' }
      ],
      academic_records: [
        { id: 'a1', semester: '1st Semester', session: '2021/2022', gpa: 4.2, evidence_url: 'https://example.com/result1.pdf', created_at: '2022-02-10T10:00:00Z' }
      ],
      status: 'active',
      created_at: '2023-01-10T10:00:00Z'
    },
    {
      id: '2',
      full_name: 'Jane Smith',
      school: 'Ahmadu Bello University',
      department: 'Medicine',
      level: '200',
      course_duration: 6,
      years_remaining: 4,
      gender: 'female',
      phone_number: '07098765432',
      year_of_admission: 2022,
      account_number: '0987654321',
      account_name: 'Jane Smith',
      bank_name: 'GTBank',
      school_fees: 250000,
      profile_picture: 'https://i.pravatar.cc/150?u=2',
      admission_letter_url: 'https://example.com/admission2.pdf',
      payments: [
        { id: 'p3', date: '2023-02-10', amount: 250000, description: 'Session fees', status: 'paid' }
      ],
      academic_records: [],
      status: 'active',
      created_at: '2023-02-05T10:00:00Z'
    },
    {
      id: '3',
      full_name: 'Michael Johnson',
      school: 'Obafemi Awolowo University',
      department: 'Engineering',
      level: '500',
      course_duration: 5,
      years_remaining: 0,
      gender: 'male',
      phone_number: '08123456789',
      year_of_admission: 2018,
      account_number: '1122334455',
      account_name: 'Michael Johnson',
      bank_name: 'Zenith Bank',
      school_fees: 180000,
      profile_picture: 'https://i.pravatar.cc/150?u=3',
      admission_letter_url: 'https://example.com/admission3.pdf',
      payments: [
        { id: 'p4', date: '2022-05-01', amount: 180000, description: 'Final payment', status: 'paid' }
      ],
      academic_records: [
        { id: 'a2', semester: '1st Semester', session: '2021/2022', gpa: 3.8, evidence_url: '', created_at: '2022-02-15T10:00:00Z' },
        { id: 'a3', semester: '2nd Semester', session: '2021/2022', gpa: 4.5, evidence_url: 'https://example.com/result3.pdf', created_at: '2022-08-10T10:00:00Z' }
      ],
      status: 'active',
      created_at: '2024-01-10T10:00:00Z'
    },
    {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Adebayo Johnson',
      email: 'adebayo.johnson@example.com',
      year_of_admission: 2022,
      gender: 'male',
      phone_number: '+2348012345678',
      profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      school: 'University of Lagos',
      department: 'Computer Science',
      level: '200',
      course_duration: 4,
      years_remaining: 2,
      parent_name: 'Mrs. Johnson',
      parent_phone: '+2348012345679',
      account_number: '1234567890',
      account_name: 'Adebayo Johnson',
      bank_name: 'First Bank',
      school_fees: 150000,
      remarks: 'Excellent candidate',
      admission_letter_url: 'https://example.com/admission1.pdf',
      payments: [
        { id: 'p1', date: '2024-02-01', amount: 50000, description: 'First installment', status: 'paid' },
        { id: 'p2', date: '2024-03-01', amount: 50000, description: 'Second installment', status: 'paid' }
      ],
      status: 'active',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Fatima Abdul',
      email: 'fatima.abdul@example.com',
      year_of_admission: 2021,
      gender: 'female',
      phone_number: '+2348023456789',
      profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      school: 'University of Ibadan',
      department: 'Medicine',
      level: '300',
      course_duration: 6,
      years_remaining: 3,
      parent_name: 'Mr. Abdul',
      parent_phone: '+2348023456790',
      account_number: '0987654321',
      account_name: 'Fatima Abdul',
      bank_name: 'GTBank',
      school_fees: 250000,
      remarks: 'Needs financial aid',
      admission_letter_url: 'https://example.com/admission2.pdf',
      payments: [
        { id: 'p3', date: '2024-01-15', amount: 125000, description: 'Half payment', status: 'paid' }
      ],
      status: 'active',
      created_at: '2024-01-10T10:00:00Z'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      full_name: 'Chukwuemeka Nwosu',
      email: 'chukwuemeka.nwosu@example.com',
      year_of_admission: 2018,
      gender: 'male',
      phone_number: '+2348034567890',
      profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658ab4ff4e?w=150&h=150&fit=crop&crop=face',
      school: 'Obafemi Awolowo University',
      department: 'Engineering',
      level: '400',
      parent_name: 'Mrs. Nwosu',
      parent_phone: '+2348034567891',
      account_number: '1122334455',
      account_name: 'Chukwuemeka Nwosu',
      bank_name: 'Zenith Bank',
      school_fees: 180000,
      remarks: 'Graduated with honours',
      admission_letter_url: 'https://example.com/admission3.pdf',
      payments: [
        { id: 'p4', date: '2022-05-01', amount: 180000, description: 'Final payment', status: 'paid' }
      ],
      status: 'graduated',
      created_at: '2023-09-01T10:00:00Z'
    }
  ]

  const getStudents = async () => {
    if (isMock) return { data: mockStudents, error: null }
    try {
      const { data, error } = await supabase.from('students').select('*, payments(*)').order('created_at', { ascending: false })
      return { data, error }
    } catch (err) {
      return { data: [], error: { message: err.message || 'Database error' } }
    }
  }

  const getStudent = async (id) => {
    if (isMock) {
      const student = mockStudents.find(s => s.id === id)
      return { data: student || null, error: student ? null : { message: 'Student not found' } }
    }
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single()
      if (data) {
        // fetch payments for the student
        const { data: payments } = await supabase.from('payments').select('*').eq('student_id', id).order('date', { ascending: false })
        // fetch academic records for the student
        const { data: academicRecords } = await supabase.from('academic_records').select('*').eq('student_id', id).order('created_at', { ascending: false })
        return { data: { ...data, payments: payments || [], academic_records: academicRecords || [] }, error: null }
      }
      return { data: null, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Database error' } }
    }
  }

  const createStudent = async (student) => {
    if (isMock) {
      const id = (Date.now()).toString()
      const record = { id, ...student, created_at: new Date().toISOString() }
      mockStudents.unshift(record)
      return { data: [record], error: null }
    }
    try {
      const { data, error } = await supabase.from('students').insert([student]).select()
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Unable to create student.' } }
    }
  }

  const updateStudent = async (id, updates) => {
    if (isMock) {
      const idx = mockStudents.findIndex(s => s.id === id)
      if (idx === -1) return { data: null, error: { message: 'Student not found' } }
      mockStudents[idx] = { ...mockStudents[idx], ...updates, updated_at: new Date().toISOString() }
      return { data: [mockStudents[idx]], error: null }
    }
    try {
      const { data, error } = await supabase.from('students').update(updates).eq('id', id).select()
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Unable to update student.' } }
    }
  }

  const deleteStudent = async (id) => {
    if (isMock) {
      const idx = mockStudents.findIndex(s => s.id === id)
      if (idx === -1) return { error: { message: 'Student not found' } }
      mockStudents.splice(idx, 1)
      return { error: null }
    }
    try {
      const { error } = await supabase.from('students').delete().eq('id', id)
      return { error }
    } catch (err) {
      return { error: { message: err.message || 'Unable to delete student.' } }
    }
  }

  const createPayment = async (payment) => {
    const record = {
      student_id: payment.student_id,
      amount: parseFloat(payment.amount),
      description: payment.description || '',
      date: payment.date || new Date().toISOString(),
      status: payment.status || 'paid'
    }
    
    // Only include evidence_url if it's provided to avoid schema errors if the column doesn't exist
    if (payment.evidence_url) {
      record.evidence_url = payment.evidence_url
    }

    if (isMock) {
      const newPayment = { id: `p-${Date.now()}`, ...record, created_at: new Date().toISOString() }
      // Add to mock student's payments array
      const student = mockStudents.find(s => s.id === record.student_id)
      if (student) {
        if (!student.payments) student.payments = []
        student.payments.unshift(newPayment)
      }
      return { data: newPayment, error: null }
    }
    try {
      const { data, error } = await supabase.from('payments').insert([record]).select().single()
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Unable to record payment.' } }
    }
  }

  const createAcademicRecord = async (record) => {
    if (isMock) {
      const newRecord = { id: `a-${Date.now()}`, ...record, created_at: new Date().toISOString() }
      const student = mockStudents.find(s => s.id === record.student_id)
      if (student) {
        if (!student.academic_records) student.academic_records = []
        student.academic_records.unshift(newRecord)
      }
      return { data: newRecord, error: null }
    }
    try {
      const { data, error } = await supabase.from('academic_records').insert([record]).select().single()
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Unable to record GPA.' } }
    }
  }

  const getAcademicProgress = async (studentId) => {
    if (isMock) {
      // Return mock academic progress data
      const student = mockStudents.find(s => s.id === studentId)
      if (!student) return { data: [], error: null }
      
      const courseDuration = student.course_duration || 4
      const totalSemesters = courseDuration * 2
      const semesters = []
      
      for (let i = 1; i <= totalSemesters; i++) {
        const yearNum = Math.ceil(i / 2)
        const semPos = i % 2 === 0 ? 2 : 1
        const label = `Semester ${semPos} - Year ${yearNum}`
        
        const recorded = student.academic_records?.[i - 1]
        semesters.push({
          semester_number: i,
          expected_semester_label: label,
          gpa: recorded?.gpa || null,
          session: recorded?.session || null,
          semester: recorded?.semester || null,
          evidence_url: recorded?.evidence_url || null,
          record_id: recorded?.id || null,
          status: recorded ? 'Recorded' : 'Pending',
          created_at: recorded?.created_at || null
        })
      }
      
      return { data: semesters, error: null }
    }
    
    try {
      const { data, error } = await supabase
        .from('student_academic_progress')
        .select('*')
        .eq('id', studentId)
        .order('semester_number', { ascending: true })
      
      return { data: data || [], error }
    } catch (err) {
      return { data: [], error: { message: err.message || 'Unable to fetch academic progress.' } }
    }
  }

  const deletePayment = async (id) => {
    if (isMock) {
      mockStudents.forEach(s => {
        const idx = s.payments.findIndex(p => p.id === id)
        if (idx !== -1) s.payments.splice(idx, 1)
      })
      return { error: null }
    }
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id)
      return { error }
    } catch (err) {
      return { error: { message: err.message || 'Unable to delete payment.' } }
    }
  }

  const deleteAcademicRecord = async (id) => {
    if (isMock) {
      mockStudents.forEach(s => {
        if (s.academic_records) {
          const idx = s.academic_records.findIndex(a => a.id === id)
          if (idx !== -1) s.academic_records.splice(idx, 1)
        }
      })
      return { error: null }
    }
    try {
      const { error } = await supabase.from('academic_records').delete().eq('id', id)
      return { error }
    } catch (err) {
      return { error: { message: err.message || 'Unable to delete GPA record.' } }
    }
  }

  return {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    createPayment,
    createAcademicRecord,
    uploadAcademicEvidence,
    getAcademicProgress,
    deletePayment,
    deleteAcademicRecord
  }
}

// Admin helpers
export const useSupabaseAdmins = () => {
  const mockAdmins = [
    {
      id: '1',
      name: 'Super Admin',
      full_name: 'Super Admin',
      email: 'superadmin@escholar.com',
      role: 'owner',
      status: 'active',
      last_active: null,
      created_at: 'Today'
    },
    {
      id: '2',
      name: 'Finance Admin',
      full_name: 'Finance Admin',
      email: 'finance@escholar.com',
      role: 'admin',
      status: 'active',
      last_active: null,
      created_at: '2 days ago'
    }
  ]

  const getAdmins = async () => {
    if (isMock) {
      return { data: mockAdmins, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

      return { data: data || [], error }
    } catch (err) {
      return {
        data: [],
        error: { message: err.message || 'Unable to fetch admins.' }
      }
    }
  }

  const createAdmin = async (admin) => {
    const base = {
      email: admin.email,
      role: admin.role || 'admin',
      status: admin.status || 'active'
    }

    if (isMock) {
      const record = { id: String(Date.now()), ...base, last_active: '—' }
      mockAdmins.unshift(record)
      return { data: record, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .insert([base])
        .select()
        .single()

      return { data, error }
    } catch (err) {
      return {
        data: null,
        error: { message: err.message || 'Unable to create admin.' }
      }
    }
  }

  const updateAdmin = async (id, updates) => {
    if (isMock) {
      const idx = mockAdmins.findIndex(a => a.id === id)
      if (idx === -1) {
        return { data: null, error: { message: 'Admin not found' } }
      }
      mockAdmins[idx] = { ...mockAdmins[idx], ...updates }
      return { data: mockAdmins[idx], error: null }
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (err) {
      return {
        data: null,
        error: { message: err.message || 'Unable to update admin.' }
      }
    }
  }

  const ensureAdminForUser = async (user) => {
    if (!user?.email) return { data: null, error: null }

    if (isMock) {
      const existing = mockAdmins.find(a => a.email === user.email)
      if (existing) return { data: existing, error: null }
      const record = {
        id: String(Date.now()),
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        role: 'owner',
        status: 'active',
        last_active: 'Today'
      }
      mockAdmins.unshift(record)
      return { data: record, error: null }
    }

    try {
      const { data: existing, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        return { data: null, error }
      }

      if (existing) return { data: existing, error: null }

      const payload = {
        email: user.email,
        role: 'owner',
        status: 'active'
      }

      const { data: created, error: createError } = await supabase
        .from('admins')
        .insert([payload])
        .select()
        .single()

      return { data: created, error: createError }
    } catch (err) {
      return {
        data: null,
        error: { message: err.message || 'Unable to sync admin record.' }
      }
    }
  }

  return { getAdmins, createAdmin, updateAdmin, ensureAdminForUser }
}