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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCandidateButton } from './quick-actions/MessageCandidateButton';
import { ResumeDownloadButton } from './quick-actions/ResumeDownloadButton';
import { StatusUpdateButton } from './quick-actions/StatusUpdateButton';
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
  Target,
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

  const calculateMatchScore = () => {
    if (!application.job || !application.candidate) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Experience match (30 points)
    if (application.candidate.experience !== undefined) {
      score += Math.min(30, application.candidate.experience * 3);
    }
    
    // Location match (20 points)
    if (application.candidate.location && application.job.location) {
      if (application.candidate.location.toLowerCase().includes(application.job.location.toLowerCase()) ||
          application.job.location.toLowerCase().includes(application.candidate.location.toLowerCase())) {
        score += 20;
      }
    }
    
    // Skills match (50 points)
    if (application.candidate.skills && application.job.tech_stack) {
      const candidateSkills = application.candidate.skills.toLowerCase().split(',').map(s => s.trim());
      const jobSkills = application.job.tech_stack.map(s => s.toLowerCase());
      const matchingSkills = candidateSkills.filter(skill => 
        jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
      );
      score += Math.min(50, (matchingSkills.length / jobSkills.length) * 50);
    }
    
    return Math.round(Math.min(score, maxScore));
  };

  const matchScore = calculateMatchScore();

  const handleStatusUpdate = async () => {
    if (newStatus && newStatus !== application.status) {
      await onUpdateStatus(application.id, newStatus, statusNotes);
      setNewStatus('');
      setStatusNotes('');
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* ... keep existing code (overview tab content) */}
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              {/* ... keep existing code (documents tab content) */}
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6 mt-6">
              {/* ... keep existing code (assessment tab content) */}
            </TabsContent>

            <TabsContent value="actions" className="space-y-6 mt-6">
              {/* ... keep existing code (actions tab content) */}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
