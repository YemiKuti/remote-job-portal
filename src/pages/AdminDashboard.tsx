
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  Briefcase, 
  DollarSign, 
  Server, 
  BookOpen,
  Loader2,
  CreditCard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { fetchAdminStats, fetchRecentUsers, fetchRecentJobs } from '@/utils/api';

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0,
    newMessages: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const dashboardStats = await fetchAdminStats();
        setStats(dashboardStats);
        
        // Fetch recent users
        const users = await fetchRecentUsers(3);
        setRecentUsers(users);
        
        // Fetch recent jobs
        const jobs = await fetchRecentJobs(3);
        setRecentJobs(jobs);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [toast]);

  const handleQuickAction = (action: string) => {
    toast({
      title: "Action triggered",
      description: `${action} action initiated`,
    });
  };

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users?userId=${userId}`);
  };

  const handleEditUser = (userId: string) => {
    navigate(`/admin/users?edit=${userId}`);
  };

  const handleReviewJob = (jobId: string) => {
    navigate(`/admin/edit-job/${jobId}`);
  };
  
  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-[calc(100vh-160px)]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="admin">
      <div className="grid grid-cols-1 gap-6">
        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used admin tools and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                asChild
              >
                <Link to="/admin/blog">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                  <span>Manage Blog</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                asChild
              >
                <Link to="/job-scraper">
                  <Server className="h-6 w-6 text-blue-500" />
                  <span>Job Scraper</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                asChild
              >
                <Link to="/admin/create-job">
                  <Briefcase className="h-6 w-6 text-green-500" />
                  <span>Create Job</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                asChild
              >
                <Link to="/admin/users">
                  <Users className="h-6 w-6 text-green-500" />
                  <span>Manage Users</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <Card className="bg-white border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Updated today</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Active employers</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
              <Briefcase className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">Total job postings</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">From subscriptions</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Active subscribers</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>New user registrations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4" />
                  <span>View All</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUsers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent users found.</p>
                </div>
              ) : (
                recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewUser(user.id)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Latest job listings</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link to="/admin/jobs">
                  <Briefcase className="h-4 w-4" />
                  <span>View All</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No recent job listings found.</p>
                </div>
              ) : (
                recentJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • Posted on {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReviewJob(job.id)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
