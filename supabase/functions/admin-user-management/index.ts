
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  username?: string;
  role: string;
}

interface UpdateUserRequest {
  user_id: string;
  full_name?: string;
  username?: string;
  role?: string;
}

interface DeleteUserRequest {
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client for admin operations (with service role)
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

    // Create client for user verification (with user token)
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the user is authenticated and get their details
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token)

    if (authError || !user) {
      console.error('[ADMIN-USER-MANAGEMENT] Auth error:', authError)
      throw new Error('Invalid authentication')
    }

    console.log('[ADMIN-USER-MANAGEMENT] Authenticated user:', user.id)

    // Check if user is admin using a direct query with the service role client
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    if (roleError) {
      console.error('[ADMIN-USER-MANAGEMENT] Role check error:', roleError)
      throw new Error('Failed to verify admin privileges')
    }

    if (!userRoles || userRoles.length === 0) {
      console.error('[ADMIN-USER-MANAGEMENT] User is not admin:', user.id)
      throw new Error('Admin privileges required')
    }

    console.log('[ADMIN-USER-MANAGEMENT] Admin verified:', user.id)

    const { action, ...data } = await req.json()

    console.log(`[ADMIN-USER-MANAGEMENT] ${action} request:`, data)

    switch (action) {
      case 'create': {
        const { email, password, full_name, username, role } = data as CreateUserRequest

        // Validate role
        if (!['admin', 'employer', 'candidate', 'user'].includes(role)) {
          throw new Error('Invalid role')
        }

        // Create user in auth.users using admin API
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true // Auto-confirm email
        })

        if (createError) {
          console.error('[ADMIN-USER-MANAGEMENT] Auth user creation error:', createError)
          throw new Error(`Failed to create auth user: ${createError.message}`)
        }

        if (!authUser.user) {
          throw new Error('No user returned from auth creation')
        }

        console.log('[ADMIN-USER-MANAGEMENT] Auth user created:', authUser.user.id)

        // Check if profile already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', authUser.user.id)
          .single()

        // Create profile record only if it doesn't exist
        if (!existingProfile) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: authUser.user.id,
              username: username || null,
              full_name: full_name || null,
              created_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('[ADMIN-USER-MANAGEMENT] Profile creation error:', profileError)
            // Clean up auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
            throw new Error(`Failed to create profile: ${profileError.message}`)
          }
          console.log('[ADMIN-USER-MANAGEMENT] Profile created for user:', authUser.user.id)
        } else {
          console.log('[ADMIN-USER-MANAGEMENT] Profile already exists for user:', authUser.user.id)
          // Update existing profile with new data
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              username: username || null,
              full_name: full_name || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', authUser.user.id)

          if (updateError) {
            console.error('[ADMIN-USER-MANAGEMENT] Profile update error:', updateError)
          }
        }

        // Assign role if not default 'user'
        if (role !== 'user') {
          // Remove any existing roles first
          await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', authUser.user.id)

          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: authUser.user.id,
              role: role
            })

          if (roleError) {
            console.error('[ADMIN-USER-MANAGEMENT] Role assignment error:', roleError)
            // Don't fail completely on role assignment error, just log it
            console.log('[ADMIN-USER-MANAGEMENT] Continuing despite role assignment error')
          } else {
            console.log('[ADMIN-USER-MANAGEMENT] Role assigned:', role)
          }
        }

        console.log('[ADMIN-USER-MANAGEMENT] User created successfully:', authUser.user.id)
        return new Response(
          JSON.stringify({ success: true, user_id: authUser.user.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        const { user_id, full_name, username, role } = data as UpdateUserRequest

        // Update profile if profile data is provided
        if (full_name !== undefined || username !== undefined) {
          const updateData: any = {}
          if (full_name !== undefined) updateData.full_name = full_name
          if (username !== undefined) updateData.username = username
          updateData.updated_at = new Date().toISOString()

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', user_id)

          if (profileError) {
            console.error('[ADMIN-USER-MANAGEMENT] Profile update error:', profileError)
            throw new Error(`Failed to update profile: ${profileError.message}`)
          }
        }

        // Update role if provided
        if (role !== undefined) {
          if (!['admin', 'employer', 'candidate', 'user'].includes(role)) {
            throw new Error('Invalid role')
          }

          // Remove existing role
          await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', user_id)

          // Add new role if not default 'user'
          if (role !== 'user') {
            const { error: roleError } = await supabaseAdmin
              .from('user_roles')
              .insert({
                user_id: user_id,
                role: role
              })

            if (roleError) {
              console.error('[ADMIN-USER-MANAGEMENT] Role update error:', roleError)
              throw new Error(`Failed to update role: ${roleError.message}`)
            }
          }
        }

        console.log('[ADMIN-USER-MANAGEMENT] User updated successfully:', user_id)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'delete': {
        const { user_id } = data as DeleteUserRequest

        // Don't allow deleting yourself
        if (user_id === user.id) {
          throw new Error('Cannot delete your own account')
        }

        // Delete user roles
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)

        // Delete profile
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', user_id)

        // Delete auth user
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

        if (deleteError) {
          console.error('[ADMIN-USER-MANAGEMENT] Auth user deletion error:', deleteError)
          throw new Error(`Failed to delete auth user: ${deleteError.message}`)
        }

        console.log('[ADMIN-USER-MANAGEMENT] User deleted successfully:', user_id)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error: any) {
    console.error('[ADMIN-USER-MANAGEMENT] Error:', error)
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
