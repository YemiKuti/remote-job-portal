
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TailoredCVWorkflow } from "@/components/cv/TailoredCVWorkflow";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, History } from "lucide-react";
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

  if (!userId) {
    return (
      <DashboardLayout userType="candidate">
        <div className="text-center py-8">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
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
