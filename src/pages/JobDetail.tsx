import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building, DollarSign, Briefcase, GraduationCap } from "lucide-react";
import { formatSalary } from "@/data/jobs";
import ApplyJobDialog from "@/components/ApplyJobDialog";
import SaveJobButton from "@/components/SaveJobButton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CVTailoringDialog } from "@/components/cv/CVTailoringDialog";
import { Sparkles } from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      console.error("Job ID is missing.");
      toast.error("Job ID is missing.");
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching job:", error);
          toast.error("Failed to load job details.");
        }

        if (data) {
          setJob(data);
        } else {
          setJob(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md py-4">
          <div className="max-w-4xl mx-auto px-4">
            <Skeleton className="h-8 w-60" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full mt-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Job Not Found</h2>
            <p className="text-gray-600">
              Sorry, the job you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back to Job Listings
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="space-y-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-semibold">{job.title}</CardTitle>
                    <CardDescription>
                      {job.company} - {job.location}
                    </CardDescription>
                  </div>
                  {job.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building className="w-4 h-4 mr-1" />
                    {job.employmentType}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary && formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.experienceLevel}
                  </div>
                  {job.visaSponsorship && (
                    <Badge variant="outline">Visa Sponsorship</Badge>
                  )}
                  {job.remote && (
                    <Badge variant="outline">Remote</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Job Description</h3>
                  <p className="text-gray-700">{job.description}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Requirements</h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {job.techStack && job.techStack.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <CardTitle className="text-lg font-semibold">Company Information</CardTitle>
                <CardDescription>Learn more about {job.company}</CardDescription>

                <div className="space-y-3 mt-6">
                  <Button 
                    className="w-full"
                    onClick={() => setShowApplyDialog(true)}
                  >
                    Apply Now
                  </Button>
                  
                  <CVTailoringDialog
                    job={job}
                    trigger={
                      <Button variant="outline" className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tailor My CV
                      </Button>
                    }
                  />

                  <SaveJobButton jobId={job.id} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <CardTitle className="text-lg font-semibold">Job Details</CardTitle>
                <CardDescription>Additional information about this job</CardDescription>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posted Date:</span>
                    <span>{new Date(job.postedDate || "").toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Employment Type:</span>
                    <span>{job.employmentType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience Level:</span>
                    <span>{job.experienceLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showApplyDialog && (
        <ApplyJobDialog 
          isOpen={showApplyDialog}
          onClose={() => setShowApplyDialog(false)}
          job={job}
          onApplicationSuccess={() => {
            setShowApplyDialog(false);
            toast.success("Application submitted successfully!");
          }}
        />
      )}
    </div>
  );
};

export default JobDetail;
