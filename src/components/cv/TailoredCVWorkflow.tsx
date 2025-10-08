
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
      
      toast.info('📤 Uploading your CV for processing...');

      // Generate unique job ID
      const jobIdStr = `cv-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || null;

      // Upload file to storage if not already uploaded
      let filePath = resume.file_path;
      if (!filePath && resume.file) {
        const fileName = `${userId}/${Date.now()}-${resume.name || 'resume.pdf'}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resume.file);

        if (uploadError) {
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }
        filePath = fileName;
      }

      setProgress(40);

      // Create job record
      const { data: jobData, error: jobError } = await supabase
        .from('cv_jobs')
        .insert({
          user_id: userId,
          job_id: jobIdStr,
          file_name: resume.name || resume.file_name || 'resume.pdf',
          file_path: filePath,
          file_size: resume.file_size || resume.size || 0,
          user_email: userEmail,
          job_title: jobTitle || data?.jobTitle,
          company_name: companyName || data?.companyName,
          job_description: desc,
          status: 'queued',
          progress: 0
        })
        .select()
        .single();

      if (jobError) {
        throw new Error(`Failed to create processing job: ${jobError.message}`);
      }

      setCurrentJobId(jobIdStr);
      setProgress(60);

      // Trigger background processing
      await supabase.functions.invoke('process-cv-job', {
        body: { action: 'process_specific', job_id: jobIdStr }
      });

      toast.success('✅ Your CV has been queued for processing!');
      toast.info('Processing will continue in the background. You can leave this page.');

      // Move to tracking step
      setCurrentStep('ai-analysis');
      setProgress(70);

    } catch (error: any) {
      console.error('❌ Error creating CV job:', error);
      setError(error.message || 'Failed to start CV processing');
      toast.error(error.message || 'Failed to upload your CV');
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
              <CardTitle>Ready to Start</CardTitle>
              <CardDescription>Click below to begin tailoring your CV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedJob && (
                <div className="bg-secondary p-4 rounded space-y-2">
                  <p className="text-sm font-medium">Selected Job:</p>
                  <p className="text-sm">{jobTitle} at {companyName}</p>
                </div>
              )}
              {selectedResume && (
                <div className="bg-secondary p-4 rounded space-y-2">
                  <p className="text-sm font-medium">Selected Resume:</p>
                  <p className="text-sm">{selectedResume.name || selectedResume.file_name}</p>
                </div>
              )}
              <Button 
                onClick={() => handleAIAnalysis()}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start CV Tailoring'
                )}
              </Button>
            </CardContent>
          </Card>
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
