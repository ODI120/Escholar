// supabase/functions/create-student/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0"

// ✅ Disable automatic JWT verification — we'll handle admin check manually
export const config = { verify_jwt: false }

// Only the deployed frontend may call this function.
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-auth',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}

// Temporary password used when the admin does not supply one. It is returned
// to the caller once and must be changed by the student on first login.
const generateTemporaryPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, password, user_metadata, ...profileData } = body
    const targetRole = user_metadata?.role ?? 'student'

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const anonKey = Deno.env.get('ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Edge Function misconfigured: missing env vars' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 🕵️ STEALTH HEADER BYPASS (Pro Enterprise Pattern)
    // We use 'X-Service-Auth' to bypass the Supabase Gateway's 'Invalid JWT' interference.
    const stealthToken = req.headers.get('X-Service-Auth')
    
    if (!stealthToken) {
      console.error("STEALTH_AUTH_FAILED: Missing X-Service-Auth header")
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Auth Token' }), { status: 401, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 1. SOURCE-OF-TRUTH CRYPTOGRAPHIC VERIFICATION (High-Security)
    // Send the token to the Auth Server to verify its secret signature. Do NOT decode it manually.
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(stealthToken)
    
    if (callerError || !caller) {
      console.error("CRYPTOGRAPHIC_REJECTION:", callerError?.message)
      return new Response(JSON.stringify({ error: 'Unauthorized: Session invalid, expired, or forged' }), { status: 401, headers: corsHeaders })
    }

    // 3. ADMIN ROLE VERIFICATION
    const { data: adminRecord, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('role')
      .eq('user_id', caller.id)
      .single()

    // Creating a beneficiary is an ordinary administrative action, so any role
    // in `admins` is accepted here (unlike create-admin, which is restricted to
    // super_admin).
    if (adminError || !adminRecord) {
      console.error("ACCESS_DENIED: caller is not an admin")
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required' }), { status: 403, headers: corsHeaders })
    }

    const temporaryPassword = password || generateTemporaryPassword()

    // ✅ Create student in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { role: targetRole, must_change_password: true },
    })
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // ✅ Insert profile into students table
    const userId = authData.user.id
    const { error: dbError } = await supabaseAdmin
      .from('students')
      .insert([{ ...profileData, id: userId, email, must_change_password: true }])

    if (dbError) {
      return new Response(JSON.stringify({ error: `Auth created but DB failed: ${dbError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // The generated password is returned once so the admin can hand it to the
    // student; it is never persisted anywhere in plaintext.
    return new Response(JSON.stringify({
      user: authData.user,
      temporary_password: password ? undefined : temporaryPassword,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
