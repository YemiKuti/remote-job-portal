
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useEmployerSubscriptionAccess } from '@/hooks/useEmployerSubscriptionAccess';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Subscription = () => {
  const {
    hasActiveSubscription,
    subscriptionTier,
    postLimit,
    activePostsCount,
    canPost,
    loading,
    error,
    refresh: refreshSubscription
  } = useEmployerSubscriptionAccess();

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
      default: return tier || 'Free Plan';
    }
  };

  const packageFeatures = {
    single: [
      "1 job posting",
      "6-month listing duration",
      "Basic company profile",
      "Email support"
    ],
    package5: [
      "5 job postings",
      "6-month listing duration",
      "Enhanced company profile",
      "Priority email support",
      "Basic analytics"
    ],
    package10: [
      "10 job postings",
      "6-month listing duration",
      "Premium company profile",
      "Priority support",
      "Advanced analytics",
      "Featured job placement"
    ]
  };

  if (loading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading subscription details...</p>
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
            <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
            <p className="text-muted-foreground">
              Manage your job posting packages and subscription details.
            </p>
          </div>
          <Button onClick={refreshSubscription} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
        </div>
        <Separator />

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Subscription Status */}
        <Card className="border-2 border-dashed border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Your active job posting package and usage details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasActiveSubscription ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSubscriptionBadgeColor(subscriptionTier)}>
                        {getSubscriptionDisplayName(subscriptionTier)}
                      </Badge>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activePostsCount} of {postLimit} job postings used
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${postLimit ? (activePostsCount / postLimit) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Package Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptionTier && packageFeatures[subscriptionTier.toLowerCase() as keyof typeof packageFeatures]?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {!canPost && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      You've used all available job postings for your current package. Upgrade to post more jobs.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6">
                  Purchase a job posting package to start hiring top talent.
                </p>
                <Link to="/pricing">
                  <Button className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Browse Packages
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Packages */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Packages</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Single Job Package */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Single Job</CardTitle>
                <div className="text-2xl font-bold">£20</div>
                <CardDescription>Perfect for occasional hiring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {packageFeatures.single.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/pricing">
                  <Button className="w-full" variant="outline">
                    Purchase Package
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 5 Jobs Package */}
            <Card className="hover:shadow-md transition-shadow border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">5 Jobs Package</CardTitle>
                  <Badge className="bg-purple-100 text-purple-800">Popular</Badge>
                </div>
                <div className="text-2xl font-bold">£70</div>
                <CardDescription>Best for growing companies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {packageFeatures.package5.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/pricing">
                  <Button className="w-full">
                    Purchase Package
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 10 Jobs Package */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">10 Jobs Package</CardTitle>
                <div className="text-2xl font-bold">£150</div>
                <CardDescription>For active recruiters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {packageFeatures.package10.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/pricing">
                  <Button className="w-full" variant="outline">
                    Purchase Package
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-job-green mb-2">How long are job postings active?</h4>
              <p className="text-gray-600 text-sm">All job postings have a 6-month validity period from the time they are published.</p>
            </div>
            <div>
              <h4 className="font-medium text-job-green mb-2">Can I upgrade my package?</h4>
              <p className="text-gray-600 text-sm">Yes, you can purchase additional packages at any time to increase your job posting limit.</p>
            </div>
            <div>
              <h4 className="font-medium text-job-green mb-2">What happens when my jobs expire?</h4>
              <p className="text-gray-600 text-sm">Jobs automatically expire after 6 months. You can reactivate them by purchasing a new package.</p>
            </div>
            <div>
              <h4 className="font-medium text-job-green mb-2">How can I get support?</h4>
              <p className="text-gray-600 text-sm">Contact us at hello@africantechjobs.co.uk for any assistance with your subscription.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
