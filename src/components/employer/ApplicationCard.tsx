
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { 
  MapPin, 
  Calendar, 
  FileText, 
  Star, 
  Eye, 
  MessageSquare,
  Target,
  Clock
} from 'lucide-react';

interface ApplicationCardProps {
  application: any;
  onViewDetails: (application: any) => void;
  onUpdateStatus: (applicationId: string, newStatus: string) => void;
}

export const ApplicationCard = ({ 
  application, 
  onViewDetails, 
  onUpdateStatus 
}: ApplicationCardProps) => {
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

  const getStatusColor = (status: string) => {
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

  const calculateMatchScore = () => {
    if (!application.job || !application.candidate) return 0;
    
    let score = 0;
    
    // Basic scoring logic
    if (application.candidate.experience !== undefined) {
      score += Math.min(30, application.candidate.experience * 3);
    }
    
    if (application.candidate.location && application.job.location) {
      if (application.candidate.location.toLowerCase().includes(application.job.location.toLowerCase())) {
        score += 20;
      }
    }
    
    if (application.candidate.skills && application.job.tech_stack) {
      const candidateSkills = application.candidate.skills.toLowerCase().split(',').map((s: string) => s.trim());
      const jobSkills = application.job.tech_stack.map((s: string) => s.toLowerCase());
      const matchingSkills = candidateSkills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => jobSkill.includes(skill) || skill.includes(jobSkill))
      );
      score += Math.min(50, (matchingSkills.length / jobSkills.length) * 50);
    }
    
    return Math.round(Math.min(score, 100));
  };

  const matchScore = calculateMatchScore();
  const daysAgo = Math.floor((Date.now() - new Date(application.applied_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <UserAvatar 
                userId={application.candidate?.id}
                fallbackText={getCandidateInitials(application.candidate)}
                className="h-12 w-12"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">
                  {getCandidateDisplayName(application.candidate)}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {application.candidate?.title || 'No title provided'}
                </p>
                {application.candidate?.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {application.candidate.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getStatusColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
              {matchScore > 0 && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">{matchScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Job and Application Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Applied for:</span>
              <span className="text-muted-foreground truncate max-w-48">
                {application.job?.title || 'Position Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Applied {daysAgo} days ago</span>
              </div>
              <div className="flex items-center gap-3">
                {application.resume && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Resume</span>
                  </div>
                )}
                {application.cover_letter && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">Cover Letter</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewDetails(application)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                View Details
              </Button>
              {application.status === 'pending' && (
                <Button 
                  size="sm"
                  onClick={() => onUpdateStatus(application.id, 'shortlisted')}
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  Shortlist
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(application.applied_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
