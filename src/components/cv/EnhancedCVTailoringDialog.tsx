
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Circle, FileText, Sparkles, Download, Loader2, AlertTriangle, Upload } from "lucide-react";
import { Job } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractResumeContent, uploadResumeToStorage, downloadTailoredResume } from "@/utils/enhancedResumeProcessor";
import { validateOpenAISetup } from "@/utils/openaiConfig";
import { CVTailoringErrorHandler, categorizeError } from "./CVTailoringErrorHandler";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface EnhancedCVTailoringDialogProps {
  job: Job;
  trigger: React.ReactNode;
}

interface TailoringAnalysis {
  analysis: {
    matchScore: number;
    strengths: string[];
    gaps: string[];
    keywords: string[];
  };
  suggestions: {
    summary: string;
    skillsToHighlight: string[];
    experienceAdjustments: Array<{
      section: string;
      suggestion: string;
      reason: string;
    }>;
    additionalSections: Array<{
      title: string;
      content: string;
      reason: string;
    }>;
  };
  tailoredContent: string;
}

export const EnhancedCVTailoringDialog = ({ job, trigger }: EnhancedCVTailoringDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'upload' | 'analyzing' | 'review' | 'complete'>('select');
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<TailoringAnalysis | null>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiSetupValid, setAiSetupValid] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const { error, handleError, clearError } = useErrorHandler();

  React.useEffect(() => {
    if (isOpen) {
      fetchResumes();
      checkAISetup();
    }
  }, [isOpen]);

  const checkAISetup = async () => {
    try {
      const isValid = await validateOpenAISetup();
      setAiSetupValid(isValid);
    } catch (error) {
      setAiSetupValid(false);
    }
  };

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
      toast.error('Failed to load resumes');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearError(); // Clear any previous errors

    // Enhanced file validation
    const fileName = file.name.toLowerCase();
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      handleError(new Error('This file format is not supported. Please upload a PDF or DOCX resume.'));
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      handleError(new Error('File is too large. Please upload a file smaller than 10MB.'));
      return;
    }

    // Validate minimum file size
    if (file.size < 100) {
      handleError(new Error('File is too small. Please upload a resume with more content.'));
      return;
    }

    setUploadedFile(file);
    setStep('upload');
  };

  const processUploadedFile = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setProgress(0);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Step 1: Extract content from file
      setProgress(25);
      const resumeContent = await extractResumeContent(uploadedFile);
      
      // Step 2: Upload file to storage
      setProgress(50);
      const fileUrl = await uploadResumeToStorage(uploadedFile, user.user.id);
      
      // Step 3: Save resume record
      setProgress(75);
      const { data: newResume, error } = await supabase
        .from('candidate_resumes')
        .insert({
          user_id: user.user.id,
          name: uploadedFile.name,
          file_path: fileUrl,
          file_size: uploadedFile.size,
          file_url: fileUrl,
          is_default: resumes.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(100);
      setSelectedResume({ ...newResume, content: resumeContent });
      toast.success('Resume processed successfully');
      await fetchResumes();
      setStep('analyzing');
      handleAnalyze();
    } catch (error: any) {
      console.error('Error processing uploaded file:', error);
      handleError(error, 'Failed to process resume file');
      setStep('select');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResume) return;

    setLoading(true);
    setProgress(0);

    try {
      setProgress(25);

      // Extract content if not already available
      let resumeContent = selectedResume.content?.text;
      if (!resumeContent) {
        // For existing resumes, we'll use a placeholder content
        resumeContent = `Professional resume: ${selectedResume.name}`;
      }

      setProgress(50);

      const { data, error } = await supabase.functions.invoke('tailor-cv', {
        body: {
          resumeContent,
          jobDescription: job.description,
          jobRequirements: job.requirements,
          jobTitle: job.title,
          jobCompany: job.company
        }
      });

      if (error) {
        console.error('❌ AI processing error:', error);
        throw new Error('AI processing failed. Please check your API configuration.');
      }

      setProgress(100);
      setAnalysis(data);
      setStep('review');
    } catch (error: any) {
      console.error('Error analyzing CV:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze CV. Please try again.';
      handleError(new Error(errorMessage));
      setStep('select');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const toggleSuggestion = (suggestionId: string) => {
    setAcceptedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleSaveTailoredCV = async () => {
    if (!analysis || !selectedResume) return;

    setLoading(true);
    setProgress(0);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      setProgress(50);

      const { data, error } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: user.user.id,
          original_resume_id: selectedResume.id,
          job_id: job.id,
          tailored_content: analysis.tailoredContent,
          ai_suggestions: analysis.suggestions,
          accepted_suggestions: acceptedSuggestions,
          tailoring_score: analysis.analysis.matchScore
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(100);
      toast.success('Tailored CV saved successfully!');
      setStep('complete');
    } catch (error) {
      console.error('Error saving tailored CV:', error);
      toast.error('Failed to save tailored CV');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const resetDialog = () => {
    setStep('select');
    setSelectedResume(null);
    setAnalysis(null);
    setAcceptedSuggestions([]);
    setUploadedFile(null);
    setLoading(false);
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Tailor CV for {job.title} at {job.company}
          </DialogTitle>
        </DialogHeader>

        {aiSetupValid === false && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI features are not properly configured. Please contact support to set up OpenAI integration.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <div className="mb-4">
            <CVTailoringErrorHandler
              error={categorizeError(error)}
              onRetry={() => {
                clearError();
                if (step === 'select' && selectedResume) {
                  setStep('analyzing');
                  handleAnalyze();
                }
              }}
              onUploadNew={() => {
                clearError();
                setStep('select');
                setSelectedResume(null);
                setUploadedFile(null);
              }}
              onDismiss={clearError}
            />
          </div>
        )}

        {loading && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select an existing resume or upload a new one to tailor for this position.
            </p>
            
            <div className="grid gap-3">
              {resumes.map((resume) => (
                <Card 
                  key={resume.id}
                  className={`cursor-pointer transition-colors ${
                    selectedResume?.id === resume.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedResume(resume)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{resume.name}</h4>
                          <p className="text-sm text-gray-500">
                            {resume.is_default && <Badge variant="secondary" className="mr-2">Default</Badge>}
                            Updated {new Date(resume.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {selectedResume?.id === resume.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Or upload a new resume (PDF, DOC, DOCX, TXT - Max 10MB)
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="resume-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="resume-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </Button>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep('analyzing')}
                disabled={!selectedResume || loading || aiSetupValid === false}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Analyze & Tailor CV
              </Button>
            </div>
          </div>
        )}

        {step === 'upload' && uploadedFile && (
          <div className="space-y-4">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Process Resume File</h3>
              <p className="text-gray-600 mb-4">
                Ready to process: {uploadedFile.name}
              </p>
              <Button onClick={processUploadedFile} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Process & Analyze
              </Button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Analyzing Your CV</h3>
            <p className="text-gray-600 text-center">
              Our AI is comparing your resume with the job requirements and generating personalized suggestions...
            </p>
          </div>
        )}

        {step === 'review' && analysis && (
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Match Score
                    <Badge variant={analysis.analysis.matchScore >= 70 ? "default" : "secondary"}>
                      {analysis.analysis.matchScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.analysis.matchScore} className="mb-4" />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {analysis.analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">Areas to Improve</h4>
                      <ul className="space-y-1">
                        {analysis.analysis.gaps.map((gap, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Circle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                    <CardDescription>Tailored summary for this position</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-blue-50 p-3 rounded">{analysis.suggestions.summary}</p>
                  </CardContent>
                </Card>

                {analysis.suggestions.experienceAdjustments.map((adjustment, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        {adjustment.section}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSuggestion(`exp-${index}`)}
                        >
                          {acceptedSuggestions.includes(`exp-${index}`) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </Button>
                      </CardTitle>
                      <CardDescription>{adjustment.reason}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{adjustment.suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tailored Resume Preview</CardTitle>
                  <CardDescription>Your customized resume for this position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {analysis.tailoredContent}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {(step === 'review' || step === 'complete') && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('select')}>
              Start Over
            </Button>
            <div className="flex gap-2">
              {step === 'review' && (
                <Button onClick={handleSaveTailoredCV} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Tailored CV
                </Button>
              )}
              {step === 'complete' && (
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">CV Tailored Successfully!</h3>
            <p className="text-gray-600">
              Your customized resume has been saved and is ready to use for your application.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
