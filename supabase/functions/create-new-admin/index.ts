import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password } = await req.json();

    console.log(`🚀 Creating new admin user: ${email}`);

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Only allow creating admin for yemikuti@gmail.com
    if (email !== 'yemikuti@gmail.com') {
      throw new Error('Unauthorized: Only specific admin can be created');
    }

    // First, delete existing user if exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (existingUser) {
      console.log(`🗑️ Deleting existing user: ${existingUser.id}`);
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    }

    // Create new admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Yemi Admin',
        role: 'admin'
      }
    });

    if (createError) {
      console.error('❌ Failed to create user:', createError);
      throw new Error(`Failed to create auth user: ${createError.message}`);
    }

    console.log(`✅ Created auth user: ${newUser.user.id}`);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        full_name: 'Yemi Admin',
        username: 'yemi_admin'
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      // Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('✅ Created user profile');

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: newUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('❌ Role assignment failed:', roleError);
      // Clean up on failure
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to assign admin role: ${roleError.message}`);
    }

    console.log('✅ Assigned admin role');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'New admin user created successfully',
        user_id: newUser.user.id,
        email: email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in create-new-admin function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});