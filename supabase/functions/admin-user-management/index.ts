
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user is admin using the existing function
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_current_user_admin')

    if (adminError) {
      console.error('[ADMIN-USER-MANAGEMENT] Admin check error:', adminError)
      throw new Error('Failed to verify admin privileges')
    }

    if (!isAdmin) {
      throw new Error('Admin privileges required')
    }

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
        const { data: authUser, error: createError } = await supabaseClient.auth.admin.createUser({
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

        // Create profile record
        const { error: profileError } = await supabaseClient
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
          await supabaseClient.auth.admin.deleteUser(authUser.user.id)
          throw new Error(`Failed to create profile: ${profileError.message}`)
        }

        // Assign role if not default 'user'
        if (role !== 'user') {
          const { error: roleError } = await supabaseClient
            .from('user_roles')
            .insert({
              user_id: authUser.user.id,
              role: role
            })

          if (roleError) {
            console.error('[ADMIN-USER-MANAGEMENT] Role assignment error:', roleError)
            // Clean up on role assignment failure
            await supabaseClient.from('profiles').delete().eq('id', authUser.user.id)
            await supabaseClient.auth.admin.deleteUser(authUser.user.id)
            throw new Error(`Failed to assign role: ${roleError.message}`)
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

          const { error: profileError } = await supabaseClient
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
          await supabaseClient
            .from('user_roles')
            .delete()
            .eq('user_id', user_id)

          // Add new role if not default 'user'
          if (role !== 'user') {
            const { error: roleError } = await supabaseClient
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
        await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)

        // Delete profile
        await supabaseClient
          .from('profiles')
          .delete()
          .eq('id', user_id)

        // Delete auth user
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id)

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
