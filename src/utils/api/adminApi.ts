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

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  status: string;
  applications: number;
  employer_id?: string;
  description?: string;
  requirements?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type?: string;
  experience_level?: string;
  tech_stack?: string[];
  visa_sponsorship?: boolean;
  remote?: boolean;
  company_size?: string;
  application_deadline?: string;
  logo?: string;
  application_type?: string;
  application_value?: string;
  sponsored?: boolean;
  rejection_reason?: string;
  approval_date?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_date?: string;
  last_reviewed_at?: string;
  review_notes?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: string;
  performed_by: string;
  performed_at: string;
  reason?: string;
  previous_status?: string;
  new_status?: string;
  notes?: string;
  performer_name?: string;
}

export interface BatchApprovalResult {
  job_id: string;
  success: boolean;
  error_message?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingApprovals: number;
  newMessages: number;
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

// Create a new user using the Edge Function
export const createAdminUser = async (userData: CreateUserData): Promise<string | null> => {
  console.log('Creating admin user:', userData);
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-user-management', {
      body: {
        action: 'create',
        ...userData
      }
    });
    
    if (error) {
      console.error('Error creating admin user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create user');
    }
    
    console.log('Admin user created successfully:', data.user_id);
    return data.user_id;
  } catch (error: any) {
    console.error('Error in createAdminUser:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

// Update user role
export const updateAdminUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  console.log('Updating user role:', userId, newRole);
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-user-management', {
      body: {
        action: 'update',
        user_id: userId,
        role: newRole
      }
    });
    
    if (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update user role');
    }
    
    console.log('User role updated successfully:', data);
    return true;
  } catch (error: any) {
    console.error('Error in updateAdminUserRole:', error);
    throw new Error(error.message || 'Failed to update user role');
  }
};

// Update user profile information
export const updateAdminUser = async (userId: string, userData: UpdateUserData): Promise<boolean> => {
  console.log('Updating user profile:', userId, userData);
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-user-management', {
      body: {
        action: 'update',
        user_id: userId,
        ...userData
      }
    });
    
    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update user');
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
    const { data, error } = await supabase.functions.invoke('admin-user-management', {
      body: {
        action: 'delete',
        user_id: userId
      }
    });
    
    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }
    
    console.log('User deleted successfully:', data);
    return true;
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

