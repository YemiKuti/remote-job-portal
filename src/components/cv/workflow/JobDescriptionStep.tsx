
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface JobDescriptionStepProps {
  initialData: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  };
  onComplete: (data: { jobTitle: string; companyName: string; jobDescription: string }) => void;
  onBack: () => void;
}

export function JobDescriptionStep({ initialData, onComplete, onBack }: JobDescriptionStepProps) {
  const [jobTitle, setJobTitle] = useState(initialData.jobTitle);
  const [companyName, setCompanyName] = useState(initialData.companyName);
  const [jobDescription, setJobDescription] = useState(initialData.jobDescription);

  const handleContinue = () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste the job description to continue');
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast.error('Job description seems too short. Please provide a more detailed description.');
      return;
    }

    onComplete({
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      jobDescription: jobDescription.trim()
    });
  };

  const extractInfoFromDescription = () => {
    // Simple extraction logic - could be enhanced with AI
    const lines = jobDescription.split('\n');
    const firstLine = lines[0]?.trim();
    
    if (firstLine && !jobTitle) {
      // Try to extract job title from first line
      const titleMatch = firstLine.match(/^(.*?)\s*[-–—]\s*(.*?)$/);
      if (titleMatch) {
        setJobTitle(titleMatch[1].trim());
        if (!companyName) {
          setCompanyName(titleMatch[2].trim());
        }
      } else if (firstLine.length < 100) {
        setJobTitle(firstLine);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Step 2: Job Description
        </CardTitle>
        <CardDescription>
          Paste the job description and provide details about the position you're applying for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title (Optional)</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name (Optional)</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Tech Company Inc."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description *</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onBlur={extractInfoFromDescription}
            placeholder="Paste the complete job description here... Include requirements, responsibilities, qualifications, and any other relevant details."
            className="min-h-[300px] resize-y"
          />
          <div className="text-sm text-gray-500">
            Characters: {jobDescription.length} (minimum 50 recommended)
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include the complete job description with requirements and responsibilities</li>
            <li>• Mention required skills, technologies, and qualifications</li>
            <li>• Include company information if available</li>
            <li>• The more detailed the description, the better the AI can tailor your resume</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!jobDescription.trim()}>
            Continue to AI Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
