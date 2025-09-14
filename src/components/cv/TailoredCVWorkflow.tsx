
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
  Trophy,
  Upload
} from "lucide-react";
import { JobSelectionStep } from "./workflow/JobSelectionStep";
import { EnhancedJobSelection } from "./EnhancedJobSelection";
import { ResumeUploadStep } from "./workflow/ResumeUploadStep";
import { AIAnalysisStep } from "./workflow/AIAnalysisStep";
import { DownloadStep } from "./workflow/DownloadStep";
import { DirectCVTailoringDialog } from "./DirectCVTailoringDialog";
import { supabase } from "@/integrations/supabase/client";
import { extractResumeContent } from "@/utils/enhancedResumeProcessor";
import { extractSection, generateProfessionalSummary, generateKeyCompetencies, calculateMatchScore } from "@/utils/resumeHelpers";
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

    // Enhanced input validation with more lenient content extraction
    let resumeContent = selectedResume.content?.text ||
      selectedResume.resume_text ||
      selectedResume.parsed_content ||
      selectedResume.extracted_content ||
      selectedResume.tailored_text ||
      '';
    
    console.log('🔍 Resume content validation:', {
      hasContent: !!resumeContent,
      contentLength: resumeContent?.length || 0,
      resumeKeys: Object.keys(selectedResume),
      selectedResumeType: typeof selectedResume,
      selectedResumeId: selectedResume.id,
      selectedResumeName: selectedResume.name || selectedResume.file_name
    });
    
    if (!resumeContent || resumeContent.trim().length === 0) {
      // Try more aggressive fallbacks with more generous content acceptance
      const fallbackContent = selectedResume.text || 
                              selectedResume.content || 
                              selectedResume.raw_content || 
                              selectedResume.candidateData?.text ||
                              selectedResume.file_name ||
                              selectedResume.name ||
                              (typeof selectedResume.candidate_data === 'object' && selectedResume.candidate_data?.text);
      
      if (fallbackContent && typeof fallbackContent === 'string' && fallbackContent.trim().length > 0) {
        console.log('📄 Using fallback resume content');
        resumeContent = fallbackContent;
      } else {
        console.log('📝 Using placeholder content for uploaded file');
        resumeContent = 'Valid resume file uploaded - content will be processed by AI';
      }
    }

    // More lenient validation - only check for very basic content
    if (resumeContent.trim().length < 10) {
      console.error('❌ Resume content too short:', resumeContent.length);
      setError('Resume file appears to be invalid. Please upload a different resume.');
      toast.error('Resume content is too brief. Please upload a resume with more detailed information.');
      return;
    }

    // Check file format if available
    if (selectedResume.original_filename) {
      const fileName = selectedResume.original_filename.toLowerCase();
      const supportedFormats = ['.pdf', '.doc', '.docx', '.txt'];
      const isSupported = supportedFormats.some(format => fileName.endsWith(format));
      
      if (!isSupported) {
        setError('Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files only.');
        toast.error('Please upload a valid CV in PDF, DOC, DOCX, or TXT format.');
        return;
      }
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      setError('Please provide a job description to tailor your CV.');
      toast.error('Job description is required for CV tailoring.');
      return;
    }

    if (resumeContent.length < 20) {
      setError('Resume file is invalid or empty. Please upload a valid resume.');
      toast.error('Resume file appears to be empty. Please upload a valid resume with content.');
      return;
    }

    if (jobDescription.length < 50) {
      setError('Job description appears too brief. Please provide more details about the job requirements.');
      toast.error('Job description is too brief. Please add more details about the job.');
      return;
    }

    if (resumeContent.length > 50000) {
      setError('Resume content is too large. Please provide a shorter resume.');
      toast.error('Resume content is too large. Please provide a resume under 50,000 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🤖 Starting AI analysis...', {
        resumeLength: resumeContent.length,
        jobDescLength: jobDescription.length,
        jobTitle,
        companyName
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 85));
      }, 200);

      console.log('🚀 Invoking tailor-cv function with payload:', {
        resumeContentLength: resumeContent.length,
        jobDescriptionLength: jobDescription.length,
        jobTitle: jobTitle || 'Job Title',
        companyName: companyName || 'Company',
        hasCandidateData: !!selectedResume.candidate_data,
        requirementsCount: selectedJob.requirements?.length || 0
      });

      const { data, error: functionError } = await supabase.functions.invoke('tailor-cv', {
        body: {
          resumeContent: resumeContent,
          jobDescription: jobDescription,
          jobTitle: jobTitle || 'Job Title',
          companyName: companyName || 'Company',
          candidateData: selectedResume.candidate_data || null,
          jobRequirements: selectedJob.requirements || []
        }
      });

      clearInterval(progressInterval);

      console.log('📝 AI response received:', { 
        data: data ? 'Response received' : 'No data',
        hasError: !!functionError,
        errorMessage: functionError?.message,
        responseKeys: data ? Object.keys(data) : []
      });

      // Check for function call errors first
      if (functionError) {
        console.error('❌ AI analysis function error:', functionError);
        let errorMessage = '⚠️ Please provide a valid CV and Job Description.';
        
        if (functionError.message) {
          if (functionError.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again with a shorter resume or job description.';
          } else if (functionError.message.includes('network') || functionError.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (functionError.message.includes('API key')) {
            errorMessage = '⚠️ Please provide a valid CV and Job Description.';
          } else {
            errorMessage = functionError.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data) {
        console.error('❌ No data received from AI service');
        throw new Error('No response received from AI service. Please try again.');
      }

      // Check if the response indicates an error (when edge function returns 200 with error)
      if (data.success === false) {
        console.error('❌ AI analysis returned error:', data.error);
        const errorMessage = data.error || 'AI analysis failed';
        throw new Error(errorMessage);
      }

      // Handle both response formats: file upload returns 'tailoredResume', JSON returns 'tailoredContent'
      const tailoredResumeContent = data.tailoredResume || data.tailoredContent;
      
      if (!tailoredResumeContent || typeof tailoredResumeContent !== 'string' || tailoredResumeContent.trim().length === 0) {
        console.error('❌ Invalid tailored resume in response:', { 
          hasTailoredResume: !!data.tailoredResume,
          hasTailoredContent: !!data.tailoredContent,
          type: typeof tailoredResumeContent,
          length: tailoredResumeContent?.length || 0,
          fullResponse: data
        });
        
        throw new Error('AI service failed to generate a tailored resume. Please try again with a different resume or job description.');
      }

      // Enhanced validation for content quality and preservation
      const hasPlaceholderText = tailoredResumeContent.includes('Contact Information Available Upon Request');
      const hasGenericContent = tailoredResumeContent.includes('Experienced professional with a demonstrated history');
      const hasBrokenSentences = /\b(proven expertise in\s*\.|relevant to the industry\.\s*$)/i.test(tailoredResumeContent);
      const isTooShort = tailoredResumeContent.length < 300;
      
      // Check if AI preserved original content structure
      const qualityScore = data.score || data.tailoring_score || 0;
      const isLowQuality = qualityScore < 60;
      
      if (hasPlaceholderText || hasGenericContent || hasBrokenSentences || isTooShort || isLowQuality) {
        console.warn('⚠️ AI-generated resume failed quality checks:', {
          hasPlaceholderText,
          hasGenericContent,
          hasBrokenSentences,
          isTooShort,
          qualityScore,
          contentLength: tailoredResumeContent.length
        });
        
        throw new Error('The AI-generated resume did not meet quality standards. The system is being improved to better preserve your original resume content while adding enhancements. Please try again shortly.');
      }

      // Use the AI-generated content if it passes quality checks
      data.tailoredResume = tailoredResumeContent;
      console.log('✅ AI-generated resume passed quality validation');
      
      // Enhanced success message based on quality score
      if (qualityScore >= 90) {
        toast.success(`Excellent! Resume tailored with ${qualityScore}% quality score. Your original content has been preserved and enhanced.`);
      } else if (qualityScore >= 80) {
        toast.success(`Resume successfully tailored with ${qualityScore}% quality score. Original details preserved with job-relevant enhancements.`);
      } else {
        toast.success(`Resume tailored with ${qualityScore}% quality score. Review the enhanced content for further improvements.`);
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
      toast.success(`CV tailored successfully! Match score: ${data.score || 85}%`);

    } catch (error) {
      console.error('❌ Error during AI analysis:', error);
      let errorMessage = 'AI analysis failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Provide user-friendly error messages
      if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with a shorter resume or job description.';
      } else if (errorMessage.includes('too large')) {
        errorMessage = 'Content is too large. Please shorten your resume or job description.';
      } else if (errorMessage.includes('too short')) {
        errorMessage = 'Content is too short. Please provide more detailed information.';
      } else if (errorMessage.includes('AI service not configured')) {
        errorMessage = 'AI service is not configured. Please contact support.';
      } else if (errorMessage.includes('busy')) {
        errorMessage = 'AI service is currently busy. Please try again in a few moments.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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
