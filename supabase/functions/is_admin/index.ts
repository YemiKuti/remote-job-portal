
// Follow Supabase Edge Function format
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log("Authorization header received:", authHeader ? "Present" : "Missing");
    
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing authorization header', 
        isAdmin: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 status with error payload
      })
    }

    // Initialize the Supabase client with the Auth context of the requesting user
    const supabaseClient = createClient(
      // Supabase API URL - env var injected by default when deployed
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var injected by default when deployed
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      { 
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )
    
    // Get the session of the user who invoked the function
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Session error: ' + sessionError.message, 
        isAdmin: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (!session) {
      console.error("No session found with the provided authorization");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No valid session found with the provided authorization', 
        isAdmin: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const user = session.user;
    console.log("User authenticated:", user.id, user.email);
    
    // Call the database function to check if the user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('is_admin')
    
    if (roleError) {
      console.error("Error checking admin role:", roleError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error checking admin role: ' + roleError.message, 
        isAdmin: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    const isAdmin = Boolean(roleData);
    console.log(`Admin access result for ${user.email}: ${isAdmin}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        isAdmin: isAdmin,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error("Error in is_admin function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Unhandled error: ' + (error.message || "Unknown error"),
      isAdmin: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
