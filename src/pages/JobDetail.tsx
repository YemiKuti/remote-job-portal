import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building, DollarSign, Briefcase, GraduationCap, Sparkles, CheckCircle } from "lucide-react";
import { formatSalary } from "@/data/jobs";
import ApplyJobDialog from "@/components/ApplyJobDialog";
import SaveJobButton from "@/components/SaveJobButton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CVTailoringDialog } from "@/components/cv/CVTailoringDialog";
import { transformDatabaseJobToFrontendJob } from "@/utils/jobTransformers";
import { handleJobApplication, getApplicationButtonText } from "@/utils/applicationHandler";
import { checkExistingApplication } from "@/utils/api/candidateApi";
import { useAuth } from "@/components/AuthProvider";
import RichTextRenderer from "@/components/RichTextRenderer";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const { user } = useAuth();
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
          const transformedJob = transformDatabaseJobToFrontendJob(data);
          setJob(transformedJob);
        } else {
          setJob(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !id || !job) return;
      
      setCheckingApplication(true);
      try {
        const application = await checkExistingApplication(id);
        setExistingApplication(application);
      } catch (error) {
        console.error('Error checking application status:', error);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplicationStatus();
  }, [user, id, job]);

  const handleApplyClick = () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      navigate("/auth");
      return;
    }

    if (existingApplication) {
      toast.info(`You already applied to this job on ${new Date(existingApplication.applied_date).toLocaleDateString()}`);
      return;
    }

    if (job?.applicationType === "internal") {
      setShowApplyDialog(true);
    } else {
      handleJobApplication(job!);
    }
  };

  const getApplyButtonContent = () => {
    if (checkingApplication) {
      return "Checking...";
    }
    
    if (existingApplication) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Applied on {new Date(existingApplication.applied_date).toLocaleDateString()}
        </div>
      );
    }

    return job?.applicationType === "internal" ? "Apply Now" : getApplicationButtonText(job?.applicationType);
  };

  const isApplyButtonDisabled = () => {
    return checkingApplication || !!existingApplication;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md py-3 px-2 md:px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-40 md:w-60" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-2 md:px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Skeleton className="h-10 md:h-12 w-full" />
              <Skeleton className="h-36 md:h-48 w-full" />
              <Skeleton className="h-16 md:h-24 w-full" />
            </div>

            <div className="space-y-4 md:space-y-6">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <Skeleton className="h-8 md:h-10 w-full" />
                  <Skeleton className="h-8 md:h-10 w-full mt-3 md:mt-4" />
                  <Skeleton className="h-8 md:h-10 w-full mt-3 md:mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <Skeleton className="h-6 md:h-8 w-full" />
                  <Skeleton className="h-6 md:h-8 w-full mt-3 md:mt-4" />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2">
        <Card className="text-center w-full max-w-lg mx-auto">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-4">Job Not Found</h2>
            <div className="text-gray-600">
              Sorry, the job you are looking for does not exist or has been removed.
            </div>
            <Button onClick={() => navigate("/")} className="mt-4 w-full sm:w-auto">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header: Back to listing */}
      <header className="bg-white shadow-md py-3 px-2 md:px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-sm md:text-base"
          >
            ← Back to Job Listings
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 md:px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main job info (left on desktop, top on mobile) */}
          <div className="lg:col-span-2">
            <Card className="space-y-3 md:space-y-4">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-semibold break-words">
                      {job.title}
                    </CardTitle>
                    <CardDescription>
                      {job.company} - {job.location}
                    </CardDescription>
                  </div>
                  {job.isFeatured && (
                    <Badge variant="secondary" className="self-start sm:self-center mt-2 sm:mt-0">
                      Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex flex-wrap gap-2 md:gap-4 items-center text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {job.employmentType}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary && formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.experienceLevel}
                  </span>
                  {job.visaSponsorship && (
                    <Badge variant="outline" className="ml-2">
                      Visa Sponsorship
                    </Badge>
                  )}
                  {job.remote && (
                    <Badge variant="outline" className="ml-2">
                      Remote
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-lg md:text-xl font-semibold">Job Description</h3>
                  <RichTextRenderer content={job.description} />
                </div>

                {job.requirements && (
                  <div className="space-y-1 md:space-y-2">
                    <h3 className="text-lg md:text-xl font-semibold">Requirements</h3>
                    <div className="text-gray-700">
                      {Array.isArray(job.requirements) ? (
                        <ul className="list-disc pl-5">
                          {job.requirements.map((req, index) => (
                            <li key={index}><RichTextRenderer content={req} /></li>
                          ))}
                        </ul>
                      ) : (
                        <RichTextRenderer content={job.requirements} />
                      )}
                    </div>
                  </div>
                )}

                {job.techStack && job.techStack.length > 0 && (
                  <div className="space-y-1 md:space-y-2">
                    <h3 className="text-lg md:text-xl font-semibold">Tech Stack</h3>
                    <div className="text-gray-700">
                      <ul className="list-disc pl-5">
                        {job.techStack.map((tech: string, index: number) => (
                          <li key={index}>{tech}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar actions (right on desktop, bottom on mobile) */}
          <div className="flex flex-col gap-4 md:gap-6">
            <Card>
              <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                <CardTitle className="text-base md:text-lg font-semibold">
                  Company Information
                </CardTitle>
                <CardDescription>
                  Learn more about {job.company}
                </CardDescription>

                <div className="flex flex-col gap-3 mt-3">
                  <Button
                    className="w-full"
                    onClick={handleApplyClick}
                    disabled={isApplyButtonDisabled()}
                    variant={existingApplication ? "outline" : "default"}
                  >
                    {getApplyButtonContent()}
                  </Button>

                  <SaveJobButton jobId={job.id} />
                </div>

                {existingApplication && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-800">
                      <div className="font-medium">Application Status: {existingApplication.status}</div>
                      <div className="text-xs text-green-600 mt-1">
                        Applied on {new Date(existingApplication.applied_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg font-semibold">
                  Job Details
                </CardTitle>
                <CardDescription>
                  Additional information about this job
                </CardDescription>

                <div className="space-y-2 md:space-y-3 mt-4">
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

      {/* Only show the dialog for internal application type */}
      {showApplyDialog && job.applicationType === "internal" && (
        <ApplyJobDialog
          isOpen={showApplyDialog}
          onClose={() => setShowApplyDialog(false)}
          job={job}
          onApplicationSuccess={() => {
            setShowApplyDialog(false);
            // Refresh application status
            checkExistingApplication(job.id).then(setExistingApplication);
            toast.success("Application submitted successfully!");
          }}
        />
      )}
    </div>
  );
};

export default JobDetail;
