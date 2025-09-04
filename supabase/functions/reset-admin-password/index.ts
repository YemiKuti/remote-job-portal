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

    const { email, newPassword } = await req.json();

    console.log(`🔐 Attempting to reset password for admin: ${email}`);

    // Validate input
    if (!email || !newPassword) {
      throw new Error('Email and new password are required');
    }

    // Only allow resetting password for yemikuti@gmail.com
    if (email !== 'yemikuti@gmail.com') {
      throw new Error('Unauthorized: Only specific admin can reset password');
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // First, verify the user exists and is an admin
    const { data: adminUser } = await supabaseAdmin
      .from('user_roles')
      .select(`
        user_id,
        role,
        profiles!inner(full_name)
      `)
      .eq('role', 'admin')
      .single();

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    console.log(`👤 Found admin user: ${adminUser.user_id}`);

    // Reset the password using admin API
    const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.user_id,
      { 
        password: newPassword,
        email_confirm: true // Ensure email is confirmed
      }
    );

    if (updateError) {
      console.error('❌ Password reset failed:', updateError);
      throw new Error(`Failed to reset password: ${updateError.message}`);
    }

    console.log('✅ Password reset successful for admin user');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin password reset successfully',
        user_id: adminUser.user_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in reset-admin-password function:', error);
    
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