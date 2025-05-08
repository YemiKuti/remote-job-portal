
import { Job } from "../types";
import { formatSalary, getTimeAgo } from "../data/jobs";
import { MapPin, Briefcase, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Link to={`/jobs/${job.id}`} className="job-card flex flex-col bg-white mb-4 hover:border-job-green transition-colors">
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
        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{getTimeAgo(job.postedDate)}</span>
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

      <div className="flex flex-wrap gap-1 sm:gap-2 mt-auto">
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
  );
};

export default JobCard;
