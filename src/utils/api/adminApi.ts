
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/api';

// Fetch dashboard stats for admin
export const fetchAdminStats = async () => {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;

    // Get companies count (employers)
    // In a real app, you might have a separate companies table
    // For now we're mocking this data
    const totalCompanies = 12; // Mock data as we don't have company roles in the profile yet
    
    // Get total jobs count
    const { count: totalJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    if (jobsError) throw jobsError;

    // Get pending jobs count
    const { count: pendingApprovals, error: pendingError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (pendingError) throw pendingError;

    // Get recent revenue (mock data as this would typically come from a payment provider)
    // In a real app, you would fetch this from your payment processor
    const totalRevenue = await calculateTotalRevenue();

    // Get new messages (unread messages count)
    const { count: newMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    
    if (messagesError) throw messagesError;

    return {
      totalUsers: totalUsers || 0,
      totalCompanies: totalCompanies || 0,
      totalJobs: totalJobs || 0,
      pendingApprovals: pendingApprovals || 0,
      totalRevenue,
      newMessages: newMessages || 0
    };
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    // Return default values in case of error
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

// Mock function to calculate revenue (would be replaced by real payment data)
const calculateTotalRevenue = async () => {
  try {
    // This would typically come from your payment provider API
    // For now, we'll calculate based on featured job listings as an example
    const { data: featuredJobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_featured', true);
    
    if (error) throw error;
    
    // Mock calculation: $100 per featured job
    return (featuredJobs?.length || 0) * 100;
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
};

// Fetch recent users for admin dashboard
export const fetchRecentUsers = async (limit = 3) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      name: user.full_name || user.username || 'User',
      email: `${user.username || 'user'}@example.com`, // Email might be in auth.users, not profiles
      role: 'candidate', // Default role since we don't have roles in profiles yet
      status: 'active', // Mock status
      joined: user.created_at
    }));
  } catch (error: any) {
    console.error('Error fetching recent users:', error);
    return [];
  }
};

// Fetch recent jobs for admin dashboard
export const fetchRecentJobs = async (limit = 3) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company, created_at, status')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      postedDate: job.created_at,
      status: job.status
    }));
  } catch (error: any) {
    console.error('Error fetching recent jobs:', error);
    return [];
  }
};
