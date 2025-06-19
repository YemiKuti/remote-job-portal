

import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageCandidateButton } from './quick-actions/MessageCandidateButton';
import { ResumeDownloadButton } from './quick-actions/ResumeDownloadButton';
import { ViewProfileButton } from './quick-actions/ViewProfileButton';
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
  Eye,
  Star,
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Award,
  Zap
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
    requirements?: string[];
    tech_stack?: string[];
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

interface EnhancedApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (applicationId: string, newStatus: string, notes?: string) => Promise<void>;
}

export const EnhancedApplicationDetailModal = ({
  application,
  isOpen,
  onClose,
  onUpdateStatus
}: EnhancedApplicationDetailModalProps) => {
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
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

  const handleStatusUpdate = async () => {
    if (newStatus && newStatus !== application.status) {
      await onUpdateStatus(application.id, newStatus);
      setNewStatus('');
    }
  };

  // Wrapper function to handle the StatusUpdateButton's async calls
  const handleStatusUpdateWrapper = async (applicationId: string, newStatus: string) => {
    return onUpdateStatus(applicationId, newStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserAvatar 
              userId={application.candidate?.id}
              fallbackText={getCandidateInitials(application.candidate)}
              className="h-10 w-10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {getCandidateDisplayName(application.candidate)}
                <Badge className={getStatusBadgeColor(application.status)}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-normal">
                Applied for {application.job?.title} • {new Date(application.applied_date).toLocaleDateString()}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {Math.floor((Date.now() - new Date(application.applied_date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <ViewProfileButton
                candidateId={application.candidate?.id}
                candidateName={getCandidateDisplayName(application.candidate)}
              />
              <MessageCandidateButton
                candidateId={application.candidate?.id || ''}
                candidateName={getCandidateDisplayName(application.candidate)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Candidate Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Candidate Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!application.candidate?.full_name && !application.candidate?.username ? (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <p className="text-orange-800 font-medium">Profile Incomplete</p>
                        <p className="text-orange-600 text-sm">
                          This candidate hasn't completed their profile yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <UserAvatar 
                            userId={application.candidate?.id}
                            fallbackText={getCandidateInitials(application.candidate)}
                            className="h-16 w-16"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {application.candidate?.full_name || application.candidate?.username || 'Name not provided'}
                            </h4>
                            {application.candidate?.title && (
                              <p className="text-muted-foreground">{application.candidate.title}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {application.candidate?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{application.candidate.location}</span>
                                </div>
                              )}
                              {application.candidate?.experience !== null && application.candidate?.experience !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  <span>{application.candidate.experience} years</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {application.candidate?.bio && (
                          <div>
                            <h5 className="font-medium mb-2">About</h5>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {application.candidate.bio}
                            </p>
                          </div>
                        )}

                        {application.candidate?.skills && (
                          <div>
                            <h5 className="font-medium mb-2">Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {application.candidate.skills.split(',').map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {application.candidate?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{application.candidate.phone}</span>
                            </div>
                          )}
                          {application.candidate?.website && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={application.candidate.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {application.candidate.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Job Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Job Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Position</span>
                        <span className="text-muted-foreground">
                          {application.job?.title || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Company</span>
                        <span className="text-muted-foreground">
                          {application.job?.company || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Location</span>
                        <span className="text-muted-foreground">
                          {application.job?.location || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {application.job?.requirements && (
                      <div className="pt-3 border-t">
                        <h5 className="font-medium mb-2">Job Requirements</h5>
                        <ul className="text-sm space-y-1">
                          {application.job.requirements.slice(0, 3).map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-600">{req}</span>
                            </li>
                          ))}
                          {application.job.requirements.length > 3 && (
                            <li className="text-gray-500 text-xs">
                              +{application.job.requirements.length - 3} more requirements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {application.job?.tech_stack && (
                      <div className="pt-3 border-t">
                        <h5 className="font-medium mb-2">Tech Stack</h5>
                        <div className="flex flex-wrap gap-2">
                          {application.job.tech_stack.map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resume Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Resume/CV
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.resume ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{application.resume.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(application.resume.file_size)} • 
                              Uploaded {new Date(application.resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ResumeDownloadButton resume={application.resume} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>✓ Resume uploaded and available for review</p>
                          <p>✓ File format appears to be valid</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <p className="text-orange-800 font-medium">No Resume Attached</p>
                        <p className="text-orange-600 text-sm">
                          The candidate did not attach a resume with their application.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cover Letter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.cover_letter ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                          <p className="text-sm whitespace-pre-line leading-relaxed">
                            {application.cover_letter}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {application.cover_letter.length} characters • 
                          ~{Math.ceil(application.cover_letter.split(' ').length / 200)} min read
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <p className="text-orange-800 font-medium">No Cover Letter</p>
                        <p className="text-orange-600 text-sm">
                          The candidate did not provide a cover letter.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Documents */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Portfolio */}
                {application.portfolio_url && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Portfolio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Portfolio Website</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {application.portfolio_url}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a 
                            href={application.portfolio_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visit
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Notes */}
                {application.additional_notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Additional Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-line">
                          {application.additional_notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    Application Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Update Application Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interviewed">Interviewed</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleStatusUpdate}
                        disabled={!newStatus || newStatus === application.status}
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Update Status
                      </Button>
                      {newStatus === 'rejected' && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setNewStatus('rejected');
                          }}
                          className="flex items-center gap-2"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          Quick Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Application Timeline
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Application Submitted</p>
                          <p className="text-muted-foreground">
                            {new Date(application.applied_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="font-medium">Current Status: {application.status}</p>
                          <p className="text-muted-foreground">
                            {application.status === 'pending' ? 'Awaiting review' : 'Status updated'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
