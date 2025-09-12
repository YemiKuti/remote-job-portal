
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Building, DollarSign, Users } from "lucide-react";
import { formatSalaryWithConversion, getTimeAgo } from "@/data/jobs";
import { Job } from "@/types";
import { SponsoredBadge } from "@/components/ui/sponsored-badge";
import { useNavigate } from "react-router-dom";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { useCurrency } from "@/contexts/CurrencyContext";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  const navigate = useNavigate();
  const { selectedCurrency, convertAmount } = useCurrency();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <img
              src={job.logo || "/placeholder.svg"}
              alt={`${job.company} logo`}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.company}</p>
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
          <div className="flex flex-col items-end gap-2">
            {job.sponsored && <SponsoredBadge />}
            {job.isFeatured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <RichTextRenderer 
            content={job.description} 
            className="line-clamp-3 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {job.techStack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {job.techStack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{job.techStack.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-1" />
              {formatSalaryWithConversion(
                job.salary.min, 
                job.salary.max, 
                job.salary.currency,
                selectedCurrency,
                convertAmount,
                job.salary.currency !== selectedCurrency
              )}
            </div>
            <div className="flex items-center text-gray-600">
              <Building className="w-4 h-4 mr-1" />
              {job.employmentType}
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {job.experienceLevel}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {job.remote && (
              <Badge variant="secondary" className="text-xs">Remote</Badge>
            )}
            {job.visaSponsorship && (
              <Badge variant="outline" className="text-xs">Visa Sponsorship</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
