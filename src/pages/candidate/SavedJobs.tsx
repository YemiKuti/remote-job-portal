
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, DollarSign, Briefcase, Bookmark, Sparkles } from "lucide-react";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useNavigate } from "react-router-dom";
import { formatSalary } from "@/data/jobs";
import { CVTailoringDialog } from "@/components/cv/CVTailoringDialog";

const SavedJobs = () => {
  const { savedJobs, loading, handleToggleSave } = useSavedJobs();
  const navigate = useNavigate();

  if (loading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Saved Jobs</h2>
            <p className="text-muted-foreground">
              Jobs you've bookmarked for later review
            </p>
          </div>
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
        </div>
      </DashboardLayout>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <DashboardLayout userType="candidate">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Saved Jobs</h2>
            <p className="text-muted-foreground">
              Jobs you've bookmarked for later review
            </p>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Jobs</h3>
              <p className="text-gray-600 mb-4">
                Start browsing jobs and save the ones that interest you for easy access later.
              </p>
              <Button onClick={() => navigate("/jobs")}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Saved Jobs</h2>
          <p className="text-muted-foreground">
            Jobs you've bookmarked for later review ({savedJobs.length} saved)
          </p>
        </div>

        <div className="grid gap-6">
          {savedJobs.map((savedJob) => {
            const job = savedJob.job;
            if (!job) return null;

            return (
              <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={job.logo || "/placeholder.svg"}
                        alt={`${job.company} logo`}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          {job.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{job.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {job.employmentType}
                          </div>
                          {job.salary && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {job.isFeatured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.techStack && job.techStack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {job.techStack && job.techStack.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.techStack.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {job.remote && (
                        <Badge variant="secondary" className="text-xs">Remote</Badge>
                      )}
                      {job.visaSponsorship && (
                        <Badge variant="outline" className="text-xs">Visa Sponsorship</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CVTailoringDialog
                        job={job}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Sparkles className="h-4 w-4 mr-1" />
                            Tailor CV
                          </Button>
                        }
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSave(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Bookmark className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;
