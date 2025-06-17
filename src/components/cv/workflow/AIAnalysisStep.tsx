import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAnalysisStepProps {
  workflowData: {
    selectedResume: any;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  };
  onComplete: (data: { tailoredResumeId: string }) => void;
  onBack: () => void;
}

export function AIAnalysisStep({ workflowData, onComplete, onBack }: AIAnalysisStepProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'preparing' | 'analyzing' | 'generating' | 'complete' | 'error'>('preparing');
  const [statusMessage, setStatusMessage] = useState('Preparing your resume for analysis...');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = async () => {
    try {
      setStatus('preparing');
      setProgress(10);
      setStatusMessage('Reading your resume and extracting candidate information...');
      setError(null);

      // First get the resume content
      const { data: resumeData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(workflowData.selectedResume.file_path);

      if (downloadError) throw downloadError;

      setProgress(25);
      setStatus('analyzing');
      setStatusMessage('AI is analyzing your resume with candidate information and job requirements...');

      // Get resume content
      const resumeContent = await resumeData.text();

      setProgress(50);
      setStatusMessage('Generating your tailored resume with complete candidate information...');

      // Call the tailor-cv edge function with candidate data
      const { data, error } = await supabase.functions.invoke('tailor-cv', {
        body: {
          resumeContent,
          jobDescription: workflowData.jobDescription,
          jobTitle: workflowData.jobTitle,
          companyName: workflowData.companyName,
          candidateData: workflowData.selectedResume.candidate_data
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        
        if (error.message?.includes('rate_limit_exceeded') || error.message?.includes('busy')) {
          throw new Error('AI service is currently busy. Please try again in a few moments.');
        }
        
        throw error;
      }

      setProgress(75);
      setStatus('generating');
      setStatusMessage('Finalizing your professional resume...');

      // Save the tailored resume to database
      const { data: tailoredResume, error: saveError } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: workflowData.selectedResume.user_id,
          original_resume_id: workflowData.selectedResume.id,
          job_title: workflowData.jobTitle,
          company_name: workflowData.companyName,
          job_description: workflowData.jobDescription,
          tailored_content: data.tailoredResume,
          ai_suggestions: data.suggestions || {},
          tailoring_score: data.score || 85
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setProgress(100);
      setStatus('complete');
      setStatusMessage('Your tailored resume with complete candidate information is ready!');

      // Wait a moment before completing
      setTimeout(() => {
        onComplete({ tailoredResumeId: tailoredResume.id });
      }, 1500);

    } catch (error: any) {
      console.error('Error during analysis:', error);
      setStatus('error');
      setError(error.message || 'Failed to analyze resume');
      setStatusMessage('Analysis failed. You can try again.');
      
      if (error.message?.includes('busy') || error.message?.includes('rate_limit')) {
        toast.error('AI service is currently busy. Please try again in a few moments.');
      } else {
        toast.error('Failed to analyze resume: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    startAnalysis();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Brain className="h-8 w-8 text-blue-500 animate-pulse" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Step 3: AI Analysis & Tailoring
        </CardTitle>
        <CardDescription>
          Our AI is analyzing your resume and tailoring it with your complete candidate information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{statusMessage}</h3>
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <div className="text-sm text-gray-600">{progress}% complete</div>
          </div>
        </div>

        {status === 'preparing' || status === 'analyzing' || status === 'generating' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🤖 What our AI is doing:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Extracting candidate information from your resume</li>
              <li>• Analyzing your existing resume structure and content</li>
              <li>• Extracting key requirements from the job description</li>
              <li>• Including your complete contact information and details</li>
              <li>• Matching your skills and experience to job requirements</li>
              <li>• Optimizing keywords for ATS (Applicant Tracking Systems)</li>
              <li>• Creating a professional header with your contact information</li>
              <li>• Generating tailored content that highlights relevant experience</li>
            </ul>
          </div>
        ) : status === 'complete' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ Analysis Complete!</h4>
            <p className="text-sm text-green-800">
              Your resume has been successfully tailored with complete candidate information for the {workflowData.jobTitle || 'position'} 
              {workflowData.companyName && ` at ${workflowData.companyName}`}. 
              The AI has included your contact details, optimized your content for maximum impact, and ensured ATS compatibility.
            </p>
          </div>
        ) : status === 'error' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">❌ Analysis Failed</h4>
            <p className="text-sm text-red-800 mb-3">{error}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleRetry} disabled={retryCount >= 3}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </Button>
              <Button size="sm" variant="outline" onClick={onBack}>
                Go Back
              </Button>
            </div>
          </div>
        ) : null}

        {(status === 'preparing' || status === 'analyzing' || status === 'generating') && (
          <div className="flex justify-start">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