// Fetch all jobs for admin using the database function
export const fetchAdminJobs = async (): Promise<AdminJob[]> => {
  console.log('Fetching admin jobs...');
  
  try {
    const { data, error } = await supabase
      .rpc('get_admin_jobs');
    
    if (error) {
      console.error('Error fetching admin jobs:', error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
    
    console.log('Admin jobs fetched successfully:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error in fetchAdminJobs:', error);
    throw new Error(error.message || 'Failed to fetch admin jobs');
  }
};

// Enhanced job approval with logging and validation
export const approveJob = async (
  jobId: string, 
  approvalReason?: string, 
  reviewNotes?: string
): Promise<{ success: boolean; message?: string }> => {
  console.log('Approving job:', jobId, { approvalReason, reviewNotes });
  
  try {
    const { data, error } = await supabase.rpc('admin_approve_job', {
      job_id: jobId,
      approval_reason: approvalReason || null,
      review_notes: reviewNotes || null
    });
    
    if (error) {
      console.error('Error approving job:', error);
      throw new Error(`Failed to approve job: ${error.message}`);
    }
    
    console.log('Job approved successfully:', data);
    return { success: true, message: 'Job approved successfully' };
  } catch (error: any) {
    console.error('Error in approveJob:', error);
    throw new Error(error.message || 'Failed to approve job');
  }
};

// Enhanced job rejection with mandatory reason
export const rejectJob = async (
  jobId: string, 
  rejectionReason: string, 
  reviewNotes?: string
): Promise<{ success: boolean; message?: string }> => {
  console.log('Rejecting job:', jobId, { rejectionReason, reviewNotes });
  
  if (!rejectionReason || rejectionReason.trim() === '') {
    throw new Error('Rejection reason is required');
  }
  
  try {
    const { data, error } = await supabase.rpc('admin_reject_job', {
      job_id: jobId,
      rejection_reason: rejectionReason,
      review_notes: reviewNotes || null
    });
    
    if (error) {
      console.error('Error rejecting job:', error);
      throw new Error(`Failed to reject job: ${error.message}`);
    }
    
    console.log('Job rejected successfully:', data);
    return { success: true, message: 'Job rejected successfully' };
  } catch (error: any) {
    console.error('Error in rejectJob:', error);
    throw new Error(error.message || 'Failed to reject job');
  }
};

// Batch approval operations
export const batchApproveJobs = async (
  jobIds: string[], 
  approvalReason?: string
): Promise<BatchApprovalResult[]> => {
  console.log('Batch approving jobs:', jobIds, { approvalReason });
  
  if (!jobIds || jobIds.length === 0) {
    throw new Error('No job IDs provided');
  }
  
  try {
    const { data, error } = await supabase.rpc('admin_batch_approve_jobs', {
      job_ids: jobIds,
      approval_reason: approvalReason || null
    });
    
    if (error) {
      console.error('Error in batch approval:', error);
      throw new Error(`Failed to batch approve jobs: ${error.message}`);
    }
    
    console.log('Batch approval completed:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error in batchApproveJobs:', error);
    throw new Error(error.message || 'Failed to batch approve jobs');
  }
};

// Get approval history for a job
export const getJobApprovalHistory = async (jobId: string): Promise<ApprovalHistoryEntry[]> => {
  console.log('Fetching approval history for job:', jobId);
  
  try {
    const { data, error } = await supabase.rpc('admin_get_job_approval_history', {
      job_id: jobId
    });
    
    if (error) {
      console.error('Error fetching approval history:', error);
      throw new Error(`Failed to fetch approval history: ${error.message}`);
    }
    
    console.log('Approval history fetched successfully:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error in getJobApprovalHistory:', error);
    throw new Error(error.message || 'Failed to fetch approval history');
  }
};

// Update job status (legacy function - kept for backward compatibility)
export const updateJobStatus = async (jobId: string, status: string): Promise<{ success: boolean }> => {
  console.log('Updating job status (legacy):', jobId, status);
  
  try {
    const { error } = await supabase
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', jobId);
    
    if (error) {
      console.error('Error updating job status:', error);
      throw new Error(`Failed to update job status: ${error.message}`);
    }
    
    console.log('Job status updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateJobStatus:', error);
    throw new Error(error.message || 'Failed to update job status');
  }
};

// Create admin job
export const createAdminJob = async (jobData: any): Promise<string> => {
  console.log('Creating admin job:', jobData);
  
  try {
    const { data, error } = await supabase
      .rpc('admin_create_job', {
        job_title: jobData.title,
        job_company: jobData.company,
        job_location: jobData.location,
        job_description: jobData.description,
        job_requirements: jobData.requirements,
        job_employment_type: jobData.employment_type,
        job_experience_level: jobData.experience_level,
        job_salary_min: jobData.salary_min,
        job_salary_max: jobData.salary_max,
        job_salary_currency: jobData.salary_currency,
        job_tech_stack: jobData.tech_stack,
        job_visa_sponsorship: jobData.visa_sponsorship,
        job_remote: jobData.remote,
        job_company_size: jobData.company_size,
        job_application_deadline: jobData.application_deadline,
        job_logo: jobData.logo,
        job_status: jobData.status,
        job_application_type: jobData.application_type,
        job_application_value: jobData.application_value,
        job_employer_id: jobData.employer_id,
        job_sponsored: jobData.sponsored
      });
    
    if (error) {
      console.error('Error creating admin job:', error);
      throw new Error(`Failed to create job: ${error.message}`);
    }
    
    console.log('Admin job created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error in createAdminJob:', error);
    throw new Error(error.message || 'Failed to create job');
  }
};

// Update admin job
export const updateAdminJob = async (jobId: string, jobData: any): Promise<string> => {
  console.log('Updating admin job:', jobId, jobData);
  
  try {
    const { error } = await supabase
      .rpc('admin_update_job', {
        job_id: jobId,
        job_title: jobData.title,
        job_company: jobData.company,
        job_location: jobData.location,
        job_description: jobData.description,
        job_requirements: jobData.requirements,
        job_employment_type: jobData.employment_type,
        job_experience_level: jobData.experience_level,
        job_salary_min: jobData.salary_min,
        job_salary_max: jobData.salary_max,
        job_salary_currency: jobData.salary_currency,
        job_tech_stack: jobData.tech_stack,
        job_visa_sponsorship: jobData.visa_sponsorship,
        job_remote: jobData.remote,
        job_company_size: jobData.company_size,
        job_application_deadline: jobData.application_deadline,
        job_logo: jobData.logo,
        job_status: jobData.status,
        job_application_type: jobData.application_type,
        job_application_value: jobData.application_value,
        job_sponsored: jobData.sponsored
      });
    
    if (error) {
      console.error('Error updating admin job:', error);
      throw new Error(`Failed to update job: ${error.message}`);
    }
    
    console.log('Admin job updated successfully');
    return jobId;
  } catch (error: any) {
    console.error('Error in updateAdminJob:', error);
    throw new Error(error.message || 'Failed to update job');
  }
};

// Delete admin job
export const deleteAdminJob = async (jobId: string): Promise<boolean> => {
  console.log('Deleting admin job:', jobId);
  
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error('Error deleting admin job:', error);
      throw new Error(`Failed to delete job: ${error.message}`);
    }
    
    console.log('Admin job deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error in deleteAdminJob:', error);
    throw new Error(error.message || 'Failed to delete job');
  }
};

