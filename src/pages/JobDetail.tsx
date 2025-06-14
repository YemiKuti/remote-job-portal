
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Job } from "../types";
import { formatSalary } from "@/data/jobs";
import { MapPin, Briefcase, Clock, DollarSign, Building, Users, ExternalLink, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AuthProvider";
import ApplyJobDialog from "@/components/ApplyJobDialog";
import SaveJobButton from "@/components/SaveJobButton";
import { supabase } from "@/integrations/supabase/client";
import { transformDatabaseJobToFrontendJob } from "@/utils/jobTransformers";
import { handleJobApplication, getApplicationButtonText, getApplicationInstructions } from "@/utils/applicationHandler";

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const isCandidate = user?.user_metadata?.role === 'candidate';

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('status', 'active')
          .single();

        if (fetchError) {
          console.error('Error fetching job:', fetchError);
          setError('Job not found or no longer available');
          setJob(null);
        } else if (data) {
          const transformedJob = transformDatabaseJobToFrontendJob(data);
          setJob(transformedJob);
        } else {
          setError('Job not found');
          setJob(null);
        }
      } catch (err: any) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApplyClick = () => {
    if (!user) {
      window.location.href = '/auth?role=candidate';
      return;
    }

    if (!job) return;

    // Handle different application types
    const shouldShowDialog = handleJobApplication(job);
    if (shouldShowDialog) {
      setShowApplyDialog(true);
    }
  };

  const renderApplicationMethodInfo = () => {
    if (!job) return null;

    const getIcon = () => {
      switch (job.applicationType) {
        case 'external':
          return <ExternalLink className="h-4 w-4" />;
        case 'email':
          return <Mail className="h-4 w-4" />;
        case 'phone':
          return <Phone className="h-4 w-4" />;
        default:
          return null;
      }
    };

    if (job.applicationType === 'internal') return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          {getIcon()}
          <div>
            <h3 className="font-medium text-blue-900 mb-1">How to Apply</h3>
            <p className="text-sm text-blue-700">{getApplicationInstructions(job)}</p>
            {job.applicationValue && (
              <p className="text-sm font-medium text-blue-800 mt-1">{job.applicationValue}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || "The job posting you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
              <div className="flex items-start">
                <div className="w-16 h-16 mr-4 flex-shrink-0">
                  <img
                    src={job.logo}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
                  <p className="text-lg text-gray-700">{job.company}</p>
                  <p className="text-sm text-gray-500">Posted {new Date(job.postedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <MapPin className="mr-2 text-job-blue" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Briefcase className="mr-2 text-job-blue" />
                <div>
                  <p className="text-xs text-gray-500">Employment Type</p>
                  <p className="font-medium">{job.employmentType}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Clock className="mr-2 text-job-blue" />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-medium">{job.experienceLevel}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <DollarSign className="mr-2 text-job-blue" />
                <div>
                  <p className="text-xs text-gray-500">Salary</p>
                  <p className="font-medium">{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</p>
                </div>
              </div>
            </div>

            {/* Application Method Information */}
            {renderApplicationMethodInfo()}
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="mb-4 whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Skills & Requirements</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.techStack.map(tech => (
                  <Badge key={tech} variant="outline" className="bg-blue-50 text-job-blue border-job-blue py-1 px-2">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">About the Company</h2>
              <div className="flex items-center mb-3">
                <Building className="mr-2 text-job-blue" size={18} />
                <span className="mr-4">Size: {job.companySize}</span>
                
                <Users className="mr-2 text-job-blue ml-4" size={18} />
                <span>Employees: {job.companySize === "Startup" ? "1-50" : 
                                 job.companySize === "Small" ? "51-200" :
                                 job.companySize === "Medium" ? "201-1000" :
                                 job.companySize === "Large" ? "1001-5000" : "5001+"}</span>
              </div>
              <p className="text-gray-700">
                We are a dynamic team focused on building innovative solutions for modern problems. 
                Our company culture promotes inclusivity, innovation, and work-life balance.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 text-sm">Job ID: {job.id}</p>
              </div>
              {isCandidate ? (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleApplyClick}
                    className="bg-job-green hover:bg-job-darkGreen"
                  >
                    {getApplicationButtonText(job.applicationType)}
                  </Button>
                  <SaveJobButton 
                    jobId={job.id}
                    variant="outline"
                  />
                </div>
              ) : (
                <Button 
                  onClick={handleApplyClick}
                  className="w-full md:w-auto bg-job-green hover:bg-job-darkGreen"
                >
                  {user ? getApplicationButtonText(job.applicationType) : 'Sign In to Apply'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Apply Dialog - only for internal applications */}
      {job && job.applicationType === 'internal' && (
        <ApplyJobDialog
          isOpen={showApplyDialog}
          onClose={() => setShowApplyDialog(false)}
          job={job}
          onApplicationSuccess={() => {
            console.log('Application submitted successfully!');
          }}
        />
      )}
    </>
  );
};

const JobDetailSkeleton = () => {
  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
              <div className="flex items-start">
                <Skeleton className="w-16 h-16 mr-4" />
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-7 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-7 w-64 mb-4" />
              <div className="flex flex-wrap gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobDetail;
