
import { Job } from "../types";
import { formatSalary, getTimeAgo } from "../data/jobs";
import { MapPin, Briefcase, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { useState } from "react";
import ApplyJobDialog from "./ApplyJobDialog";
import SaveJobButton from "./SaveJobButton";
import { handleJobApplication, getApplicationButtonText } from "@/utils/applicationHandler";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const isCandidate = user?.user_metadata?.role === 'candidate';

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle different application types
    const shouldShowDialog = handleJobApplication(job);
    if (shouldShowDialog) {
      setShowApplyDialog(true);
    }
  };

  return (
    <>
      <div className="job-card flex flex-col bg-white mb-4 hover:border-job-green transition-colors p-4 border rounded-lg">
        <Link to={`/jobs/${job.id}`} className="flex-grow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4 flex-shrink-0">
                <img
                  src={job.logo}
                  alt={`${job.company} logo`}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900">{job.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{job.company}</p>
              </div>
            </div>
            <div className="flex items-center ml-2 flex-shrink-0">
              <span className="text-xs text-gray-500">{getTimeAgo(job.postedDate)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center text-xs sm:text-sm text-gray-600 mr-2">
              <MapPin size={isMobile ? 14 : 16} className="mr-1 text-job-blue" />
              <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 mr-2">
              <Briefcase size={isMobile ? 14 : 16} className="mr-1 text-job-blue" />
              {job.employmentType}
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 mr-2">
              <Clock size={isMobile ? 14 : 16} className="mr-1 text-job-blue" />
              {job.experienceLevel}
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <DollarSign size={isMobile ? 14 : 16} className="mr-1 text-job-blue" />
              {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 mb-3 line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-1 sm:gap-2">
            {job.techStack.slice(0, isMobile ? 2 : 3).map((tech) => (
              <Badge 
                key={tech} 
                variant="outline" 
                className="bg-blue-50 text-job-blue border-job-blue text-xs py-0.5 px-2"
              >
                {tech}
              </Badge>
            ))}
            {job.techStack.length > (isMobile ? 2 : 3) && (
              <Badge 
                variant="outline" 
                className="bg-gray-50 text-gray-600 text-xs py-0.5 px-2"
              >
                +{job.techStack.length - (isMobile ? 2 : 3)} more
              </Badge>
            )}
          </div>
        </Link>

        {/* Apply Button for Candidates */}
        {isCandidate && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyClick}
                className="flex-1 bg-job-green hover:bg-job-darkGreen"
                size="sm"
              >
                {getApplicationButtonText(job.applicationType)}
              </Button>
              <SaveJobButton 
                jobId={job.id}
                variant="outline"
                size="sm"
                showText={true}
                className="px-4"
              />
            </div>
          </div>
        )}
      </div>

      {/* Apply Dialog - only for internal applications */}
      {job.applicationType === 'internal' && (
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

export default JobCard;
