
// Follow Supabase Edge Function format
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

serve(async (req) => {
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

    // Get the session of the user who invoked the function
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized', 
        isAdmin: false 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    if (!session) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized', 
        isAdmin: false 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const user = session.user
    
    // Check if user has the is_admin flag in their metadata
    const isAdmin = user.user_metadata?.is_admin === true || user.user_metadata?.is_admin === 'true'
    
    return new Response(
      JSON.stringify({
        success: true,
        isAdmin: isAdmin,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
