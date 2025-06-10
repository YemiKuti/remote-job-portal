
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';

// Fetch dashboard stats for admin using secure functions
export const fetchAdminStats = async () => {
  try {
    // Log data access
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_admin_stats' },
      severity: 'low'
    });

    // Get total users count using secure function
    const { data: totalUsers, error: usersError } = await supabase
      .rpc('get_admin_user_count');
    
    if (usersError) {
      console.error('Error fetching user count:', usersError);
      throw usersError;
    }

    // Get total jobs count
    const { count: totalJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    if (jobsError) {
      console.error('Error fetching jobs count:', jobsError);
      throw jobsError;
    }

    // Get pending jobs count
    const { count: pendingApprovals, error: pendingError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'draft']);
    
    if (pendingError) {
      console.error('Error fetching pending jobs:', pendingError);
      throw pendingError;
    }

    // Get companies count (unique employers from jobs)
    const { data: companies, error: companiesError } = await supabase
      .from('jobs')
      .select('company')
      .not('company', 'is', null);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      throw companiesError;
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
      // Don't throw, just log and continue
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

// Fetch recent users using secure function
export const fetchRecentUsers = async (limit = 3) => {
  try {
    await logSecurityEvent({
      event_type: 'data_access',
      details: { action: 'fetch_recent_users', limit },
      severity: 'low'
    });

    const { data, error } = await supabase
      .rpc('get_admin_user_details', { limit_count: limit });
    
    if (error) {
      console.error('Error fetching recent users:', error);
      throw error;
    }
    
    return data.map(user => ({
      id: user.id,
      name: user.email?.split('@')[0] || 'User', // Use email prefix as name
      email: user.email || 'No email',
      role: user.role || 'user',
      status: 'active', // Mock status
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
    
    return data.map(job => ({
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

// New function to manage user roles (admin only)
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

// New function to get detailed user information (admin only)
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
