
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Briefcase, 
  AlertTriangle,
  Loader2,
  Brain,
  Upload
} from "lucide-react";
import { JobSelectionStep } from "./workflow/JobSelectionStep";
import { EnhancedJobSelection } from "./EnhancedJobSelection";
import { ResumeUploadStep } from "./workflow/ResumeUploadStep";
import { DownloadStep } from "./workflow/DownloadStep";
import { DirectCVTailoringDialog } from "./DirectCVTailoringDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CVJobTracker } from "./CVJobTracker";

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

type WorkflowStep = 'resume-upload' | 'job-selection' | 'ai-analysis' | 'download';

export const TailoredCVWorkflow = ({ userId }: TailoredCVWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('resume-upload');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [tailoringResult, setTailoringResult] = useState<TailoringResult | null>(null);
  const [tailoredResumeId, setTailoredResumeId] = useState<string | null>(null);
  const [tailoredDownloadUrl, setTailoredDownloadUrl] = useState<string | null>(null);
  const [tailoredMarkdownUrl, setTailoredMarkdownUrl] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepProgress = {
    'resume-upload': 20,
    'job-selection': 40,
    'ai-analysis': 70,
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
    // Move to AI analysis step and show loading immediately
    setCurrentStep('ai-analysis');
    setLoading(true);
    setProgress(stepProgress['ai-analysis']);
    handleAIAnalysis(data);
  };

  const handleAIAnalysis = async (data?: any) => {
    const resume = selectedResume || data?.selectedResume;
    const job = selectedJob || data?.selectedJob;
    
    if (!job || !resume) {
      setError('Missing job or resume information');
      return;
    }

    // Validate file size (10 MB limit)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (resume.file_size && resume.file_size > maxSize) {
      setError('Your CV is too large. Please upload a file smaller than 10 MB.');
      toast.error('File too large. Maximum size is 10 MB.');
      return;
    }

    const desc = jobDescription || data?.jobDescription;
    if (!desc || desc.trim().length < 50) {
      setError('Job description is too brief. Please provide more details.');
      toast.error('Please provide a detailed job description.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(20);

      toast.info('📤 Processing your CV with AI...');

      // Call edge function with ids only; backend will fetch and extract
      const { data: tailoringResp, error: invokeError } = await supabase.functions.invoke('tailor-cv-v2', {
        body: {
          resumeId: resume.id,
          jobId: job.id,
          userId,
          // Optional overrides if user provided custom title/company/desc
          jobTitle: jobTitle || data?.jobTitle || undefined,
          companyName: companyName || data?.companyName || undefined,
          jobDescription: desc || undefined
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Tailoring failed');
      }

      if (!tailoringResp?.success) {
        throw new Error(tailoringResp?.error || 'Unable to generate tailored CV. Please try again.');
      }

      // Prefer tailoredContent/tailoredResume and id/url from response
      const tailoredText = tailoringResp.tailoredContent || tailoringResp.tailoredResume || '';
      const resumeId = tailoringResp.tailoredResumeId || null;
      const fileUrl = tailoringResp.downloadUrl || null;
      const mdUrl = tailoringResp.markdownUrl || null;

      setTailoredResumeId(resumeId);
      setTailoredDownloadUrl(fileUrl);
      setTailoredMarkdownUrl(mdUrl);
      setTailoringResult({
        tailoredResume: tailoredText,
        score: tailoringResp.score || 85,
        analysis: {
          skillsMatched: 0,
          requiredSkills: 0,
          candidateSkills: [],
          experienceLevel: 'mid',
          hasCareerProfile: true,
          hasContactInfo: true
        },
        suggestions: {
          keywordsMatched: 0,
          totalKeywords: 0,
          recommendations: []
        }
      });

      setProgress(100);
      setCurrentStep('download');
      setLoading(false);
      toast.success('✅ Your tailored CV PDF is ready!');

    } catch (error: any) {
      console.error('❌ Error tailoring CV:', error);
      setError(error.message || 'Failed to tailor your CV');
      toast.error(error.message || 'Failed to tailor your CV');
      setLoading(false);
    }
  };

  const handleJobComplete = (tailoredContent: string) => {
    console.log('✅ Job completed, moving to download step');
    setTailoringResult({
      tailoredResume: tailoredContent,
      score: 85,
      analysis: {
        skillsMatched: 0,
        requiredSkills: 0,
        candidateSkills: [],
        experienceLevel: 'mid',
        hasCareerProfile: true,
        hasContactInfo: true
      },
      suggestions: {
        keywordsMatched: 0,
        totalKeywords: 0,
        recommendations: []
      }
    });
    setCurrentStep('download');
    setProgress(100);
    setLoading(false);
    toast.success('✅ Your tailored CV is ready for download!');
  };

  const handleJobError = (errorMessage: string) => {
    console.error('❌ Job processing failed:', errorMessage);
    setError(errorMessage);
    setLoading(false);
    
    // Provide user-friendly error messages
    let friendlyMessage = errorMessage;
    if (errorMessage.includes('Could not extract readable text')) {
      friendlyMessage = "We couldn't read your file. Please upload a text-based CV (DOCX, TXT, or exported PDF).";
    } else if (errorMessage.includes('timeout')) {
      friendlyMessage = 'Processing took too long. Please try again with a smaller CV.';
    }
    
    toast.error(friendlyMessage);
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
    setCurrentJobId(null);
    setProgress(stepProgress['resume-upload']);
    setError(null);
    setLoading(false);
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
                Create a targeted resume optimized for your dream job
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <DirectCVTailoringDialog
                trigger={
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Quick Upload
                  </Button>
                }
              />
              {currentStep !== 'resume-upload' && (
                <Button variant="outline" onClick={resetWorkflow}>
                  Start Over
                </Button>
              )}
            </div>
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
          <EnhancedJobSelection 
            onJobSelected={handleJobSelection}
            onBack={() => setCurrentStep('resume-upload')}
          />
        )}

        {currentStep === 'ai-analysis' && currentJobId && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Your CV</CardTitle>
              <CardDescription>
                We're tailoring your resume in the background. This may take a few minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CVJobTracker
                jobId={currentJobId}
                onComplete={handleJobComplete}
                onError={handleJobError}
              />
              <div className="mt-4 text-sm text-muted-foreground text-center">
                You can leave this page — we'll continue processing in the background
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'ai-analysis' && !currentJobId && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Your CV</CardTitle>
              <CardDescription>The AI is tailoring your resume. This may take up to a minute.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary p-4 rounded space-y-2">
                {selectedJob && (
                  <p className="text-sm">{jobTitle} at {companyName}</p>
                )}
                {selectedResume && (
                  <p className="text-sm">{selectedResume.name || selectedResume.file_name}</p>
                )}
              </div>
              <div className="w-full flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span className="text-sm text-muted-foreground">Tailoring in progress...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'download' && tailoredResumeId && (
          <DownloadStep 
            workflowData={{
              tailoredResumeId: tailoredResumeId,
              jobTitle: jobTitle,
              companyName: companyName,
              selectedResume: selectedResume,
              downloadUrl: tailoredDownloadUrl || undefined,
              markdownUrl: tailoredMarkdownUrl || undefined
            }}
            onRestart={resetWorkflow}
          />
        )}
      </div>
    </div>
  );
};
