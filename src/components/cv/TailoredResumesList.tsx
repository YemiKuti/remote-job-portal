
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Eye, Sparkles } from "lucide-react";
import { useCVTailoring } from "@/hooks/useCVTailoring";
import { formatDistanceToNow } from "date-fns";

export const TailoredResumesList = () => {
  const { tailoredResumes, loading, deleteTailoredResume } = useCVTailoring();

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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tailoredResumes.map((resume) => (
        <Card key={resume.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <CardTitle className="text-base">
                    {resume.jobs?.title || 'Unknown Position'}
                  </CardTitle>
                  <CardDescription>
                    {resume.jobs?.company} • Based on "{resume.candidate_resumes?.name}"
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={resume.tailoring_score >= 70 ? "default" : "secondary"}>
                  {resume.tailoring_score}% Match
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
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
