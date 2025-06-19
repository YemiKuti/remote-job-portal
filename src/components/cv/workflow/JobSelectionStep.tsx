
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MapPin, Building, Clock, ExternalLink } from 'lucide-react';
import { useActiveJobs } from '@/hooks/useActiveJobs';
import { Job } from '@/types';
import { getTimeAgo } from '@/data/jobs';
import { toast } from 'sonner';

interface JobSelectionStepProps {
  onComplete: (data: { selectedJob: Job; jobTitle: string; companyName: string; jobDescription: string }) => void;
  onBack: () => void;
}

export function JobSelectionStep({ onComplete, onBack }: JobSelectionStepProps) {
  const { jobs, loading, error } = useActiveJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualCompanyName, setManualCompanyName] = useState('');
  const [manualJobDescription, setManualJobDescription] = useState('');

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleContinueWithSelectedJob = () => {
    if (!selectedJob) {
      toast.error('Please select a job to continue');
      return;
    }

    const jobDescription = `${selectedJob.description}\n\nRequirements:\n${selectedJob.requirements?.join('\n') || 'No specific requirements listed'}\n\nTech Stack: ${selectedJob.techStack.join(', ')}`;

    onComplete({
      selectedJob,
      jobTitle: selectedJob.title,
      companyName: selectedJob.company,
      jobDescription
    });
  };

  const handleContinueWithManualInput = () => {
    if (!manualJobDescription.trim()) {
      toast.error('Please provide a job description');
      return;
    }

    if (manualJobDescription.trim().length < 50) {
      toast.error('Job description seems too short. Please provide a more detailed description.');
      return;
    }

    // Create a mock job object for manual input
    const mockJob: Job = {
      id: 'manual-' + Date.now(),
      title: manualJobTitle.trim() || 'Manual Job Entry',
      company: manualCompanyName.trim() || 'Company',
      location: 'Not specified',
      description: manualJobDescription.trim(),
      requirements: [],
      techStack: [],
      salary: { min: 0, max: 0, currency: 'USD' },
      employmentType: 'Not specified',
      experienceLevel: 'Not specified',
      remote: false,
      visaSponsorship: false,
      postedDate: new Date().toISOString(),
      logo: '',
      sponsored: false,
      isFeatured: false
    };

    onComplete({
      selectedJob: mockJob,
      jobTitle: manualJobTitle.trim() || 'Manual Job Entry',
      companyName: manualCompanyName.trim() || 'Company',
      jobDescription: manualJobDescription.trim()
    });
  };

  if (showManualInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            Step 2: Enter Job Details Manually
          </CardTitle>
          <CardDescription>
            Provide the job details manually if you can't find the position in our database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="manualJobTitle" className="text-sm font-medium">Job Title (Optional)</label>
              <Input
                id="manualJobTitle"
                value={manualJobTitle}
                onChange={(e) => setManualJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="manualCompanyName" className="text-sm font-medium">Company Name (Optional)</label>
              <Input
                id="manualCompanyName"
                value={manualCompanyName}
                onChange={(e) => setManualCompanyName(e.target.value)}
                placeholder="e.g., Tech Company Inc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="manualJobDescription" className="text-sm font-medium">Job Description *</label>
            <textarea
              id="manualJobDescription"
              value={manualJobDescription}
              onChange={(e) => setManualJobDescription(e.target.value)}
              placeholder="Paste the complete job description here..."
              className="min-h-[300px] w-full p-3 border border-gray-300 rounded-md resize-y"
            />
            <div className="text-sm text-gray-500">
              Characters: {manualJobDescription.length} (minimum 50 recommended)
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowManualInput(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job List
            </Button>
            <Button onClick={handleContinueWithManualInput} disabled={!manualJobDescription.trim()}>
              Continue to AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading available jobs...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p className="mb-4">Failed to load jobs</p>
            <Button onClick={() => setShowManualInput(true)}>
              Enter Job Details Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-500" />
          Step 2: Select Job Position
        </CardTitle>
        <CardDescription>
          Choose the job you're applying for from our database, or enter details manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Manual Input Option */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by job title, company, location, or technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowManualInput(true)}>
            Can't find the job?
          </Button>
        </div>

        {/* Selected Job Preview */}
        {selectedJob && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Selected Job:</h4>
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-semibold">{selectedJob.title}</h5>
                <p className="text-sm text-gray-600">{selectedJob.company}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {selectedJob.location}
                  {selectedJob.remote && <Badge variant="secondary" className="text-xs">Remote</Badge>}
                </div>
              </div>
              <Button onClick={handleContinueWithSelectedJob}>
                Continue with this job
              </Button>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No jobs found matching your search.</p>
              <Button variant="outline" onClick={() => setShowManualInput(true)}>
                Enter Job Details Manually
              </Button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedJob?.id === job.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleJobSelect(job)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.company}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {job.employmentType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(job.postedDate)}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {job.techStack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {job.techStack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.techStack.length - 4} more
                          </Badge>
                        )}
                        {job.remote && (
                          <Badge variant="secondary" className="text-xs">
                            Remote
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {job.logo && (
                        <img
                          src={job.logo}
                          alt={`${job.company} logo`}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {selectedJob && (
            <Button onClick={handleContinueWithSelectedJob}>
              Continue to AI Analysis
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
