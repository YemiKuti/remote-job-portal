
import { Job } from "../types";
import { formatSalary, getTimeAgo } from "../data/jobs";
import { MapPin, Briefcase, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <div className="job-card flex flex-col bg-white mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-12 h-12 mr-4">
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{getTimeAgo(job.postedDate)}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center text-sm text-gray-600 mr-3">
          <MapPin size={16} className="mr-1 text-job-blue" />
          {job.location}
        </div>
        <div className="flex items-center text-sm text-gray-600 mr-3">
          <Briefcase size={16} className="mr-1 text-job-blue" />
          {job.employmentType}
        </div>
        <div className="flex items-center text-sm text-gray-600 mr-3">
          <Clock size={16} className="mr-1 text-job-blue" />
          {job.experienceLevel}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign size={16} className="mr-1 text-job-blue" />
          {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {job.techStack.slice(0, 3).map((tech) => (
          <Badge key={tech} variant="outline" className="bg-blue-50 text-job-blue border-job-blue">
            {tech}
          </Badge>
        ))}
        {job.techStack.length > 3 && (
          <Badge variant="outline" className="bg-gray-50 text-gray-600">
            +{job.techStack.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default JobCard;
