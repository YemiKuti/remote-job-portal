
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TailoredCVWorkflow } from "@/components/cv/TailoredCVWorkflow";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, History, Crown, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSupabase";
import { Link } from "react-router-dom";

const TailoredResumes = () => {
  const [userId, setUserId] = React.useState<string>("");
  const { subscribed, loading: subscriptionLoading, error: subscriptionError } = useSubscription();

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Show loading state while checking subscription
  if (!userId || subscriptionLoading) {
    return (
      <DashboardLayout userType="jobSeeker">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if subscription check failed
  if (subscriptionError) {
    return (
      <DashboardLayout userType="jobSeeker">
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-700">
                Unable to Verify Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We couldn't verify your subscription status. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Link to="/job-seeker">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Strictly check subscription status - only allow access if explicitly subscribed
  if (!subscribed) {
    return (
      <DashboardLayout userType="jobSeeker">
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Lock className="h-5 w-5 text-blue-500" />
                Premium Feature: AI-Powered CV Tailoring
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-blue-800 font-medium mb-4">
                  🔒 This feature requires an active subscription
                </p>
                <p className="text-gray-600">
                  Create targeted resumes with compelling career profiles tailored to specific job opportunities. 
                  This premium feature uses advanced AI to analyze job requirements and optimize your CV for maximum impact.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  What you'll get with Premium:
                </h3>
                <ul className="text-sm text-blue-800 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    AI-powered job requirement analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Custom 3-sentence career profiles
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Keyword optimization for ATS systems
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Skills and experience highlighting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Multiple tailored versions for different roles
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    Professional formatting and downloads
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/job-seeker">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Only render the actual feature if user is confirmed subscribed
  return (
    <DashboardLayout userType="jobSeeker">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">AI-Powered CV Tailoring</h1>
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            <Crown className="h-3 w-3" />
            Premium
          </div>
        </div>
        <p className="text-gray-600">
          Create targeted resumes optimized for specific job opportunities using advanced AI analysis.
        </p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Create Tailored Resume
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Previous Resumes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <TailoredCVWorkflow userId={userId} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <TailoredResumesList />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TailoredResumes;
