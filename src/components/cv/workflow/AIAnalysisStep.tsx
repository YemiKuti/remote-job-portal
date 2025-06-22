
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Target, CheckCircle, Loader2, Zap, Award } from "lucide-react";

interface AIAnalysisStepProps {
  selectedJob: any;
  uploadedResume: any;
  onStartAnalysis: () => void;
  loading: boolean;
}

export const AIAnalysisStep = ({ 
  selectedJob, 
  uploadedResume, 
  onStartAnalysis, 
  loading 
}: AIAnalysisStepProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            AI Keyword Analysis & Resume Tailoring
          </CardTitle>
          <CardDescription>
            Our advanced AI will extract key job requirements and strategically integrate them into your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary of inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Position
              </h4>
              <div className="border rounded-lg p-3">
                <div className="font-medium">{selectedJob.title}</div>
                <div className="text-sm text-gray-600">{selectedJob.company}</div>
                <div className="text-sm text-gray-500 mt-1">{selectedJob.location}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resume Source
              </h4>
              <div className="border rounded-lg p-3">
                <div className="font-medium">{uploadedResume.name}</div>
                <div className="text-sm text-gray-600">
                  {uploadedResume.content?.candidateData?.personalInfo?.name || 'Resume processed'}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced AI capabilities */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Advanced AI Processing:
            </h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Intelligent Keyword Extraction</div>
                  <div className="text-sm text-blue-700">
                    Automatically identifies technical skills, soft skills, and industry terms from the job description
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Target className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Strategic Keyword Integration</div>
                  <div className="text-sm text-green-700">
                    Naturally weaves job-specific keywords throughout your resume while maintaining authenticity
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Award className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">ATS Optimization</div>
                  <div className="text-sm text-purple-700">
                    Ensures your resume passes Applicant Tracking Systems with optimal keyword density and placement
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-900">3-Sentence Career Profile</div>
                  <div className="text-sm text-orange-700">
                    Creates a compelling summary highlighting your value proposition with job-specific terminology
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job requirements preview with keyword focus */}
          {selectedJob.requirements && selectedJob.requirements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Job Requirements to Target:
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedJob.requirements.slice(0, 6).map((req: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs bg-white">
                      {req}
                    </Badge>
                  ))}
                  {selectedJob.requirements.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedJob.requirements.length - 6} more requirements
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>AI Focus:</strong> Extract and integrate relevant keywords from these requirements 
                  throughout your resume to maximize ATS compatibility.
                </div>
              </div>
            </div>
          )}

          {/* Tech stack keyword highlighting */}
          {selectedJob.techStack && selectedJob.techStack.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Technical Keywords to Integrate:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.techStack.slice(0, 10).map((tech: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200">
                    {tech}
                  </Badge>
                ))}
                {selectedJob.techStack.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedJob.techStack.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button 
              onClick={onStartAnalysis}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Keywords & Tailoring Resume...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Keyword Analysis & Tailoring
                </>
              )}
            </Button>
            {loading && (
              <p className="text-sm text-gray-600 text-center mt-2">
                AI is analyzing job requirements and integrating relevant keywords into your resume...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
