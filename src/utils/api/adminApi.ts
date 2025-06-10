import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';

// Fetch dashboard stats for admin using available functions
export const fetchAdminStats = async () => {
  try {
    // Log data access
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_admin_stats' },
      severity: 'low'
    });

    // Get total users count using profiles table as approximation
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('Error fetching user count:', usersError);
    }

    // Get total jobs count
    const { count: totalJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    if (jobsError) {
      console.error('Error fetching jobs count:', jobsError);
    }

    // Get pending jobs count
    const { count: pendingApprovals, error: pendingError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'draft']);
    
    if (pendingError) {
      console.error('Error fetching pending jobs:', pendingError);
    }

    // Get companies count (unique employers from jobs)
    const { data: companies, error: companiesError } = await supabase
      .from('jobs')
      .select('company')
      .not('company', 'is', null);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    }

    const uniqueCompanies = new Set(companies?.map(job => job.company)).size;

    // Calculate revenue (mock data based on featured jobs)
    const totalRevenue = await calculateTotalRevenue();

    // Get new messages count
    const { count: newMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    
    if (messagesError) {
      console.error('Error fetching messages count:', messagesError);
    }

    return {
      totalUsers: totalUsers || 0,
      totalCompanies: uniqueCompanies || 0,
      totalJobs: totalJobs || 0,
      pendingApprovals: pendingApprovals || 0,
      totalRevenue,
      newMessages: newMessages || 0
    };
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    
    // Log the error as a security event
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_admin_stats_failed',
        error: error.message 
      },
      severity: 'medium'
    });

    // Return safe defaults
    return {
      totalUsers: 0,
      totalCompanies: 0,
      totalJobs: 0,
      pendingApprovals: 0,
      totalRevenue: 0,
      newMessages: 0
    };
  }
};

// Calculate revenue from featured jobs
const calculateTotalRevenue = async () => {
  try {
    const { data: featuredJobs, error } = await supabase
      .from('jobs')
      .select('id')
      .eq('is_featured', true);
    
    if (error) throw error;
    
    // Mock calculation: $100 per featured job
    return (featuredJobs?.length || 0) * 100;
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
};

// Fetch all jobs using admin function
export const fetchAdminJobs = async () => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_admin_jobs' },
      severity: 'low'
    });

    const { data, error } = await supabase.rpc('get_admin_jobs');
    
    if (error) {
      console.error('Error fetching admin jobs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching admin jobs:', error);
    
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_admin_jobs_failed',
        error: error.message 
      },
      severity: 'medium'
    });
    
    throw error;
  }
};

// Update job status using admin function
export const updateJobStatus = async (jobId: string, newStatus: string) => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'update_job_status', job_id: jobId, new_status: newStatus },
      severity: 'medium'
    });

    const { data, error } = await supabase.rpc('admin_update_job_status', {
      job_id: jobId,
      new_status: newStatus
    });
    
    if (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
    
    return { success: data };
  } catch (error: any) {
    console.error('Error updating job status:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'update_job_status_failed',
        job_id: jobId,
        new_status: newStatus,
        error: error.message 
      },
      severity: 'high'
    });
    
    throw error;
  }
};

// Fetch recent users using profiles table
export const fetchRecentUsers = async (limit = 3) => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_recent_users', limit },
      severity: 'low'
    });

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent users:', error);
      throw error;
    }
    
    return (data || []).map(user => ({
      id: user.id,
      name: user.full_name || user.username || 'User',
      email: 'Email not available', // Email not in profiles for privacy
      role: 'user', // Default role since we can't access user_roles reliably
      status: 'active',
      joined: user.created_at
    }));
  } catch (error: any) {
    console.error('Error fetching recent users:', error);
    
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_recent_users_failed',
        error: error.message 
      },
      severity: 'medium'
    });
    
    return [];
  }
};

// Fetch recent jobs for admin dashboard
export const fetchRecentJobs = async (limit = 3) => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_recent_jobs', limit },
      severity: 'low'
    });

    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company, created_at, status')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent jobs:', error);
      throw error;
    }
    
    return (data || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      postedDate: job.created_at,
      status: job.status
    }));
  } catch (error: any) {
    console.error('Error fetching recent jobs:', error);
    
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_recent_jobs_failed',
        error: error.message 
      },
      severity: 'medium'
    });
    
    return [];
  }
};

// Function to manage user roles (admin only)
export const updateUserRole = async (userId: string, newRole: 'admin' | 'user' | 'employer') => {
  try {
    await logSecurityEvent({
      event_type: 'role_change',
      details: { target_user: userId, new_role: newRole },
      severity: 'high'
    });

    // Remove existing role
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Add new role if not 'user' (default)
    if (newRole !== 'user') {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    
    await logSecurityEvent({
      event_type: 'role_change',
      details: { 
        target_user: userId,
        new_role: newRole,
        error: error.message,
        failed: true
      },
      severity: 'critical'
    });
    
    return { success: false, error: error.message };
  }
};

// Function to get detailed user information (admin only)
export const fetchUserDetails = async (userId: string) => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_user_details', target_user: userId },
      severity: 'medium'
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    // Get user applications count
    const { count: applicationsCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user's jobs if they're an employer
    const { count: jobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', userId);

    return {
      profile,
      role: roleData?.role || 'user',
      stats: {
        applications: applicationsCount || 0,
        jobs: jobsCount || 0
      }
    };
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_user_details_failed',
        target_user: userId,
        error: error.message 
      },
      severity: 'high'
    });
    
    throw error;
  }
};

