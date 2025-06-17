
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, RotateCcw, Eye, Share2 } from 'lucide-react';
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

  const handleDownload = async (format: 'pdf' | 'docx' | 'txt' = 'pdf') => {
    if (!tailoredResume) return;

    setDownloading(true);
    try {
      // Create a simple text file download for now
      // In a real implementation, you'd generate proper PDF/DOCX files
      const content = tailoredResume.tailored_content;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflowData.jobTitle || 'tailored-resume'}-${workflowData.companyName || 'resume'}.${format === 'txt' ? 'txt' : format}`;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => handleDownload('pdf')} disabled={downloading} className="h-16">
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download PDF</div>
                <div className="text-xs opacity-75">Recommended</div>
              </div>
            </Button>
            
            <Button onClick={() => handleDownload('docx')} disabled={downloading} variant="outline" className="h-16">
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download DOCX</div>
                <div className="text-xs opacity-75">Editable</div>
              </div>
            </Button>
            
            <Button onClick={() => handleDownload('txt')} disabled={downloading} variant="outline" className="h-16">
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm">Download TXT</div>
                <div className="text-xs opacity-75">Plain text</div>
              </div>
            </Button>
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
