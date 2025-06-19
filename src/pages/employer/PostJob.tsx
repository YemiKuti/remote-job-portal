
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useEmployerSubscriptionAccess } from '@/hooks/useEmployerSubscriptionAccess';
import { SubscriptionRequired } from '@/components/employer/SubscriptionRequired';
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

  // Reached post limit (including free tier limit)
  if (!canPost) {
    return (
      <DashboardLayout userType="employer">
        <div className="max-w-lg mx-auto mt-10">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {hasActiveSubscription ? (
                <>
                  You've reached your job posting limit for your <b>{subscriptionTier}</b> plan ({postLimit} jobs).
                </>
              ) : (
                <>
                  You've reached your free job posting limit (1 job). 
                  <div className="mt-2 text-sm text-muted-foreground">
                    Upgrade to a paid plan to post more jobs and unlock additional features.
                  </div>
                </>
              )}
              <div className="mt-2">
                <Button asChild className="bg-job-blue hover:bg-job-darkBlue w-full">
                  <a href="/pricing" target="_self">
                    <Crown className="mr-2 h-4 w-4" />
                    {hasActiveSubscription ? 'Upgrade Plan' : 'View Pricing Plans'}
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
              Jobs posted: <Badge variant="secondary">{activePostsCount} / {postLimit}</Badge>
            </span>
            <span>
              Current Plan: <Badge variant={hasActiveSubscription ? "default" : "outline"}>
                {subscriptionTier || "Free"}
              </Badge>
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // User has access and is under limit
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
              <span className="font-medium">Current Plan:</span>{" "}
              <Badge variant={hasActiveSubscription ? "default" : "outline"}>
                {subscriptionTier || "Free"}
              </Badge>
            </span>
            {postLimit !== null && (
              <span>
                <span className="font-medium">Job Posts Left:</span>{" "}
                <Badge variant={activePostsCount === postLimit ? "destructive" : "outline"}>
                  {Math.max(0, postLimit - activePostsCount)}
                </Badge>
              </span>
            )}
          </div>
          <Button asChild size="sm" variant="outline">
            <a href="/pricing" target="_self">
              <Crown className="mr-1 h-3 w-3" />
              Upgrade
            </a>
          </Button>
        </div>
        {!hasActiveSubscription && (
          <Alert className="mb-6">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You're using our free plan! Post 1 job at no cost. 
              <a href="/pricing" className="ml-1 text-job-blue hover:underline">
                Upgrade for more postings and premium features.
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