// Company management functions
export interface Company {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  location?: string;
  company_size?: string;
  founded_year?: number;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CompanyFormData {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  location?: string;
  company_size?: string;
  founded_year?: number;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

// Fetch all companies using admin function
export const fetchAdminCompanies = async (): Promise<Company[]> => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_admin_companies' },
      severity: 'low'
    });

    const { data, error } = await supabase.rpc('get_admin_companies');
    
    if (error) {
      console.error('Error fetching admin companies:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching admin companies:', error);
    
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_admin_companies_failed',
        error: error.message 
      },
      severity: 'medium'
    });
    
    throw error;
  }
};

// Create company using admin function
export const createCompany = async (companyData: CompanyFormData): Promise<string> => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'create_company', company_name: companyData.name },
      severity: 'medium'
    });

    const { data, error } = await supabase.rpc('admin_create_company', {
      company_name: companyData.name,
      company_description: companyData.description || null,
      company_industry: companyData.industry || null,
      company_website: companyData.website || null,
      company_logo_url: companyData.logo_url || null,
      company_location: companyData.location || null,
      company_size: companyData.company_size || null,
      company_founded_year: companyData.founded_year || null,
      company_email: companyData.email || null,
      company_phone: companyData.phone || null,
      company_linkedin_url: companyData.linkedin_url || null,
      company_twitter_url: companyData.twitter_url || null
    });
    
    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating company:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'create_company_failed',
        company_name: companyData.name,
        error: error.message 
      },
      severity: 'high'
    });
    
    throw error;
  }
};

// Update company using admin function
export const updateCompany = async (companyId: string, companyData: CompanyFormData & { status?: string }): Promise<boolean> => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'update_company', company_id: companyId, company_name: companyData.name },
      severity: 'medium'
    });

    const { data, error } = await supabase.rpc('admin_update_company', {
      company_id: companyId,
      company_name: companyData.name,
      company_description: companyData.description || null,
      company_industry: companyData.industry || null,
      company_website: companyData.website || null,
      company_logo_url: companyData.logo_url || null,
      company_location: companyData.location || null,
      company_size: companyData.company_size || null,
      company_founded_year: companyData.founded_year || null,
      company_email: companyData.email || null,
      company_phone: companyData.phone || null,
      company_linkedin_url: companyData.linkedin_url || null,
      company_twitter_url: companyData.twitter_url || null,
      company_status: companyData.status || 'active'
    });
    
    if (error) {
      console.error('Error updating company:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating company:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'update_company_failed',
        company_id: companyId,
        company_name: companyData.name,
        error: error.message 
      },
      severity: 'high'
    });
    
    throw error;
  }
};

// Delete company using admin function
export const deleteCompany = async (companyId: string): Promise<boolean> => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'delete_company', company_id: companyId },
      severity: 'high'
    });

    const { data, error } = await supabase.rpc('admin_delete_company', {
      company_id: companyId
    });
    
    if (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error deleting company:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'delete_company_failed',
        company_id: companyId,
        error: error.message 
      },
      severity: 'critical'
    });
    
    throw error;
  }
};

// User management interfaces
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
  role: 'admin' | 'employer' | 'candidate' | 'user';
}

// Fetch all users using admin function
export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_admin_users' },
      severity: 'low'
    });

    const { data, error } = await supabase.rpc('get_admin_users');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    
    await logSecurityEvent({
      event_type: 'data_access',
      details: { 
        action: 'fetch_admin_users_failed',
        error: error.message 
      },
      severity: 'medium'
    });
    
    throw error;
  }
};

// Create new user using admin function
export const createAdminUser = async (userData: CreateUserData): Promise<string> => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'create_user', user_email: userData.email, role: userData.role },
      severity: 'high'
    });

    // First create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          username: userData.username
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    // Update the profile with additional data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: userData.username,
        full_name: userData.full_name
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Assign role if not default 'user'
    if (userData.role !== 'user') {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: userData.role
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }
    }

    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'create_user_success',
        user_email: userData.email,
        user_id: authData.user.id,
        role: userData.role
      },
      severity: 'high'
    });

    return authData.user.id;
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'create_user_failed',
        user_email: userData.email,
        error: error.message 
      },
      severity: 'critical'
    });
    
    throw error;
  }
};

// Update user role using admin function
export const updateAdminUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'update_user_role', target_user_id: userId, new_role: newRole },
      severity: 'high'
    });

    const { data, error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: userId,
      new_role: newRole
    });
    
    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating user role:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'update_user_role_failed',
        target_user_id: userId,
        new_role: newRole,
        error: error.message 
      },
      severity: 'critical'
    });
    
    throw error;
  }
};

// Delete user using admin function
export const deleteAdminUser = async (userId: string): Promise<boolean> => {
  try {
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { action: 'delete_user', target_user_id: userId },
      severity: 'critical'
    });

    const { data, error } = await supabase.rpc('admin_delete_user', {
      target_user_id: userId
    });
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    await logSecurityEvent({
      event_type: 'admin_action',
      details: { 
        action: 'delete_user_failed',
        target_user_id: userId,
        error: error.message 
      },
      severity: 'critical'
    });
    
    throw error;
  }
};
