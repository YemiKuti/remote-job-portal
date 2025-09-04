
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TailoredCVWorkflow } from "@/components/cv/TailoredCVWorkflow";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
