
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, FileText, Sparkles, Download, Loader2 } from "lucide-react";
import { Job } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CVTailoringDialogProps {
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

export const CVTailoringDialog = ({ job, trigger }: CVTailoringDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'select' | 'analyzing' | 'review' | 'complete'>('select');
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<TailoringAnalysis | null>(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResume) return;

    setStep('analyzing');
    setLoading(true);

    try {
      // Simulate resume content extraction (in real implementation, this would extract from PDF/DOC)
      const resumeContent = `Sample resume content for ${selectedResume.name}`;

      const { data, error } = await supabase.functions.invoke('tailor-cv', {
        body: {
          resumeContent,
          jobDescription: job.description,
          jobRequirements: job.requirements,
          jobTitle: job.title
        }
      });

      if (error) throw error;

      setAnalysis(data);
      setStep('review');
    } catch (error) {
      console.error('Error analyzing CV:', error);
      toast.error('Failed to analyze CV. Please try again.');
      setStep('select');
    } finally {
      setLoading(false);
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

    try {
      const { error } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          original_resume_id: selectedResume.id,
          job_id: job.id,
          tailored_content: analysis.tailoredContent,
          ai_suggestions: analysis.suggestions,
          accepted_suggestions: acceptedSuggestions,
          tailoring_score: analysis.analysis.matchScore
        });

      if (error) throw error;

      toast.success('Tailored CV saved successfully!');
      setStep('complete');
    } catch (error) {
      console.error('Error saving tailored CV:', error);
      toast.error('Failed to save tailored CV');
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('select');
    setSelectedResume(null);
    setAnalysis(null);
    setAcceptedSuggestions([]);
    setLoading(false);
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
            Tailor CV for {job.title}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a resume to tailor for this position. Our AI will analyze the job requirements and suggest improvements.
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

            {resumes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No resumes found. Please upload a resume first.</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleAnalyze}
                disabled={!selectedResume || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Analyze & Tailor CV
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