// Fetch admin companies
export const fetchAdminCompanies = async (): Promise<Company[]> => {
  console.log('Fetching admin companies...');
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin companies:', error);
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
    
    console.log('Admin companies fetched successfully:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error in fetchAdminCompanies:', error);
    throw new Error(error.message || 'Failed to fetch companies');
  }
};

// Create company
export const createCompany = async (companyData: CompanyFormData): Promise<string> => {
  console.log('Creating company:', companyData);
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        ...companyData,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating company:', error);
      throw new Error(`Failed to create company: ${error.message}`);
    }
    
    console.log('Company created successfully:', data);
    return data.id;
  } catch (error: any) {
    console.error('Error in createCompany:', error);
    throw new Error(error.message || 'Failed to create company');
  }
};

// Update company
export const updateCompany = async (companyId: string, companyData: CompanyFormData & { status?: string }): Promise<boolean> => {
  console.log('Updating company:', companyId, companyData);
  
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        ...companyData,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (error) {
      console.error('Error updating company:', error);
      throw new Error(`Failed to update company: ${error.message}`);
    }
    
    console.log('Company updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error in updateCompany:', error);
    throw new Error(error.message || 'Failed to update company');
  }
};

// Delete company
export const deleteCompany = async (companyId: string): Promise<boolean> => {
  console.log('Deleting company:', companyId);
  
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
    
    if (error) {
      console.error('Error deleting company:', error);
      throw new Error(`Failed to delete company: ${error.message}`);
    }
    
    console.log('Company deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error in deleteCompany:', error);
    throw new Error(error.message || 'Failed to delete company');
  }
};

