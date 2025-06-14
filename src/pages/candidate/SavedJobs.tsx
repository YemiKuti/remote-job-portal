import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Briefcase, MapPin, Calendar, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchSavedJobs, toggleSaveJob } from '@/utils/api/candidateApi';
import { SavedJob } from '@/types/api';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { CVTailoringDialog } from "@/components/cv/CVTailoringDialog";
import { Sparkles } from "lucide-react";

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadSavedJobs = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const jobs = await fetchSavedJobs(user.id);
        setSavedJobs(jobs);
      } catch (error) {
        console.error('Error loading saved jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedJobs();
  }, [user]);

  const handleRemoveJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      const result = await toggleSaveJob(user.id, jobId, true);
      if (result.saved === false) {
        setSavedJobs(savedJobs.filter(job => job.job_id !== jobId));
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };
  
  const handleApplyNow = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };
  
  const filteredJobs = savedJobs.filter(job => 
    job.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.job?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Saved Jobs</h2>
          <p className="text-muted-foreground">
            Jobs you've saved for later
          </p>
        </div>
        <Separator />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <Input 
              placeholder="Search saved jobs..."
              className="w-full md:max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" className="md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <Button variant="outline" className="md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(savedJob => (
                <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">{savedJob.job?.title}</h3>
                        <div className="flex flex-col md:flex-row md:items-center text-muted-foreground mt-1 gap-1 md:gap-4">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{savedJob.job?.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{savedJob.job?.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Saved {new Date(savedJob.saved_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="font-semibold">
                            {savedJob.job?.salary_min && savedJob.job?.salary_max 
                              ? `$${savedJob.job.salary_min.toLocaleString()} - $${savedJob.job.salary_max.toLocaleString()}`
                              : 'Salary not specified'}
                          </p>
                          <Badge variant="outline" className="mt-1">{savedJob.job?.employment_type}</Badge>
                        </div>
                        
                        <p className="mt-4 text-sm line-clamp-2">{savedJob.job?.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-4">
                          {savedJob.job?.tech_stack?.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleApplyNow(savedJob.job_id)}>Apply Now</Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleRemoveJob(savedJob.job_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-medium mt-4">No saved jobs yet</h3>
                <p className="text-muted-foreground mt-2">
                  Start browsing jobs and save the ones you're interested in
                </p>
                <Button className="mt-4" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;
