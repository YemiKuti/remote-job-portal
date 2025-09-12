
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TailoredCVWorkflow } from "@/components/cv/TailoredCVWorkflow";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { MyResumesDashboard } from "@/components/cv/MyResumesDashboard";
import { CVTailoringTestPanel } from '@/components/cv/CVTailoringTestPanel';
import { EnhancedCVTailoringDialog } from '@/components/cv/EnhancedCVTailoringDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, History, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TailoredResumes = () => {
  const [userId, setUserId] = React.useState<string>("");

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Show loading state while getting user
  if (!userId) {
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

  // Render the CV tailoring feature for all authenticated candidates
  return (
    <DashboardLayout userType="jobSeeker">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">AI-Powered CV Tailoring</h1>
        </div>
        <p className="text-gray-600">
          Create targeted resumes optimized for specific job opportunities using advanced AI analysis.
        </p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Create Tailored Resume
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            My Resumes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Previous Resumes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <TailoredCVWorkflow userId={userId} />
          
          {/* Enhanced CV Tailoring Dialog */}
          <div className="mt-8 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold mb-4">🚀 Enhanced AI CV Tailoring</h3>
            <p className="text-muted-foreground mb-4">
              Try our new enhanced CV tailoring tool with improved file support and better AI processing.
            </p>
            <EnhancedCVTailoringDialog 
              trigger={
                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try Enhanced CV Tailoring
                </Button>
              } 
            />
          </div>

          {/* System Testing Panel */}
          <div className="mt-8">
            <CVTailoringTestPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-6">
          <MyResumesDashboard userId={userId} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <TailoredResumesList />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TailoredResumes;
