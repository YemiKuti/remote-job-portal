
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
    // Initialize the Supabase client with the Auth context of the requesting user
    const supabaseClient = createClient(
      // Supabase API URL - env var injected by default when deployed
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var injected by default when deployed
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      { 
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log("Authentication headers:", req.headers.get('Authorization'));
    
    // Get the session of the user who invoked the function
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized', 
        isAdmin: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 status even for errors to avoid the non-2xx error
      })
    }

    if (!session) {
      console.error("No session found");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No session found', 
        isAdmin: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 status even for errors
      })
    }

    const user = session.user
    
    // Log the user metadata to debug
    console.log("User metadata:", JSON.stringify(user.user_metadata));
    console.log("User email:", user.email);
    
    // Check if user email is yemikuti@gmail.com - direct fix for this user
    const isYemiKuti = user.email === 'yemikuti@gmail.com';
    
    // Check if user has the is_admin flag in their metadata
    const isAdminFromMetadata = user.user_metadata?.is_admin === true || 
                               user.user_metadata?.is_admin === 'true';
    
    // Grant admin access to yemikuti@gmail.com regardless of metadata
    const isAdmin = isYemiKuti || isAdminFromMetadata;
    
    console.log(`Admin access result: ${isAdmin} (yemikuti check: ${isYemiKuti}, metadata check: ${isAdminFromMetadata})`);
    
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
      error: error.message || "Unknown error",
      isAdmin: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 even for errors to avoid the non-2xx error
    })
  }
})
