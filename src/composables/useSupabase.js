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
  // Mock data for development
  const mockStudents = [
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
      parent_name: 'Mrs. Johnson',
      parent_phone: '+2348012345679',
      account_number: '1234567890',
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
      parent_name: 'Mr. Abdul',
      parent_phone: '+2348023456790',
      account_number: '0987654321',
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
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false })
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
        return { data: { ...data, payments: payments || [] }, error: null }
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

  return { getStudents, getStudent, createStudent, updateStudent, deleteStudent }
}