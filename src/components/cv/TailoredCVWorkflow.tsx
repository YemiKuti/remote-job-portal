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

type WorkflowStep = 'job-selection' | 'resume-upload' | 'ai-analysis' | 'review' | 'download';

export const TailoredCVWorkflow = ({ userId }: TailoredCVWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('job-selection');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [uploadedResume, setUploadedResume] = useState<any>(null);
  const [tailoringResult, setTailoringResult] = useState<TailoringResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stepProgress = {
    'job-selection': 20,
    'resume-upload': 40,
    'ai-analysis': 70,
    'review': 90,
    'download': 100
  };

  const handleJobSelection = (job: any) => {
    setSelectedJob(job);
    setCurrentStep('resume-upload');
    setProgress(stepProgress['resume-upload']);
    console.log('✅ Job selected:', job.title);
  };

  const handleResumeUpload = async (file: File, resumeData?: any) => {
    try {
      setLoading(true);
      console.log('📤 Processing uploaded resume...');

      let resumeContent;
      if (resumeData) {
        // Existing resume from database
        resumeContent = resumeData;
      } else {
        // New file upload
        resumeContent = await extractResumeContent(file);
      }

      setUploadedResume({
        file,
        content: resumeContent,
        name: resumeData?.name || file.name
      });

      setCurrentStep('ai-analysis');
      setProgress(stepProgress['ai-analysis']);
      console.log('✅ Resume processed successfully');
    } catch (error) {
      console.error('❌ Error processing resume:', error);
      setError('Failed to process resume. Please try again.');
      toast.error('Failed to process resume');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!selectedJob || !uploadedResume) {
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
          resumeContent: uploadedResume.content?.text || 'Resume content',
          jobDescription: selectedJob.description,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company,
          candidateData: uploadedResume.content?.candidateData,
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
      setCurrentStep('review');
      setProgress(stepProgress['review']);
      
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

  const handleSaveTailoredCV = async () => {
    if (!tailoringResult || !selectedJob || !uploadedResume) return;

    try {
      setLoading(true);
      console.log('💾 Saving tailored CV...');

      const { error } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: userId,
          original_resume_id: uploadedResume.id,
          job_id: selectedJob.id,
          tailored_content: tailoringResult.tailoredResume,
          ai_suggestions: tailoringResult.suggestions,
          tailoring_score: tailoringResult.score,
          job_title: selectedJob.title,
          company_name: selectedJob.company,
          job_description: selectedJob.description
        });

      if (error) throw error;

      setCurrentStep('download');
      setProgress(stepProgress['download']);
      toast.success('Tailored CV saved successfully!');
      console.log('✅ Tailored CV saved to database');

    } catch (error) {
      console.error('❌ Error saving tailored CV:', error);
      toast.error('Failed to save tailored CV');
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep('job-selection');
    setSelectedJob(null);
    setUploadedResume(null);
    setTailoringResult(null);
    setProgress(stepProgress['job-selection']);
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
            {currentStep !== 'job-selection' && (
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
        {currentStep === 'job-selection' && (
          <JobSelectionStep 
            onJobSelect={handleJobSelection}
            userId={userId}
          />
        )}

        {currentStep === 'resume-upload' && selectedJob && (
          <ResumeUploadStep 
            onResumeUpload={handleResumeUpload}
            selectedJob={selectedJob}
            userId={userId}
            loading={loading}
          />
        )}

        {currentStep === 'ai-analysis' && (
          <AIAnalysisStep 
            selectedJob={selectedJob}
            uploadedResume={uploadedResume}
            onStartAnalysis={handleAIAnalysis}
            loading={loading}
          />
        )}

        {currentStep === 'review' && tailoringResult && (
          <div className="space-y-6">
            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Tailoring Analysis
                  </span>
                  <Badge variant={tailoringResult.score >= 80 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {tailoringResult.score}% Match
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {tailoringResult.analysis.skillsMatched}
                    </div>
                    <div className="text-sm text-gray-600">Skills Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {tailoringResult.analysis.candidateSkills.length}
                    </div>
                    <div className="text-sm text-gray-600">Key Skills Identified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {tailoringResult.analysis.experienceLevel}
                    </div>
                    <div className="text-sm text-gray-600">Experience Level</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Key Improvements:</h4>
                  <div className="grid gap-2">
                    {tailoringResult.analysis.hasCareerProfile && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">3-sentence career profile created</span>
                      </div>
                    )}
                    {tailoringResult.suggestions.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resume Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tailored Resume Preview
                </CardTitle>
                <CardDescription>
                  Your resume customized for {selectedJob?.title} at {selectedJob?.company}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {tailoringResult.tailoredResume}
                  </pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleSaveTailoredCV} disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Tailored Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'download' && tailoringResult && (
          <DownloadStep 
            tailoredResume={tailoringResult.tailoredResume}
            jobTitle={selectedJob?.title}
            companyName={selectedJob?.company}
            score={tailoringResult.score}
          />
        )}
      </div>
    </div>
  );
};
