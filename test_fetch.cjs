const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rhpwrkfwcocqkvjdscyd.supabase.co'
const supabaseKey = 'sb_publishable_G8vzHCgKKePcziMVRwfLlg_9kG0u7-y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('academic_records').select('*')
  console.log("Records length:", data ? data.length : 0);
  if (data && data.length > 0) {
    console.log("First record:", data[0]);
  }
}
test()
