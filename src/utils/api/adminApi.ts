
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name?: string;
  username?: string;
  role: string;
}

export interface UpdateUserData {
  full_name?: string;
  username?: string;
  role: string;
}

// Fetch admin users using the database function
export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  console.log('Fetching admin users...');
  
  try {
    // First check authentication status for debugging
    const { data: authStatus, error: authError } = await supabase
      .rpc('get_current_user_auth_status');
    
    console.log('Auth status:', authStatus);
    
    if (authError) {
      console.error('Auth status check error:', authError);
    }
    
    // Call the admin function to get users
    const { data, error } = await supabase
      .rpc('get_admin_users');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    
    console.log('Admin users fetched successfully:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error in fetchAdminUsers:', error);
    throw new Error(error.message || 'Failed to fetch admin users');
  }
};

// Create a new user (admin function)
export const createAdminUser = async (userData: CreateUserData): Promise<string | null> => {
  console.log('Creating admin user:', userData);
  
  try {
    const { data, error } = await supabase
      .rpc('admin_create_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_full_name: userData.full_name || null,
        user_username: userData.username || null,
        user_role: userData.role
      });
    
    if (error) {
      console.error('Error creating admin user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    console.log('Admin user created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error in createAdminUser:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

// Update user role
export const updateAdminUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  console.log('Updating user role:', userId, newRole);
  
  try {
    const { data, error } = await supabase
      .rpc('admin_update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });
    
    if (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
    
    console.log('User role updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error in updateAdminUserRole:', error);
    throw new Error(error.message || 'Failed to update user role');
  }
};

// Update user profile information
export const updateAdminUser = async (userId: string, userData: UpdateUserData): Promise<boolean> => {
  console.log('Updating user profile:', userId, userData);
  
  try {
    // Update profile information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: userData.full_name,
        username: userData.username,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
    
    // Update role if it's different
    if (userData.role) {
      await updateAdminUserRole(userId, userData.role);
    }
    
    console.log('User updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error in updateAdminUser:', error);
    throw new Error(error.message || 'Failed to update user');
  }
};

// Delete user
export const deleteAdminUser = async (userId: string): Promise<boolean> => {
  console.log('Deleting user:', userId);
  
  try {
    const { data, error } = await supabase
      .rpc('admin_delete_user', {
        target_user_id: userId
      });
    
    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
    
    console.log('User deleted successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error in deleteAdminUser:', error);
    throw new Error(error.message || 'Failed to delete user');
  }
};

// Fetch a single job for admin (using the new admin function)
export const fetchAdminJob = async (jobId: string) => {
  console.log('Fetching admin job:', jobId);
  
  try {
    const { data, error } = await supabase
      .rpc('admin_get_job', { job_id: jobId });
    
    if (error) {
      console.error('Error fetching admin job:', error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
    
    console.log('Admin job fetched successfully:', data);
    return data?.[0] || null;
  } catch (error: any) {
    console.error('Error in fetchAdminJob:', error);
    throw new Error(error.message || 'Failed to fetch job');
  }
};
