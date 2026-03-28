// supabase/functions/create-admin/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0"

export const config = { verify_jwt: false }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-auth',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, password, full_name, user_metadata, ...profileData } = body
    const targetRole = user_metadata?.role ?? 'admin'

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Edge Function misconfigured: missing env vars' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const stealthToken = req.headers.get('X-Service-Auth')
    
    if (!stealthToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Auth Token' }), { status: 401, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // SOURCE-OF-TRUTH CRYPTOGRAPHIC VERIFICATION
    // Send the token to the Auth Server to verify its secret signature. Do NOT decode it manually.
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(stealthToken)
    
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Session invalid, expired, or forged' }), { status: 401, headers: corsHeaders })
    }

    const { data: adminRecord, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('role')
      .eq('user_id', caller.id)
      .single()

    if (adminError || !adminRecord || adminRecord.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized: Only a Super Admin can create new administrators.' }), { status: 403, headers: corsHeaders })
    }

    //  Create admin in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: targetRole, full_name },
    })
    
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Insert profile into admins table
    const userId = authData.user.id
    const { data: insertedAdmin, error: dbError } = await supabaseAdmin
      .from('admins')
      .insert([{ 
        user_id: userId, 
        email, 
        full_name: full_name || '',
        role: targetRole
      }])
      .select()
      .single()

    if (dbError) {
      return new Response(JSON.stringify({ error: `Auth created but DB failed: ${dbError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ user: authData.user, adminRecord: insertedAdmin }), {
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
