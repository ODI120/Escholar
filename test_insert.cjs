const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rhpwrkfwcocqkvjdscyd.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G8vzHCgKKePcziMVRwfLlg_9kG0u7-y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  // Try inserting a record
  const payload = {
    student_id: '11111111-1111-1111-1111-111111111111', // Dummy ID
    semester: '1st',
    session: '2023/2024',
    gpa: 4.0,
    semester_number: 1,
    status: 'pending'
  }
  
  const { data, error } = await supabase.from('academic_records').insert([payload]).select().single()
  console.log("Insert Result:", JSON.stringify(data, null, 2))
  console.log("Insert Error:", error)
}
test()
