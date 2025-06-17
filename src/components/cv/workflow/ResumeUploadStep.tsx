
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, User, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ResumeUploadZone } from './ResumeUploadZone';
import { Badge } from '@/components/ui/badge';

interface ResumeUploadStepProps {
  userId: string;
  onComplete: (data: { selectedResume: any }) => void;
}

export function ResumeUploadStep({ userId, onComplete }: ResumeUploadStepProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, [userId]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
      
      // Auto-select the default resume if available
      const defaultResume = data?.find(resume => resume.is_default);
      if (defaultResume) {
        setSelectedResume(defaultResume);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUploaded = (newResume: any) => {
    setResumes(prev => [newResume, ...prev]);
    setSelectedResume(newResume);
  };

  const handleContinue = () => {
    if (!selectedResume) {
      toast.error('Please select a resume to continue');
      return;
    }
    onComplete({ selectedResume });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading resumes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Step 1: Upload Your Resume
          </CardTitle>
          <CardDescription>
            Upload a new resume or select an existing one to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUploadZone
            userId={userId}
            onResumeUploaded={handleResumeUploaded}
          />
        </CardContent>
      </Card>

      {resumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Resume</CardTitle>
            <CardDescription>
              Choose which resume you'd like to tailor for this job application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedResume?.id === resume.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedResume(resume)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{resume.name}</span>
                          {resume.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        
                        {/* Show extracted candidate info if available */}
                        {resume.candidate_data && (
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {resume.candidate_data.personalInfo?.name && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{resume.candidate_data.personalInfo.name}</span>
                              </div>
                            )}
                            {resume.candidate_data.personalInfo?.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{resume.candidate_data.personalInfo.email}</span>
                              </div>
                            )}
                            {resume.candidate_data.personalInfo?.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{resume.candidate_data.personalInfo.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {selectedResume?.id === resume.id && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleContinue} disabled={!selectedResume}>
                Continue to Job Description
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
