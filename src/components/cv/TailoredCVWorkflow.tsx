
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Brain,
  Target,
  Trophy
} from "lucide-react";
import { JobSelectionStep } from "./workflow/JobSelectionStep";
import { ResumeUploadStep } from "./workflow/ResumeUploadStep";
import { AIAnalysisStep } from "./workflow/AIAnalysisStep";
import { DownloadStep } from "./workflow/DownloadStep";
import { supabase } from "@/integrations/supabase/client";
import { extractResumeContent } from "@/utils/resumeProcessor";
import { toast } from "sonner";

interface TailoredCVWorkflowProps {
  userId: string;
}

interface TailoringResult {
  tailoredResume: string;
  score: number;
  analysis: {
    skillsMatched: number;
    requiredSkills: number;
    candidateSkills: string[];
    experienceLevel: string;
    hasCareerProfile: boolean;
    hasContactInfo: boolean;
  };
  suggestions: {
    keywordsMatched: number;
    totalKeywords: number;
    recommendations: string[];
  };
}

type WorkflowStep = 'resume-upload' | 'job-selection' | 'ai-analysis' | 'review' | 'download';

export const TailoredCVWorkflow = ({ userId }: TailoredCVWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('resume-upload');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [tailoringResult, setTailoringResult] = useState<TailoringResult | null>(null);
  const [tailoredResumeId, setTailoredResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepProgress = {
    'resume-upload': 20,
    'job-selection': 40,
    'ai-analysis': 70,
    'review': 90,
    'download': 100
  };

  const handleResumeUpload = (data: { selectedResume: any }) => {
    setSelectedResume(data.selectedResume);
    setCurrentStep('job-selection');
    setProgress(stepProgress['job-selection']);
    console.log('✅ Resume selected:', data.selectedResume.name);
  };

  const handleJobSelection = (data: { selectedJob: any; jobTitle: string; companyName: string; jobDescription: string }) => {
    setSelectedJob(data.selectedJob);
    setJobTitle(data.jobTitle);
    setCompanyName(data.companyName);
    setJobDescription(data.jobDescription);
    setCurrentStep('ai-analysis');
    setProgress(stepProgress['ai-analysis']);
    console.log('✅ Job selected:', data.jobTitle);
  };

  const handleAIAnalysis = async () => {
    if (!selectedJob || !selectedResume) {
      setError('Missing job or resume information');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🤖 Starting AI analysis...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 85));
      }, 200);

      const { data, error: functionError } = await supabase.functions.invoke('tailor-cv', {
        body: {
          resumeContent: selectedResume.content?.text || selectedResume.resume_text || 'Resume content',
          jobDescription: jobDescription,
          jobTitle: jobTitle,
          companyName: companyName,
          candidateData: selectedResume.candidate_data,
          jobRequirements: selectedJob.requirements || []
        }
      });

      clearInterval(progressInterval);

      if (functionError) {
        console.error('❌ AI analysis error:', functionError);
        throw new Error(functionError.message || 'AI analysis failed');
      }

      if (!data.tailoredResume) {
        throw new Error('No tailored resume generated');
      }

      setTailoringResult(data);
      
      // Save the tailored resume to database
      const { data: savedResume, error: saveError } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: userId,
          original_resume_id: selectedResume.id,
          job_id: selectedJob.id,
          tailored_content: data.tailoredResume,
          ai_suggestions: data.suggestions,
          tailoring_score: data.score,
          job_title: jobTitle,
          company_name: companyName,
          job_description: jobDescription
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Error saving tailored resume:', saveError);
        // Continue anyway, we have the data
      } else {
        setTailoredResumeId(savedResume.id);
      }

      setCurrentStep('download');
      setProgress(stepProgress['download']);
      
      console.log('✅ AI analysis completed. Score:', data.score);
      toast.success(`CV tailored successfully! Match score: ${data.score}%`);

    } catch (error) {
      console.error('❌ Error during AI analysis:', error);
      setError(error instanceof Error ? error.message : 'AI analysis failed');
      toast.error('Failed to tailor CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep('resume-upload');
    setSelectedJob(null);
    setSelectedResume(null);
    setJobTitle('');
    setCompanyName('');
    setJobDescription('');
    setTailoringResult(null);
    setTailoredResumeId(null);
    setProgress(stepProgress['resume-upload']);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-500" />
                AI-Powered CV Tailoring
              </CardTitle>
              <CardDescription>
                Create a targeted resume with a compelling 3-sentence career profile
              </CardDescription>
            </div>
            {currentStep !== 'resume-upload' && (
              <Button variant="outline" onClick={resetWorkflow}>
                Start Over
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 'resume-upload' && (
          <ResumeUploadStep 
            userId={userId}
            onComplete={handleResumeUpload}
          />
        )}

        {currentStep === 'job-selection' && (
          <JobSelectionStep 
            onComplete={handleJobSelection}
            onBack={() => setCurrentStep('resume-upload')}
          />
        )}

        {currentStep === 'ai-analysis' && (
          <AIAnalysisStep 
            selectedJob={selectedJob}
            uploadedResume={selectedResume}
            onStartAnalysis={handleAIAnalysis}
            loading={loading}
          />
        )}

        {currentStep === 'download' && tailoringResult && tailoredResumeId && (
          <DownloadStep 
            workflowData={{
              tailoredResumeId: tailoredResumeId,
              jobTitle: jobTitle,
              companyName: companyName,
              selectedResume: selectedResume
            }}
            onRestart={resetWorkflow}
          />
        )}
      </div>
    </div>
  );
};
