import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp,
  Plus,
  AlertCircle,
  RefreshCw,
  Bell,
  Settings,
  Crown,
  CreditCard,
  Clock
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { EmployerNotificationCenter } from '@/components/employer/EmployerNotificationCenter';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmployerSubscriptionAccess } from '@/hooks/useEmployerSubscriptionAccess';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  expiringJobs: number;
}

const EmployerDashboard = () => {
  const { user, isLoading: authLoading, authError } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    expiringJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Subscription access hook
  const {
    hasActiveSubscription,
    subscriptionTier,
    postLimit,
    activePostsCount,
    canPost,
    loading: subLoading,
    error: subError,
    refresh: refreshSubscription
  } = useEmployerSubscriptionAccess();

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    } else if (!authLoading && !user) {
      // If auth is done loading and there's no user, redirect to auth
      console.log('🔒 No user found, redirecting to auth');
      navigate('/auth?role=employer');
    }
  }, [user, authLoading, navigate]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch job statistics with expiration data
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status, views, applications, expires_at')
        .eq('employer_id', user.id);

      if (jobsError) throw jobsError;

      // Calculate stats
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.status === 'active').length || 0;
      const totalApplications = jobs?.reduce((sum, job) => sum + (job.applications || 0), 0) || 0;
      const totalViews = jobs?.reduce((sum, job) => sum + (job.views || 0), 0) || 0;
      
      // Calculate expiring jobs (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringJobs = jobs?.filter(job => {
        if (job.status !== 'active' || !job.expires_at) return false;
        const expirationDate = new Date(job.expires_at);
        return expirationDate <= thirtyDaysFromNow;
      }).length || 0;

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        totalViews,
        expiringJobs
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (user) {
      fetchDashboardStats();
    } else {
      navigate('/auth?role=employer');
    }
  };

  const getSubscriptionBadgeColor = (tier: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'single': return 'bg-blue-100 text-blue-800';
      case 'package5': return 'bg-purple-100 text-purple-800';
      case 'package10': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionDisplayName = (tier: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'single': return 'Single Job Package';
      case 'package5': return '5 Jobs Package';
      case 'package10': return '10 Jobs Package';
      default: return tier || 'Premium';
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (authError || error || !user) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError || error || 'Authentication required. Please sign in to continue.'}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {user ? 'Retry' : 'Sign In'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employer Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your job postings and track applications.
            </p>
          </div>
          <Link to="/employer/jobs/new">
            <Button className="bg-job-green hover:bg-job-darkGreen flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Subscription Status Card */}
            <Card className="border-2 border-dashed border-purple-200 bg-purple-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Your current job posting package and available credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : hasActiveSubscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSubscriptionBadgeColor(subscriptionTier)}>
                            {getSubscriptionDisplayName(subscriptionTier)}
                          </Badge>
                          <span className="text-sm text-green-600 font-medium">Active</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activePostsCount} of {postLimit} job postings used
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ✓ All active jobs have a 6-month validity period
                        </p>
                      </div>
                      <Link to="/employer/subscription">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Upgrade Package
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="font-semibold text-green-600">✓ Featured Listings</div>
                        <div className="text-muted-foreground">Enhanced visibility</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="font-semibold text-green-600">✓ 6-Month Validity</div>
                        <div className="text-muted-foreground">Extended job posting period</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="font-semibold text-green-600">✓ Priority Support</div>
                        <div className="text-muted-foreground">Get help when you need it</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline">Free Plan</Badge>
                        <p className="text-sm text-muted-foreground">
                          Purchase a job posting package to get started
                        </p>
                      </div>
                      <Link to="/employer/subscription">
                        <Button size="sm" className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Buy Package
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-400">Featured Listings</div>
                        <div className="text-muted-foreground">Purchase to unlock</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-400">6-Month Validity</div>
                        <div className="text-muted-foreground">Purchase to unlock</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-400">Priority Support</div>
                        <div className="text-muted-foreground">Purchase to unlock</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refreshSubscription}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeJobs} currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all job postings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    Job posting views
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.expiringJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    Within 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Of your jobs are active
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Expiring Jobs Alert */}
            {stats.expiringJobs > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  You have {stats.expiringJobs} job{stats.expiringJobs > 1 ? 's' : ''} expiring within 30 days. 
                  <Link to="/employer/jobs" className="ml-1 underline font-medium">
                    Review your job listings
                  </Link> to extend or renew them.
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Link to="/employer/jobs">
                  <CardHeader>
                    <CardTitle className="text-lg">Manage Jobs</CardTitle>
                    <CardDescription>
                      View and edit your job postings
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Link to="/employer/candidates">
                  <CardHeader>
                    <CardTitle className="text-lg">Review Applications</CardTitle>
                    <CardDescription>
                      See who has applied to your jobs
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Link to="/employer/subscription">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Subscription
                    </CardTitle>
                    <CardDescription>
                      Manage your job posting packages
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {user && <EmployerNotificationCenter userId={user.id} />}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {user && <NotificationPreferences userId={user.id} userType="employer" />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
