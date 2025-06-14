import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/ui/user-avatar';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText,
  User,
  Briefcase,
  Download,
  ExternalLink,
  Eye
} from 'lucide-react';

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_date: string;
  cover_letter?: string;
  portfolio_url?: string;
  additional_notes?: string;
  resume?: Resume;
  job?: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
  candidate?: {
    id: string;
    username?: string;
    full_name?: string;
    phone?: string;
    location?: string;
    title?: string;
    bio?: string;
    skills?: string;
    website?: string;
    experience?: number;
  };
}

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (applicationId: string, newStatus: string) => void;
}

export const ApplicationDetailModal = ({
  application,
  isOpen,
  onClose,
  onUpdateStatus
}: ApplicationDetailModalProps) => {
  if (!application) return null;

  const getCandidateDisplayName = (candidate: any) => {
    if (!candidate) return 'Unknown Candidate';
    return candidate.full_name || candidate.username || 'Candidate Profile Incomplete';
  };

  const getCandidateInitials = (candidate: any) => {
    if (!candidate) return 'U';
    const name = candidate.full_name || candidate.username;
    if (!name) return 'C';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadResume = () => {
    if (application.resume?.file_path) {
      // In a real implementation, this would handle secure file download
      // For now, we'll show an alert
      alert('Resume download functionality would be implemented here with proper file access controls.');
    }
  };

  const handleViewProfile = () => {
    if (application.candidate?.id) {
      // Open candidate's public profile in new tab using the new route
      window.open(`/users/${application.candidate.id}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserAvatar 
              userId={application.candidate?.id}
              fallbackText={getCandidateInitials(application.candidate)}
              className="h-10 w-10"
            />
            Application Details - {getCandidateDisplayName(application.candidate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getStatusBadgeColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Applied on {new Date(application.applied_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
              {application.candidate?.id && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleViewProfile}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Profile
                </Button>
              )}
              {application.status !== 'shortlisted' && (
                <Button 
                  size="sm"
                  onClick={() => onUpdateStatus(application.id, 'shortlisted')}
                >
                  Shortlist
                </Button>
              )}
              {application.status !== 'rejected' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onUpdateStatus(application.id, 'rejected')}
                >
                  Reject
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Position Applied For
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">{application.job?.title || 'Position Unavailable'}</h4>
              <p className="text-sm text-muted-foreground">
                {application.job?.company} • {application.job?.location}
              </p>
            </div>
          </div>

          <Separator />

          {/* Application Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Documents
            </h3>
            
            <div className="space-y-4">
              {/* Cover Letter */}
              {application.cover_letter ? (
                <div>
                  <h4 className="font-medium mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{application.cover_letter}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="text-orange-800 text-sm">No cover letter provided</p>
                </div>
              )}

              {/* Resume */}
              {application.resume ? (
                <div>
                  <h4 className="font-medium mb-2">Resume</h4>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{application.resume.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(application.resume.file_size)} • 
                        Uploaded {new Date(application.resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadResume}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="text-orange-800 text-sm">No resume attached</p>
                </div>
              )}

              {/* Portfolio URL */}
              {application.portfolio_url && (
                <div>
                  <h4 className="font-medium mb-2">Portfolio</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <a 
                      href={application.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {application.portfolio_url}
                    </a>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {application.additional_notes && (
                <div>
                  <h4 className="font-medium mb-2">Additional Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{application.additional_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Enhanced Candidate Profile Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Profile
              </span>
              {application.candidate?.id && (
                <Button 
                  size="sm"
                  variant="ghost"
                  onClick={handleViewProfile}
                  className="flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Full Profile
                </Button>
              )}
            </h3>
            
            {!application.candidate?.full_name && !application.candidate?.username ? (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-orange-800 font-medium">Profile Incomplete</p>
                <p className="text-orange-600 text-sm">
                  This candidate hasn't completed their profile yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Basic Information with Avatar */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <UserAvatar 
                    userId={application.candidate?.id}
                    fallbackText={getCandidateInitials(application.candidate)}
                    className="h-16 w-16"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {application.candidate?.full_name || application.candidate?.username || 'Name not provided'}
                      </h4>
                      {application.candidate?.title && (
                        <p className="text-muted-foreground">{application.candidate.title}</p>
                      )}
                    </div>
                    
                    {/* Quick stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {application.candidate?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{application.candidate.location}</span>
                        </div>
                      )}
                      {application.candidate?.experience !== null && application.candidate?.experience !== undefined && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{application.candidate.experience} years experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="mt-1">{application.candidate?.username || 'Not provided'}</p>
                  </div>
                  
                  {application.candidate?.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {application.candidate.phone}
                      </p>
                    </div>
                  )}
                  
                  {application.candidate?.website && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <p className="mt-1">
                        <a 
                          href={application.candidate.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          {application.candidate.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {application.candidate?.bio && (
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg leading-relaxed">
                      {application.candidate.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {application.candidate?.skills && (
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {application.candidate.skills}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Application Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Application Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span>Applied on {new Date(application.applied_date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Application ID: {application.id}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
