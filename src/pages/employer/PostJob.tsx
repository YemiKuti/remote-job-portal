
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import JobForm from '@/components/JobForm';
import { useEmployerSubscriptionAccess } from '@/hooks/useEmployerSubscriptionAccess';
import { SubscriptionRequired } from '@/components/employer/SubscriptionRequired';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
          <p className="text-muted-foreground">Checking employer subscription...</p>
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

  // No active subscription, block access
  if (!hasActiveSubscription) {
    return (
      <DashboardLayout userType="employer">
        <SubscriptionRequired employerPlan={subscriptionTier} onRefresh={refresh} />
      </DashboardLayout>
    );
  }

  // Reached post limit, prompt to upgrade
  if (!canPost && postLimit !== null) {
    return (
      <DashboardLayout userType="employer">
        <div className="max-w-lg mx-auto mt-10">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              You've reached your job posting limit for your <b>{subscriptionTier}</b> plan ({postLimit} jobs).
              <div className="mt-2">
                <Button asChild className="bg-job-blue hover:bg-job-darkBlue w-full">
                  <a href="/pricing" target="_self">
                    Upgrade Plan
                  </a>
                </Button>
              </div>
              <div className="text-xs mt-2 text-muted-foreground">
                Want to post more jobs? Upgrade to Pro or Enterprise for a higher limit!
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
              Current Plan: <Badge>{subscriptionTier}</Badge>
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
              <Badge variant="secondary">{subscriptionTier || "Unknown"}</Badge>
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
              Upgrade
            </a>
          </Button>
        </div>
        <JobForm />
      </div>
    </DashboardLayout>
  );
};

export default PostJob;

