import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Briefcase, MapPin, Building2, Clock, DollarSign, Users, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedJobSelectionProps {
  onJobSelected: (jobData: {
    selectedJob: any;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }) => void;
  onBack: () => void;
}

export const EnhancedJobSelection = ({ onJobSelected, onBack }: EnhancedJobSelectionProps) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customJobDescription, setCustomJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    fetchLiveJobs();
  }, []);

  const fetchLiveJobs = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching live jobs...');

      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company,
          location,
          description,
          requirements,
          salary_min,
          salary_max,
          salary_currency,
          employment_type,
          experience_level,
          tech_stack,
          created_at,
          remote
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching jobs:', error);
        toast.error('Failed to load jobs');
        return;
      }

      console.log('✅ Fetched live jobs:', jobsData?.length || 0);
      setJobs(jobsData || []);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleJobSelection = (job: any) => {
    setSelectedJob(job);
    onJobSelected({
      selectedJob: job,
      jobTitle: job.title,
      companyName: job.company,
      jobDescription: job.description
    });
  };

  const handleCustomJobSubmit = () => {
    if (!customJobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    if (!customJobDescription.trim() || customJobDescription.length < 50) {
      toast.error('Please enter a detailed job description (at least 50 characters)');
      return;
    }

    const customJob = {
      id: 'custom-' + Date.now(),
      title: customJobTitle,
      company: customCompanyName || 'Company',
      description: customJobDescription,
      requirements: [],
      custom: true
    };

    onJobSelected({
      selectedJob: customJob,
      jobTitle: customJobTitle,
      companyName: customCompanyName || 'Company',
      jobDescription: customJobDescription
    });
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const curr = currency || 'USD';
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return `${curr} ${(min || max)?.toLocaleString()}+`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Select Target Job
          </CardTitle>
          <CardDescription>
            Choose a job posting to tailor your resume, or enter custom job details
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Live Jobs</TabsTrigger>
          <TabsTrigger value="custom">Enter Custom Job</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs by title, company, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Jobs List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No jobs found matching your search.' : 'No active jobs available.'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('custom')}
                  >
                    Enter Custom Job Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                          )}
                          {job.remote && (
                            <Badge variant="secondary">Remote</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {job.employment_type && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.employment_type}
                            </div>
                          )}
                          {job.experience_level && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.experience_level}
                            </div>
                          )}
                          {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                            </div>
                          )}
                        </div>

                        {job.tech_stack && job.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.tech_stack.slice(0, 5).map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {job.tech_stack.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.tech_stack.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {job.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {job.description.length > 150 
                              ? `${job.description.substring(0, 150)}...`
                              : job.description
                            }
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleJobSelection(job)}
                        className="ml-4"
                      >
                        Select Job
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Enter Custom Job Details
              </CardTitle>
              <CardDescription>
                Provide job details to tailor your resume for a specific position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Job Title *
                </label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={customJobTitle}
                  onChange={(e) => setCustomJobTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Company Name
                </label>
                <Input
                  placeholder="e.g., Tech Company Inc."
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Job Description *
                </label>
                <Textarea
                  placeholder="Paste the full job description including requirements, responsibilities, and qualifications..."
                  value={customJobDescription}
                  onChange={(e) => setCustomJobDescription(e.target.value)}
                  rows={8}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {customJobDescription.length} characters (minimum 50 required)
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleCustomJobSubmit}
                  disabled={!customJobTitle.trim() || customJobDescription.length < 50}
                  className="flex-1"
                >
                  Continue with Custom Job
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};