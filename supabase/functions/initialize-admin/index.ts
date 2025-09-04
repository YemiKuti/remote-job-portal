import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('[INITIALIZE-ADMIN] Starting admin user creation')

    const { email, password } = await req.json()

    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    console.log(`[INITIALIZE-ADMIN] Creating admin user for email: ${email}`)

    // Create user in auth.users using admin API
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email
    })

    if (createError) {
      console.error('[INITIALIZE-ADMIN] Auth user creation error:', createError)
      throw new Error(`Failed to create auth user: ${createError.message}`)
    }

    if (!authUser.user) {
      throw new Error('No user returned from auth creation')
    }

    console.log('[INITIALIZE-ADMIN] Auth user created:', authUser.user.id)

    // Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        username: 'admin',
        full_name: 'System Administrator',
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('[INITIALIZE-ADMIN] Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    console.log('[INITIALIZE-ADMIN] Profile created for user:', authUser.user.id)

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin'
      })

    if (roleError) {
      console.error('[INITIALIZE-ADMIN] Role assignment error:', roleError)
      // Don't fail completely on role assignment error
      console.log('[INITIALIZE-ADMIN] Continuing despite role assignment error')
    } else {
      console.log('[INITIALIZE-ADMIN] Admin role assigned')
    }

    console.log('[INITIALIZE-ADMIN] Admin user created successfully:', authUser.user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user.id,
        email: authUser.user.email,
        message: 'Admin user created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[INITIALIZE-ADMIN] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})