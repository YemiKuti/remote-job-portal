
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building, Calendar, FileText, MapPin, DollarSign, Clock, User, Mail, Phone, ExternalLink } from 'lucide-react';

interface ApplicationDetailDialogProps {
  application: any;
  children: React.ReactNode;
}

export const ApplicationDetailDialog: React.FC<ApplicationDetailDialogProps> = ({ application, children }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const curr = currency || 'USD';
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return `${curr} ${(min || max)?.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Application Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Application Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{application.job?.title || 'Position'}</h3>
              <div className="flex items-center text-muted-foreground mt-1">
                <Building className="mr-1 h-4 w-4" />
                <span>{application.job?.company || 'Company'}</span>
                <MapPin className="ml-3 mr-1 h-4 w-4" />
                <span>{application.job?.location || 'Location'}</span>
              </div>
            </div>
            <Badge className={getStatusColor(application.status)}>
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Application Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Application Info</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Applied Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(application.applied_date)}</p>
                  </div>
                </div>

                {application.cover_letter && (
                  <div className="flex items-start">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cover Letter</p>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                        {application.cover_letter}
                      </div>
                    </div>
                  </div>
                )}

                {application.portfolio_url && (
                  <div className="flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Portfolio</p>
                      <a 
                        href={application.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {application.portfolio_url}
                      </a>
                    </div>
                  </div>
                )}

                {application.additional_notes && (
                  <div className="flex items-start">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Additional Notes</p>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                        {application.additional_notes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-lg">Job Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSalary(application.job?.salary_min, application.job?.salary_max, application.job?.salary_currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Employment Type</p>
                    <p className="text-sm text-muted-foreground">{application.job?.employment_type || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Experience Level</p>
                    <p className="text-sm text-muted-foreground">{application.job?.experience_level || 'Not specified'}</p>
                  </div>
                </div>

                {application.job?.tech_stack && application.job.tech_stack.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {application.job.tech_stack.map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          {application.job?.description && (
            <div>
              <h4 className="font-medium text-lg mb-3">Job Description</h4>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-gray-50 p-4 rounded-md">
                  {application.job.description}
                </div>
              </div>
            </div>
          )}

          {/* Requirements */}
          {application.job?.requirements && application.job.requirements.length > 0 && (
            <div>
              <h4 className="font-medium text-lg mb-3">Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {application.job.requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
