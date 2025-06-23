
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useEmployerSubscriptionAccess } from '@/hooks/useEmployerSubscriptionAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Crown } from 'lucide-react';

const PostJob = () => {
  const {
    loading,
    error,
    hasActiveSubscription,
    subscriptionTier,
    postLimit,
    activePostsCount,
    canPost,
    refresh,
  } = useEmployerSubscriptionAccess();

  // Loading state
  if (loading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking employer access...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout userType="employer">
        <Alert className="max-w-md mx-auto mt-12">
          <AlertDescription>
            {error}
            <Button onClick={refresh} className="ml-2" variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1 inline" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Reached post limit for paid packages
  if (!canPost && subscriptionTier) {
    return (
      <DashboardLayout userType="employer">
        <div className="max-w-lg mx-auto mt-10">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              You've used all job postings from your <b>{subscriptionTier}</b> package ({postLimit} jobs).
              <div className="mt-2">
                <Button asChild className="bg-job-blue hover:bg-job-darkBlue w-full">
                  <a href="/employer/subscription" target="_self">
                    <Crown className="mr-2 h-4 w-4" />
                    Purchase More Jobs
                  </a>
                </Button>
              </div>
              <Button variant="outline" size="sm" className="mt-4" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-1 inline" />
                Refresh Status
              </Button>
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span>
              Jobs used: <Badge variant="secondary">{activePostsCount} / {postLimit}</Badge>
            </span>
            <span>
              Current Package: <Badge variant={hasActiveSubscription ? "default" : "outline"}>
                {subscriptionTier || "Free"}
              </Badge>
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // User has access (either free with unlimited posts or paid package with remaining credits)
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Post a New Job</h2>
          <p className="text-muted-foreground">
            Create a new job listing for your company.
          </p>
        </div>
        <div className="flex items-center justify-between bg-gray-50 border px-4 py-3 rounded mb-6">
          <div className="flex gap-4">
            <span>
              <span className="font-medium">Current Package:</span>{" "}
              <Badge variant={hasActiveSubscription ? "default" : "outline"}>
                {subscriptionTier || "Free"}
              </Badge>
            </span>
            {subscriptionTier ? (
              <span>
                <span className="font-medium">Jobs Remaining:</span>{" "}
                <Badge variant={activePostsCount === postLimit ? "destructive" : "outline"}>
                  {Math.max(0, (postLimit || 0) - activePostsCount)}
                </Badge>
              </span>
            ) : (
              <span>
                <span className="font-medium">Job Posts:</span>{" "}
                <Badge variant="outline">
                  {activePostsCount} / Unlimited
                </Badge>
              </span>
            )}
          </div>
          <Button asChild size="sm" variant="outline">
            <a href="/employer/subscription" target="_self">
              <Crown className="mr-1 h-3 w-3" />
              {hasActiveSubscription ? "Buy More Jobs" : "View Packages"}
            </a>
          </Button>
        </div>
        {!hasActiveSubscription && (
          <Alert className="mb-6">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You're using our free plan with unlimited job postings! 
              <a href="/employer/subscription" className="ml-1 text-job-blue hover:underline">
                Purchase job packages for enhanced features and priority placement.
              </a>
            </AlertDescription>
          </Alert>
        )}
        <JobForm />
      </div>
    </DashboardLayout>
  );
};

export default PostJob;
