
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Target, CheckCircle, Loader2 } from "lucide-react";

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
            AI Analysis Ready
          </CardTitle>
          <CardDescription>
            Our AI will create a compelling 3-sentence career profile and tailor your entire resume
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

          {/* What the AI will do */}
          <div className="space-y-4">
            <h4 className="font-medium">What our AI will create:</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">3-Sentence Career Profile</div>
                  <div className="text-sm text-blue-700">
                    A compelling summary highlighting your experience, key skills, and value proposition specifically for this role
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Keyword Optimization</div>
                  <div className="text-sm text-green-700">
                    Strategic placement of job-relevant keywords throughout your experience and skills sections
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">Impact-Focused Content</div>
                  <div className="text-sm text-purple-700">
                    Rewritten experience bullets emphasizing achievements and quantifiable results relevant to the target role
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job requirements preview */}
          {selectedJob.requirements && selectedJob.requirements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Key Job Requirements to Address:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.requirements.slice(0, 8).map((req: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
                {selectedJob.requirements.length > 8 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedJob.requirements.length - 8} more
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
                  Analyzing & Tailoring Resume...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Analysis & Tailoring
                </>
              )}
            </Button>
            {loading && (
              <p className="text-sm text-gray-600 text-center mt-2">
                This may take 30-60 seconds as our AI creates your personalized resume
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