// Fetch admin stats for dashboard
export const fetchAdminStats = async (): Promise<AdminStats> => {
  console.log('Fetching admin stats...');
  
  try {
    // Fetch all jobs using admin function to get real counts
    const { data: jobsData, error: jobsError } = await supabase
      .rpc('get_admin_jobs');
    
    if (jobsError) {
      console.error('Error fetching jobs for stats:', jobsError);
      throw new Error(`Failed to fetch jobs for stats: ${jobsError.message}`);
    }
    
    // Calculate job statistics
    const totalJobs = jobsData?.length || 0;
    const pendingApprovals = jobsData?.filter(job => job.status === 'pending')?.length || 0;
    
    // Fetch revenue data from subscribers table
    const { data: subscribersData, error: subscribersError } = await supabase
      .from('subscribers')
      .select('subscription_amount, subscription_currency, subscribed, subscription_start, subscription_end')
      .eq('subscribed', true);
    
    if (subscribersError) {
      console.error('Error fetching subscribers for revenue:', subscribersError);
    }
    
    // Calculate revenue statistics
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    const activeSubscriptions = subscribersData?.length || 0;
    
    if (subscribersData) {
      const now = new Date();
      
      subscribersData.forEach(subscriber => {
        const amount = subscriber.subscription_amount || 0;
        const subscriptionEnd = subscriber.subscription_end ? new Date(subscriber.subscription_end) : null;
        
        // Only count active subscriptions (not expired)
        if (!subscriptionEnd || subscriptionEnd > now) {
          // Convert cents to dollars
          const dollarAmount = amount / 100;
          totalRevenue += dollarAmount;
          
          // For monthly revenue, assume all subscriptions are monthly for now
          // This could be enhanced to check subscription intervals
          monthlyRevenue += dollarAmount;
        }
      });
    }
    
    // Fetch other counts using proper methods
    const [usersResult, companiesResult] = await Promise.all([
      supabase.rpc('get_admin_users'),
      supabase.from('companies').select('id', { count: 'exact', head: true })
    ]);
    
    const totalUsers = usersResult.data?.length || 0;
    const totalCompanies = companiesResult.count || 0;
    
    const stats: AdminStats = {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      activeSubscriptions,
      pendingApprovals,
      newMessages: 0 // TODO: Count unread messages
    };
    
    console.log('Admin stats fetched successfully:', stats);
    return stats;
  } catch (error: any) {
    console.error('Error in fetchAdminStats:', error);
    throw new Error(error.message || 'Failed to fetch admin stats');
  }
};

// Fetch recent users using get_admin_users function and limiting results
export const fetchRecentUsers = async (limit: number = 5): Promise<any[]> => {
  console.log('Fetching recent users...');
  
  try {
    const { data, error } = await supabase
      .rpc('get_admin_users');
    
    if (error) {
      console.error('Error fetching recent users:', error);
      throw new Error(`Failed to fetch recent users: ${error.message}`);
    }
    
    // Transform and limit the data to match expected format
    const transformedData = (data || [])
      .slice(0, limit)
      .map((user: any) => ({
        id: user.id,
        name: user.full_name || user.username || 'Unknown User',
        email: user.email || 'N/A',
        role: user.role || 'user'
      }));
    
    console.log('Recent users fetched successfully:', transformedData);
    return transformedData;
  } catch (error: any) {
    console.error('Error in fetchRecentUsers:', error);
    throw new Error(error.message || 'Failed to fetch recent users');
  }
};

// Fetch recent jobs
export const fetchRecentJobs = async (limit: number = 5): Promise<any[]> => {
  console.log('Fetching recent jobs...');
  
  try {
    const { data, error } = await supabase
      .rpc('get_admin_jobs');
    
    if (error) {
      console.error('Error fetching recent jobs:', error);
      throw new Error(`Failed to fetch recent jobs: ${error.message}`);
    }
    
    // Transform and limit the data to match expected format
    const transformedData = (data || [])
      .slice(0, limit)
      .map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        postedDate: job.created_at,
        status: job.status
      }));
    
    console.log('Recent jobs fetched successfully:', transformedData);
    return transformedData;
  } catch (error: any) {
    console.error('Error in fetchRecentJobs:', error);
    throw new Error(error.message || 'Failed to fetch recent jobs');
  }
};
