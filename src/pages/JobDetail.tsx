
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building, DollarSign, Briefcase, GraduationCap, Sparkles, CheckCircle, Clock, Users, Globe, Award } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white/90 backdrop-blur-sm shadow-lg py-4 px-4 md:px-6 border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-40 md:w-60" />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-4" />
                  <Skeleton className="h-10 w-full mt-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="text-center w-full max-w-lg mx-auto shadow-xl">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Not Found</h2>
            <p className="text-gray-600 mb-6">
              Sorry, the job you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")} size="lg" className="w-full sm:w-auto">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg py-4 px-4 md:px-6 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/jobs")}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            ← Back to Job Listings
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Enhanced */}
          <div className="lg:col-span-2">
            {/* Job Header Card */}
            <Card className="shadow-xl border-0 mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {job.logo && (
                        <img
                          src={job.logo}
                          alt={`${job.company} logo`}
                          className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur p-2"
                        />
                      )}
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold break-words">
                          {job.title}
                        </h1>
                        <p className="text-blue-100 text-lg">
                          {job.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeAgo(job.postedDate || "")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.experienceLevel}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {job.isFeatured && (
                      <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 border-yellow-500">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {job.remote && (
                      <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                        <Globe className="w-3 h-3 mr-1" />
                        Remote
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Salary</p>
                    <p className="font-semibold text-gray-900">
                      {job.salary && formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900">{job.employmentType}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-semibold text-gray-900">{job.experienceLevel}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{job.remote ? "Remote" : job.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="shadow-lg border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextRenderer content={job.description} variant="job" />
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card className="shadow-lg border-0 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {Array.isArray(job.requirements) ? (
                      <ul className="space-y-2">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            <RichTextRenderer content={req} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <RichTextRenderer content={job.requirements} />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tech Stack */}
            {job.techStack && job.techStack.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.techStack.map((tech: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Apply for this Position
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Join {job.company} and advance your career
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full text-lg py-3"
                  onClick={handleApplyClick}
                  disabled={isApplyButtonDisabled()}
                  variant={existingApplication ? "outline" : "default"}
                  size="lg"
                >
                  {getApplyButtonContent()}
                </Button>

                <SaveJobButton jobId={job.id} />

                {existingApplication && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-800">
                      <div className="font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Application Status: {existingApplication.status}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Applied on {new Date(existingApplication.applied_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Details Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Posted:</span>
                    <span className="text-gray-900">{getTimeAgo(job.postedDate || "")}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Employment:</span>
                    <Badge variant="outline">{job.employmentType}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Experience:</span>
                    <Badge variant="outline">{job.experienceLevel}</Badge>
                  </div>
                  {job.visaSponsorship && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-700 font-medium">Visa Sponsorship:</span>
                      <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Info Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  About {job.company}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  {job.logo && (
                    <img
                      src={job.logo}
                      alt={`${job.company} logo`}
                      className="w-12 h-12 rounded-lg border border-gray-200"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.company}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Learn more about this opportunity and company culture.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Apply Dialog */}
      {showApplyDialog && job.applicationType === "internal" && (
        <ApplyJobDialog
          isOpen={showApplyDialog}
          onClose={() => setShowApplyDialog(false)}
          job={job}
          onApplicationSuccess={() => {
            setShowApplyDialog(false);
            checkExistingApplication(job.id).then(setExistingApplication);
            toast.success("Application submitted successfully!");
          }}
        />
      )}
    </div>
  );
};

export default JobDetail;
