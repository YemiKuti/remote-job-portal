import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  RotateCcw 
} from "lucide-react";
import { Job } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveAs } from "file-saver";

interface EnhancedCVTailoringDialogProps {
  job?: Job;
  trigger: React.ReactNode;
}

interface TailoringResult {
  success: boolean;
  tailoredContent: string;
  analysis: {
    matchScore: number;
    jobAnalysis: any;
    candidateAnalysis: any;
    processingTime: string;
  };
  metadata: {
    originalLength: number;
    tailoredLength: number;
    fileName: string;
    fileType: string;
    requestId: string;
  };
}

type Step = 'upload' | 'processing' | 'result' | 'error';

export const EnhancedCVTailoringDialog = ({ job, trigger }: EnhancedCVTailoringDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(job || null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && !job) {
      fetchJobs();
    }
  }, [isOpen, job]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAvailableJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load available jobs');
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      toast.error('Please upload a valid CV in PDF, DOCX, or TXT format.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB.');
      return false;
    }

    if (file.size < 100) {
      toast.error('File appears to be empty or corrupted.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}/${Date.now()}-${file.name}`;
    
    console.log(`📤 Uploading file to storage: ${fileName}`);
    
    // Simulate upload progress
    setUploadProgress(10);
    
    const { data, error } = await supabase.storage
      .from('cvs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Storage upload error:', error);
      throw new Error('Failed to upload CV file. Please try again.');
    }

    setUploadProgress(30);
    console.log(`✅ File uploaded successfully: ${data.path}`);
    return data.path;
  };

  const handleTailorCV = async () => {
    if (!selectedFile || !selectedJob) {
      toast.error('Please select both a CV file and a job position.');
      return;
    }

    setLoading(true);
    setStep('processing');
    setUploadProgress(0);
    setError(null);

    try {
      console.log(`🚀 Starting CV tailoring process...`);
      console.log(`📄 File: ${selectedFile.name} (${selectedFile.size} bytes)`);
      console.log(`💼 Job: ${selectedJob.title} at ${selectedJob.company}`);

      // Upload file to storage
      const filePath = await uploadFileToStorage(selectedFile);
      setUploadProgress(40);

      // Get candidate data from profile
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await user.user ? supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single() : { data: null };

      setUploadProgress(50);

      // Call the edge function for AI processing
      console.log(`🤖 Calling tailor-cv edge function...`);
      
      const { data: tailoringResult, error: tailoringError } = await supabase.functions.invoke('tailor-cv', {
        body: {
          fileUrl: filePath,
          fileName: selectedFile.name,
          jobId: selectedJob.title,
          jobDescription: selectedJob.description,
          candidateData: profile
        }
      });

      setUploadProgress(90);

      if (tailoringError) {
        console.error('❌ Tailoring error:', tailoringError);
        throw new Error(tailoringError.message || 'Failed to process CV');
      }

      if (!tailoringResult?.success) {
        throw new Error(tailoringResult?.error || 'Unable to generate tailored CV. Please try again.');
      }

      console.log(`✅ CV tailoring completed successfully`);
      console.log(`📊 Match score: ${tailoringResult.analysis.matchScore}%`);
      
      setResult(tailoringResult);
      setUploadProgress(100);
      setStep('result');

      // Save to database
      await saveTailoredCV(tailoringResult, filePath);

      toast.success(`CV tailored successfully! Match score: ${tailoringResult.analysis.matchScore}%`);

    } catch (error: any) {
      console.error('❌ CV tailoring failed:', error.message);
      setError(error.message || 'Unable to generate tailored CV. Please try again.');
      setStep('error');
      toast.error(error.message || 'CV tailoring failed');
    } finally {
      setLoading(false);
    }
  };

  const saveTailoredCV = async (tailoringResult: TailoringResult, filePath: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: user.user.id,
          job_id: selectedJob?.id,
          job_title: selectedJob?.title,
          company_name: selectedJob?.company,
          job_description: selectedJob?.description,
          tailored_content: tailoringResult.tailoredContent,
          tailoring_score: tailoringResult.analysis.matchScore,
          ai_suggestions: tailoringResult.analysis,
          file_format: tailoringResult.metadata.fileType.toLowerCase(),
          tailored_file_path: filePath
        });

      if (error) {
        console.error('Error saving tailored CV:', error);
      } else {
        console.log('✅ Tailored CV saved to database');
      }
    } catch (error) {
      console.error('Error saving tailored CV:', error);
    }
  };

  const downloadAsText = () => {
    if (!result) return;
    
    const blob = new Blob([result.tailoredContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `tailored-cv-${selectedJob?.title?.replace(/\s+/g, '-').toLowerCase()}.txt`);
    toast.success('CV downloaded as text file');
  };

  const downloadAsDocx = () => {
    if (!result) return;
    
    // Create a simple DOCX-like structure
    const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${result.tailoredContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<w:p><w:r><w:t>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p>`)
      .join('')}
  </w:body>
</w:document>`;
    
    const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `tailored-cv-${selectedJob?.title?.replace(/\s+/g, '-').toLowerCase()}.docx`);
    toast.success('CV downloaded as DOCX file');
  };

  const resetDialog = () => {
    setStep('upload');
    setSelectedFile(null);
    if (!job) setSelectedJob(null);
    setUploadProgress(0);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(resetDialog, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI-Powered CV Tailoring
            {selectedJob && (
              <Badge variant="outline" className="ml-2">
                {selectedJob.title}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload your CV and select a job to get an AI-tailored version that maximizes your match score.
                Supported formats: PDF, DOCX, TXT (max 10MB)
              </AlertDescription>
            </Alert>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your CV
                </CardTitle>
                <CardDescription>
                  Choose a PDF, DOCX, or TXT file containing your current resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="cv-file">CV File</Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Selection */}
            {!job && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Select Target Job
                  </CardTitle>
                  <CardDescription>
                    Choose a job position to tailor your CV for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {availableJobs.map((jobOption) => (
                      <Card 
                        key={jobOption.id}
                        className={`cursor-pointer transition-colors ${
                          selectedJob?.id === jobOption.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedJob(jobOption)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{jobOption.title}</h4>
                              <p className="text-sm text-muted-foreground">{jobOption.company}</p>
                            </div>
                            {selectedJob?.id === jobOption.id && (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                onClick={handleTailorCV}
                disabled={!selectedFile || !selectedJob || loading}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Tailor CV with AI
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute top-1 right-1 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold">AI is Tailoring Your CV</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is analyzing your resume and the job requirements to create a perfectly tailored CV that maximizes your match score.
            </p>
            <div className="w-full max-w-md">
              <Progress value={uploadProgress} className="mb-2" />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress < 40 ? 'Uploading file...' :
                 uploadProgress < 60 ? 'Processing content...' :
                 uploadProgress < 90 ? 'AI tailoring in progress...' :
                 'Finalizing results...'}
              </p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Match Score</p>
                      <p className="text-2xl font-bold text-green-600">{result.analysis.matchScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Content Length</p>
                      <p className="text-2xl font-bold">{result.metadata.tailoredLength.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Processing Time</p>
                      <p className="text-2xl font-bold">{result.analysis.processingTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Tailored CV Preview
                </CardTitle>
                <CardDescription>
                  Your AI-optimized resume for {selectedJob?.title} at {selectedJob?.company}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {result.tailoredContent}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={resetDialog}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadAsText}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download TXT
                </Button>
                <Button 
                  onClick={downloadAsDocx}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download DOCX
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-xl font-semibold text-red-600">CV Tailoring Failed</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {error || 'Unable to generate tailored CV. Please try again.'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeDialog}>
                Close
              </Button>
              <Button onClick={resetDialog}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};