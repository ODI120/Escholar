const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rhpwrkfwcocqkvjdscyd.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G8vzHCgKKePcziMVRwfLlg_9kG0u7-y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('academic_records').select('*').limit(1)
  console.log("Records:", JSON.stringify(data, null, 2))
  console.log("Error:", error)
}
test()
