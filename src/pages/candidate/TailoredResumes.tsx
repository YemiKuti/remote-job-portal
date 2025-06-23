
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TailoredCVWorkflow } from "@/components/cv/TailoredCVWorkflow";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, History, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSupabase";
import { Link } from "react-router-dom";

const TailoredResumes = () => {
  const [userId, setUserId] = React.useState<string>("");
  const { subscribed, loading: subscriptionLoading } = useSubscription();

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  if (!userId || subscriptionLoading) {
    return (
      <DashboardLayout userType="jobSeeker">
        <div className="text-center py-8">Loading...</div>
      </DashboardLayout>
    );
  }

  // Show subscription required message for unpaid users
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
                <Sparkles className="h-5 w-5 text-blue-500" />
                Premium Feature: AI-Powered CV Tailoring
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-600">
                Create targeted resumes with compelling career profiles tailored to specific job opportunities. 
                This premium feature uses advanced AI to analyze job requirements and optimize your CV for maximum impact.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
                <ul className="text-sm text-blue-800 space-y-1 text-left max-w-md mx-auto">
                  <li>• AI-powered job requirement analysis</li>
                  <li>• Custom 3-sentence career profiles</li>
                  <li>• Keyword optimization for ATS systems</li>
                  <li>• Skills and experience highlighting</li>
                  <li>• Multiple tailored versions for different roles</li>
                  <li>• Professional formatting and downloads</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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

  return (
    <DashboardLayout userType="jobSeeker">
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
