
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Brain, FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { extractResumeContent } from "@/utils/resumeProcessor";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import { validateOpenAISetup } from "@/utils/openaiConfig";

interface CVAnalysisDialogProps {
  trigger: React.ReactNode;
  resumes: any[];
  onAnalysisComplete?: () => void;
}

export const CVAnalysisDialog = ({ trigger, resumes, onAnalysisComplete }: CVAnalysisDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'upload' | 'analyzing' | 'complete'>('select');
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [aiSetupValid, setAiSetupValid] = useState<boolean | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { analyzeCV, analyzing } = useCVAnalysis();

  React.useEffect(() => {
    if (isOpen) {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setStep('upload');
  };

  const handleAnalyze = async () => {
    let resumeToAnalyze = selectedResume;
    let resumeContent = '';

    try {
      setStep('analyzing');
      setProgress(25);

      // If we have an uploaded file, extract content from it
      if (uploadedFile) {
        console.log('📄 Extracting content from uploaded file...');
        const extracted = await extractResumeContent(uploadedFile);
        resumeContent = extracted.text;
        resumeToAnalyze = { id: 'temp', name: uploadedFile.name };
        setProgress(50);
      } else if (selectedResume) {
        // For existing resumes, we'll use a placeholder content
        resumeContent = `Professional resume: ${selectedResume.name}`;
        setProgress(50);
      } else {
        throw new Error('No resume selected or uploaded');
      }

      setProgress(75);

      // Analyze the CV
      const result = await analyzeCV(resumeToAnalyze.id, resumeContent);
      
      setProgress(100);
      setAnalysisResult(result);
      setStep('complete');
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (error) {
      console.error('Error analyzing CV:', error);
      setStep('select');
      setProgress(0);
    }
  };

  const resetDialog = () => {
    setStep('select');
    setSelectedResume(null);
    setUploadedFile(null);
    setProgress(0);
    setAnalysisResult(null);
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
            <Brain className="h-5 w-5 text-blue-500" />
            Analyze CV & Get Job Recommendations
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

        {analyzing && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Analyzing your CV...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select an existing resume or upload a new one to analyze and get personalized job recommendations.
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
                Or upload a new CV (PDF, DOC, DOCX, TXT - Max 10MB)
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="cv-upload"
                ref={fileInputRef}
              />
              <Button asChild variant="outline">
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </Button>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleAnalyze}
                disabled={(!selectedResume && !uploadedFile) || analyzing || aiSetupValid === false}
              >
                {analyzing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Brain className="h-4 w-4 mr-2" />
                Analyze CV
              </Button>
            </div>
          </div>
        )}

        {step === 'upload' && uploadedFile && (
          <div className="space-y-4">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
              <p className="text-gray-600 mb-4">
                File selected: {uploadedFile.name}
              </p>
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Analyzing Your CV</h3>
            <p className="text-gray-600 text-center">
              Our AI is analyzing your resume and finding the best job matches for you...
            </p>
          </div>
        )}

        {step === 'complete' && analysisResult && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analysis Complete!</h3>
              <p className="text-gray-600">
                Found {analysisResult.recommendationsCount} job recommendations with up to {analysisResult.topMatchScore}% match
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
                <CardDescription>
                  Your CV has been analyzed and job recommendations have been generated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">✅ CV analysis completed</p>
                  <p className="text-sm">✅ {analysisResult.recommendationsCount} job matches found</p>
                  <p className="text-sm">✅ Recommendations saved to your profile</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetDialog}>
                Analyze Another CV
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                View Recommendations
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
