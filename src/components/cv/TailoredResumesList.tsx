
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Eye, Sparkles, ExternalLink } from "lucide-react";
import { useCVTailoring } from "@/hooks/useCVTailoring";
import { formatDistanceToNow } from "date-fns";
import { downloadTailoredResume } from "@/utils/resumeProcessor";
import { toast } from "sonner";

export const TailoredResumesList = () => {
  const { tailoredResumes, loading, deleteTailoredResume } = useCVTailoring();

  const handleDownload = async (resume: any) => {
    try {
      if (resume.file_path) {
        const blob = await downloadTailoredResume(resume.file_path);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailored-resume-${resume.jobs?.title || 'unknown'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Resume downloaded successfully');
      } else {
        // Fallback: create a text file with the tailored content
        const blob = new Blob([resume.tailored_content || 'No content available'], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tailored-resume-${resume.jobs?.title || 'unknown'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Resume content downloaded as text file');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handlePreview = (resume: any) => {
    // Open a modal or new tab with the tailored content
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Tailored Resume Preview</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Tailored Resume</h1>
              <p><strong>Position:</strong> ${resume.jobs?.title || 'Unknown'}</p>
              <p><strong>Company:</strong> ${resume.jobs?.company || 'Unknown'}</p>
              <p><strong>Match Score:</strong> ${resume.tailoring_score || 'N/A'}%</p>
            </div>
            <div class="content">${resume.tailored_content || 'No content available'}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tailoredResumes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tailored Resumes Yet</h3>
          <p className="text-gray-600 mb-4">
            Start tailoring your resume to specific job opportunities to increase your chances of getting hired.
          </p>
          <Button variant="outline" asChild>
            <a href="/candidate">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Jobs
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tailoredResumes.map((resume) => (
        <Card key={resume.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <CardTitle className="text-base">
                    {resume.jobs?.title || 'Unknown Position'}
                  </CardTitle>
                  <CardDescription>
                    {resume.jobs?.company && (
                      <span>{resume.jobs.company} • </span>
                    )}
                    {resume.candidate_resumes?.name && (
                      <span>Based on "{resume.candidate_resumes.name}"</span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resume.tailoring_score && (
                  <Badge variant={resume.tailoring_score >= 70 ? "default" : "secondary"}>
                    {resume.tailoring_score}% Match
                  </Badge>
                )}
                <Badge variant="outline">
                  {resume.file_path ? 'File' : 'Text'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Tailored {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handlePreview(resume)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(resume)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteTailoredResume(resume.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {resume.ai_suggestions && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">AI Suggestions Applied</p>
                <p className="text-xs text-blue-600">
                  {resume.accepted_suggestions?.length || 0} of {
                    (resume.ai_suggestions.experienceAdjustments?.length || 0) + 
                    (resume.ai_suggestions.additionalSections?.length || 0)
                  } suggestions accepted
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
