
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Briefcase, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SavedJobs = () => {
  // Mock data
  const savedJobs = [
    { 
      id: '1', 
      title: 'Senior Frontend Developer', 
      company: 'Tech Solutions Inc.', 
      location: 'San Francisco, CA', 
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      postedDate: '2025-04-25',
      description: 'We are looking for an experienced Frontend Developer to join our team...',
      skills: ['React', 'TypeScript', 'GraphQL', 'CSS']
    },
    { 
      id: '2', 
      title: 'UX Designer', 
      company: 'Creative Designs', 
      location: 'Remote', 
      type: 'Contract',
      salary: '$85,000 - $105,000',
      postedDate: '2025-04-28',
      description: 'Join our design team to create beautiful and intuitive user experiences...',
      skills: ['Figma', 'User Research', 'Prototyping', 'UI Design']
    },
    { 
      id: '3', 
      title: 'Full Stack Engineer', 
      company: 'StartUp Labs', 
      location: 'New York, NY', 
      type: 'Full-time',
      salary: '$130,000 - $160,000',
      postedDate: '2025-04-30',
      description: 'Looking for a full stack developer who can work on both frontend and backend...',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS']
    },
  ];
  
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
        
        <div className="space-y-4">
          {savedJobs.map(job => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <div className="flex flex-col md:flex-row md:items-center text-muted-foreground mt-1 gap-1 md:gap-4">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="font-semibold">{job.salary}</p>
                      <Badge variant="outline" className="mt-1">{job.type}</Badge>
                    </div>
                    
                    <p className="mt-4 text-sm line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-4">
                      {job.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button>Apply Now</Button>
                    <Button variant="outline">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {savedJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-medium mt-4">No saved jobs yet</h3>
            <p className="text-muted-foreground mt-2">
              Start browsing jobs and save the ones you're interested in
            </p>
            <Button className="mt-4">Browse Jobs</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;
