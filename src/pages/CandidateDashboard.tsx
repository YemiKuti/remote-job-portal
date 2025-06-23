import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  BookmarkIcon, 
  TrendingUp,
  Bell,
  Users,
  AlertCircle,
  RefreshCw,
  Search,
  Settings,
  Crown,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { fetchCandidateApplications, fetchSavedJobs } from '@/utils/api/candidateApi';
import { NotificationCenter } from '@/components/candidate/NotificationCenter';
import { NotificationPreferences } from '@/components/NotificationPreferences';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription, useManageSubscription } from '@/hooks/useSupabase';

interface DashboardData {
  applications: any[];
  savedJobs: any[];
}

interface LoadingState {
  applications: boolean;
  savedJobs: boolean;
  overall: boolean;
}

interface ErrorState {
  applications: string | null;
  savedJobs: string | null;
  general: string | null;
}

const CandidateDashboard = () => {
  const { user, isLoading: authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Subscription hooks
  const { subscribed, subscription_tier, subscription_end, loading: subLoading, checkSubscription } = useSubscription();
  const { openCustomerPortal, isLoading: portalLoading } = useManageSubscription();
  
  const [data, setData] = useState<DashboardData>({
    applications: [],
    savedJobs: []
  });
  
  const [loading, setLoading] = useState<LoadingState>({
    applications: true,
    savedJobs: true,
    overall: true
  });
  
  const [errors, setErrors] = useState<ErrorState>({
    applications: null,
    savedJobs: null,
    general: null
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const loadApplications = async (userId: string) => {
    try {
      console.log('📊 Dashboard: Loading applications for user:', userId);
      setLoading(prev => ({ ...prev, applications: true }));
      setErrors(prev => ({ ...prev, applications: null }));
      
      const appsData = await fetchCandidateApplications(userId);
      console.log('📊 Dashboard: Applications loaded:', appsData.length);
      setData(prev => ({ ...prev, applications: appsData }));
    } catch (error: any) {
      console.error('📊 Dashboard: Error loading applications:', error);
      setErrors(prev => ({ ...prev, applications: 'Failed to load applications' }));
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  };

  const loadSavedJobs = async (userId: string) => {
    try {
      console.log('📊 Dashboard: Loading saved jobs for user:', userId);
      setLoading(prev => ({ ...prev, savedJobs: true }));
      setErrors(prev => ({ ...prev, savedJobs: null }));
      
      const savedData = await fetchSavedJobs(userId);
      console.log('📊 Dashboard: Saved jobs loaded:', savedData.length);
      setData(prev => ({ ...prev, savedJobs: savedData }));
    } catch (error: any) {
      console.error('📊 Dashboard: Error loading saved jobs:', error);
      setErrors(prev => ({ ...prev, savedJobs: 'Failed to load saved jobs' }));
    } finally {
      setLoading(prev => ({ ...prev, savedJobs: false }));
    }
  };

  const loadDashboardData = async (userId: string, isRetry = false) => {
    if (isRetry) {
      console.log('📊 Dashboard: Retrying data load, attempt:', retryCount + 1);
    } else {
      console.log('📊 Dashboard: Initial data load for user:', userId);
    }
    
    setLoading(prev => ({ ...prev, overall: true }));
    setErrors(prev => ({ ...prev, general: null }));

    // Load data concurrently with individual error handling
    const loadPromises = [
      loadApplications(userId),
      loadSavedJobs(userId)
    ];

    try {
      await Promise.allSettled(loadPromises);
      console.log('📊 Dashboard: All data loading completed');
    } catch (error: any) {
      console.error('📊 Dashboard: Critical error during data loading:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to load dashboard data' }));
    } finally {
      setLoading(prev => ({ ...prev, overall: false }));
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries && user) {
      setRetryCount(prev => prev + 1);
      loadDashboardData(user.id, true);
    }
  };

  useEffect(() => {
    if (!user) {
      console.log('📊 Dashboard: No user available, skipping data load');
      return;
    }

    // Add a small delay to ensure auth is fully settled
    const loadTimer = setTimeout(() => {
      loadDashboardData(user.id);
    }, 100);

    return () => clearTimeout(loadTimer);
  }, [user]);

  // Auto-retry mechanism with exponential backoff
  useEffect(() => {
    if (errors.general && retryCount < maxRetries && user) {
      const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`📊 Dashboard: Auto-retry in ${retryDelay}ms`);
      
      const retryTimer = setTimeout(() => {
        handleRetry();
      }, retryDelay);

      return () => clearTimeout(retryTimer);
    }
  }, [errors.general, retryCount, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSubscriptionEnd = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionBadgeColor = (tier: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annual': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionDisplayName = (tier: string | null) => {
    switch (tier?.toLowerCase()) {
      case 'monthly': return 'Job Seeker Monthly';
      case 'quarterly': return 'Job Seeker Quarterly';
      case 'annual': return 'Job Seeker Annual';
      default: return tier || 'Active';
    }
  };

  // Show loading spinner for auth or initial overall loading
  if (authLoading || (loading.overall && data.applications.length === 0)) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Authenticating...' : 'Loading your dashboard...'}
          </p>
          {loading.overall && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${loading.applications ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>Applications {loading.applications ? 'loading...' : 'loaded'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${loading.savedJobs ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>Saved jobs {loading.savedJobs ? 'loading...' : 'loaded'}</span>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Show error state with retry option
  if (authError || errors.general) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError || errors.general}
            </AlertDescription>
          </Alert>
          {retryCount < maxRetries && (
            <Button onClick={handleRetry} disabled={loading.overall}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading.overall ? 'animate-spin' : ''}`} />
              Retry ({retryCount + 1}/{maxRetries})
            </Button>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your job search activity.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/jobs">
              <Button className="bg-job-green hover:bg-job-darkGreen flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse Jobs
              </Button>
            </Link>
          </div>
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
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Your current subscription plan and benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : subscribed ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSubscriptionBadgeColor(subscription_tier)}>
                            {getSubscriptionDisplayName(subscription_tier)}
                          </Badge>
                          <span className="text-sm text-green-600 font-medium">Active</span>
                        </div>
                        {subscription_end && (
                          <p className="text-sm text-muted-foreground">
                            Renews on {formatSubscriptionEnd(subscription_end)}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openCustomerPortal}
                        disabled={portalLoading}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        {portalLoading ? 'Loading...' : 'Manage'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="font-semibold text-green-600">✓ Premium Jobs</div>
                        <div className="text-muted-foreground">Access to exclusive listings</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="font-semibold text-green-600">✓ AI Resume Tailoring</div>
                        <div className="text-muted-foreground">Optimize for each application</div>
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
                          Upgrade to access premium features
                        </p>
                      </div>
                      <Link to="/pricing">
                        <Button size="sm" className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Upgrade Now
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-400">Premium Jobs</div>
                        <div className="text-muted-foreground">Upgrade to unlock</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-400">AI Resume Tailoring</div>
                        <div className="text-muted-foreground">Upgrade to unlock</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-400">Priority Support</div>
                        <div className="text-muted-foreground">Upgrade to unlock</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={checkSubscription}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Show individual section errors */}
            {(errors.applications || errors.savedJobs) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some sections couldn't load properly. You can still use the dashboard with available data.
                  {retryCount < maxRetries && (
                    <Button variant="link" onClick={handleRetry} className="ml-2 p-0 h-auto">
                      Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading.applications ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ) : errors.applications ? (
                    <div className="text-red-500 text-sm">Failed to load</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{data.applications.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {data.applications.filter(app => app.status === 'pending').length} pending review
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
                  <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading.savedJobs ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ) : errors.savedJobs ? (
                    <div className="text-red-500 text-sm">Failed to load</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{data.savedJobs.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Jobs bookmarked for later
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading.applications ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {data.applications.filter(app => app.status === 'interview').length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active interview processes
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Job Offers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading.applications ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {data.applications.filter(app => app.status === 'offer').length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pending decisions
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Applications */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>
                      Your latest job applications and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading.applications ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="animate-pulse border-b pb-4">
                            <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        ))}
                      </div>
                    ) : errors.applications ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-2" />
                        <p className="text-red-600">Failed to load applications</p>
                        <Button variant="outline" onClick={() => loadApplications(user?.id || '')} className="mt-2">
                          Try Again
                        </Button>
                      </div>
                    ) : data.applications.length > 0 ? (
                      <div className="space-y-4">
                        {data.applications.slice(0, 5).map((app) => (
                          <div key={app.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                              <h4 className="font-medium">{app.job?.title || "Position"}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Building className="mr-1 h-3 w-3" />
                                <span>{app.job?.company || "Company"}</span>
                                <MapPin className="ml-2 mr-1 h-3 w-3" />
                                <span>{app.job?.location || "Location"}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                <span>Applied {formatDate(app.applied_date)}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(app.status)}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                        <div className="pt-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate('/candidate/applications')}
                          >
                            View All Applications
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No applications yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                        <Link to="/jobs">
                          <Button>Browse Jobs</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Notifications */}
              <div>
                {user && <NotificationCenter userId={user.id} />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {user && <NotificationCenter userId={user.id} />}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {user && <NotificationPreferences userId={user.id} userType="candidate" />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
