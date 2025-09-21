import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Brain 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { callEdgeFunctionWithRetry, validateFileSize, validateFileFormat } from "@/utils/edgeFunctionUtils";
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface DirectCVTailoringDialogProps {
  trigger: React.ReactNode;
}

export const DirectCVTailoringDialog = ({ trigger }: DirectCVTailoringDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check if file size > 0
      if (selectedFile.size <= 0) {
        setError('⚠️ Your resume file seems invalid or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).');
        return;
      }
      
      // Validate file type
      const fileName = selectedFile.name.toLowerCase();
      const supportedFormats = ['.pdf', '.doc', '.docx', '.txt'];
      const isSupported = supportedFormats.some(format => fileName.endsWith(format));
      
      if (!isSupported) {
        setError('⚠️ Your resume file seems invalid or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File is too large. Please upload a file smaller than 5MB.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Please upload a resume and provide a job description.');
      return;
    }

    // Additional file validation before processing - check file size > 0
    if (file.size <= 0) {
      setError('⚠️ Your resume file seems invalid or unreadable. Please upload a DOCX, TXT, or text-based PDF (not a scanned template).');
      return;
    }

    if (!user?.id) {
      setError('Please sign in to use CV tailoring.');
      return;
    }

    // Role check - only candidates can use CV tailoring
    try {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      const isAdmin = userRoles?.some(r => r.role === 'admin');
      const isEmployer = userRoles?.some(r => r.role === 'employer');
      
      if (isAdmin || isEmployer) {
        setError('CV tailoring is only available for candidates.');
        return;
      }
    } catch (roleError) {
      console.error('Role check failed:', roleError);
    }

    if (jobDescription.length < 50) {
      setError('Job description is too short. Please provide more details.');
      return;
    }

    setProcessing(true);
    setStep('processing');
    setError(null);
    setProgress(10);

    try {
      // Validate file before processing
      validateFileSize(file, 10);
      validateFileFormat(file.name);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobDescription', jobDescription);
      formData.append('jobTitle', jobTitle || 'Position');
      formData.append('companyName', companyName || 'Company');
      formData.append('userId', user.id);

      setProgress(30);
      
      console.log('🚀 Invoking tailor-cv with file upload...');
      
      // Call the edge function with retry logic
      const data = await callEdgeFunctionWithRetry(
        'tailor-cv',
        formData,
        { maxRetries: 2, baseDelay: 2000 },
        (message, retryCount) => {
          if (retryCount !== undefined) {
            setProgress(30 + (retryCount * 20));
          }
          toast(message);
        }
      );

      setProgress(80);

      setResult(data);
      setStep('complete');
      setProgress(100);
      
      toast.success(`CV tailored successfully! Match score: ${data.score || 85}%`);
      
    } catch (error: any) {
      console.error('❌ CV tailoring error:', error);
      setError(error.message || 'Failed to tailor CV. Please try again.');
      setStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setJobTitle('');
    setCompanyName('');
    setJobDescription('');
    setResult(null);
    setError(null);
    setProgress(0);
    setProcessing(false);
  };

  const handleClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI CV Tailoring Tool
          </DialogTitle>
          <DialogDescription>
            Upload your resume and job description to get a professionally tailored CV with PDF download
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-upload">Resume File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, DOC, DOCX, and TXT files (max 10MB)
                  </p>
                  {file && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <FileText className="h-4 w-4" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="e.g., TechCorp Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description *</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the full job description including requirements, responsibilities, and qualifications..."
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {jobDescription.length} characters (minimum 50 required)
                </p>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!file || !jobDescription.trim() || jobDescription.length < 50}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Tailor My CV
              </Button>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <div>
                <h3 className="font-medium">AI is tailoring your resume...</h3>
                <p className="text-sm text-gray-500">
                  Analyzing job requirements and optimizing your CV content
                </p>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">CV Tailored Successfully!</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Match Score:</span>
                    <div className="font-semibold text-blue-600">{result.score}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Quality:</span>
                    <div className="font-semibold text-green-600">Professional</div>
                  </div>
                </div>
                
                {result.suggestions?.recommendations && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Improvements:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {result.suggestions.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {result.downloadUrl && (
                  <Button onClick={handleDownloadPdf} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Tailored CV (PDF)
                  </Button>
                )}
                
                <Button variant="outline" onClick={reset} className="w-full">
                  Tailor Another CV
                </Button>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="text-blue-700">
                  💡 <strong>Tip:</strong> Review the tailored CV and customize it further before applying. 
                  The AI has optimized it for ATS systems and keyword matching.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};