
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { CVAnalysisDialog } from "@/components/cv/CVAnalysisDialog";
import { JobRecommendationsList } from "@/components/cv/JobRecommendationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Brain, Target } from "lucide-react";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";

const TailoredResumes = () => {
  const [resumes, setResumes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { fetchAnalyses, fetchRecommendations } = useCVAnalysis();

  React.useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('candidate_resumes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    fetchAnalyses();
    fetchRecommendations();
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              CV Analysis & Job Recommendations
            </CardTitle>
            <CardDescription>
              Upload your CV to get AI-powered analysis and personalized job recommendations tailored to your skills and experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CVAnalysisDialog
              resumes={resumes}
              onAnalysisComplete={handleAnalysisComplete}
              trigger={
                <Button className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analyze CV & Get Recommendations
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Job Recommendations
            </TabsTrigger>
            <TabsTrigger value="tailored" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tailored Resumes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <JobRecommendationsList />
          </TabsContent>

          <TabsContent value="tailored" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Tailored Resumes
                </CardTitle>
                <CardDescription>
                  View and manage your AI-tailored resumes for specific job applications.
                  Each tailored resume is optimized to match the requirements of a particular job.
                </CardDescription>
              </CardHeader>
            </Card>
            <TailoredResumesList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TailoredResumes;
