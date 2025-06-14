
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SponsoredBadge } from "@/components/ui/sponsored-badge";
import ApplyJobDialog from "@/components/ApplyJobDialog";
import SaveJobButton from "@/components/SaveJobButton";
import { mockJobs, formatSalary, getTimeAgo } from "@/data/jobs";
import { Job } from "@/types";
import { 
  MapPin, 
  Clock, 
  Building, 
  DollarSign, 
  Users, 
  Globe,
  CheckCircle,
  ArrowLeft,
  Share2,
  Bookmark
} from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  useEffect(() => {
    const foundJob = mockJobs.find(j => j.id === id);
    setJob(foundJob || null);
  }, [id]);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/jobs")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate("/jobs")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={job.logo || "/placeholder.svg"}
                          alt={`${job.company} logo`}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-2xl">{job.title}</CardTitle>
                            <SponsoredBadge />
                          </div>
                          <p className="text-xl text-gray-600 mb-2">{job.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {getTimeAgo(job.postedDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <SaveJobButton jobId={job.id} />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {job.isFeatured && <Badge variant="secondary">Featured</Badge>}
                      {job.remote && <Badge variant="outline">Remote</Badge>}
                      {job.visaSponsorship && <Badge variant="outline">Visa Sponsorship</Badge>}
                      <Badge variant="outline">{job.employmentType}</Badge>
                      <Badge variant="outline">{job.experienceLevel}</Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Salary</span>
                      <span className="font-semibold">
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Employment Type</span>
                      <span className="font-semibold">{job.employmentType}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Experience Level</span>
                      <span className="font-semibold">{job.experienceLevel}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Company Size</span>
                      <span className="font-semibold">{job.companySize}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Remote</span>
                      <span className="font-semibold">{job.remote ? "Yes" : "No"}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Visa Sponsorship</span>
                      <span className="font-semibold">{job.visaSponsorship ? "Available" : "Not Available"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <Button 
                      className="w-full mb-3" 
                      size="lg"
                      onClick={() => setShowApplyDialog(true)}
                    >
                      Apply Now
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      This is a sponsored job posting
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Job Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Views</span>
                      <span className="font-semibold">{job.views?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Applications</span>
                      <span className="font-semibold">{job.applications?.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ApplyJobDialog
        isOpen={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        job={job}
      />
    </div>
  );
};

export default JobDetail;
