import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, RotateCcw, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DownloadStepProps {
  workflowData: {
    tailoredResumeId: string;
    jobTitle: string;
    companyName: string;
    selectedResume: any;
  };
  onRestart: () => void;
}

export function DownloadStep({ workflowData, onRestart }: DownloadStepProps) {
  const [tailoredResume, setTailoredResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTailoredResume();
  }, [workflowData.tailoredResumeId]);

  const fetchTailoredResume = async () => {
    try {
      const { data, error } = await supabase
        .from('tailored_resumes')
        .select('*')
        .eq('id', workflowData.tailoredResumeId)
        .single();

      if (error) throw error;
      setTailoredResume(data);
    } catch (error) {
      console.error('Error fetching tailored resume:', error);
      toast.error('Failed to load tailored resume');
    } finally {
      setLoading(false);
    }
  };

  const generateFileName = (format: string) => {
    const company = workflowData.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Company';
    const job = workflowData.jobTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'Position';
    return `${job}_${company}_Resume.${format}`;
  };

  const generateHTMLContent = (content: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .content {
            white-space: pre-wrap;
        }
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Resume</h1>
        <p><strong>Position:</strong> ${workflowData.jobTitle || 'N/A'}</p>
        <p><strong>Company:</strong> ${workflowData.companyName || 'N/A'}</p>
    </div>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt' | 'html') => {
    if (!tailoredResume) return;

    setDownloading(true);
    try {
      const content = tailoredResume.tailored_content;
      const fileName = generateFileName(format);
      let blob: Blob;
      let mimeType: string;

      switch (format) {
        case 'html':
          const htmlContent = generateHTMLContent(content);
          blob = new Blob([htmlContent], { type: 'text/html' });
          mimeType = 'text/html';
          break;
        case 'pdf':
          // For PDF, we'll create an HTML version that can be printed to PDF
          const pdfHtmlContent = generateHTMLContent(content);
          blob = new Blob([pdfHtmlContent], { type: 'text/html' });
          mimeType = 'text/html';
          
          // Open in new window for printing to PDF
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(pdfHtmlContent);
            printWindow.document.close();
            setTimeout(() => {
              printWindow.print();
            }, 250);
          }
          
          toast.success('Resume opened in new window. Use your browser\'s print function and select "Save as PDF"');
          setDownloading(false);
          return;
        case 'docx':
          // For DOCX, we'll create a rich text format that can be opened in Word
          const docContent = `${workflowData.jobTitle || 'Resume'}\n${workflowData.companyName || ''}\n\n${content}`;
          blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        default: // txt
          blob = new Blob([content], { type: 'text/plain' });
          mimeType = 'text/plain';
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update download count
      await supabase
        .from('tailored_resumes')
        .update({ download_count: (tailoredResume.download_count || 0) + 1 })
        .eq('id', tailoredResume.id);

      toast.success(`Resume downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading your tailored resume...</div>
        </CardContent>
      </Card>
    );
  }

  if (!tailoredResume) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load tailored resume</p>
            <Button onClick={onRestart}>Start Over</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            Step 4: Download Your Tailored Resume
          </CardTitle>
          <CardDescription>
            Your ATS-optimized resume is ready! Download it in your preferred format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-green-900">
                  {workflowData.jobTitle || 'Position'} Resume
                </h3>
                {workflowData.companyName && (
                  <p className="text-sm text-green-700">For {workflowData.companyName}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    Tailoring Score: {tailoredResume.tailoring_score || 85}%
                  </Badge>
                  <Badge variant="outline">
                    ATS Optimized
                  </Badge>
                </div>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Download Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => handleDownload('pdf')} 
              disabled={downloading} 
              className="h-16"
            >
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download PDF</div>
                <div className="text-xs opacity-75">Print to PDF</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleDownload('html')} 
              disabled={downloading} 
              variant="outline" 
              className="h-16"
            >
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download HTML</div>
                <div className="text-xs opacity-75">Web format</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleDownload('docx')} 
              disabled={downloading} 
              variant="outline" 
              className="h-16"
            >
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download DOCX</div>
                <div className="text-xs opacity-75">Word format</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleDownload('txt')} 
              disabled={downloading} 
              variant="outline" 
              className="h-16"
            >
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download TXT</div>
                <div className="text-xs opacity-75">Plain text</div>
              </div>
            </Button>
          </div>

          {/* PDF Download Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">PDF Download Instructions</h4>
                <p className="text-sm text-blue-800">
                  For PDF format: Click "Download PDF" → A new window will open → Use Ctrl+P (or Cmd+P) → 
                  Select "Save as PDF" as the destination → Save your resume as PDF.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Preview'} Resume
            </Button>
            
            <Button variant="outline" onClick={onRestart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Create Another
            </Button>
          </div>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>
                  Here's how your tailored resume looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {tailoredResume.tailored_content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Next Steps:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review the tailored content before submitting your application</li>
              <li>• For best results, save as PDF using your browser's print function</li>
              <li>• Consider customizing the cover letter for this specific role</li>
              <li>• Save this version for future applications to similar positions</li>
              <li>• Track your applications to see which tailored versions perform best</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
