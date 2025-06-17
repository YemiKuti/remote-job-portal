
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ViewProfileButtonProps {
  candidateId: string | undefined;
  candidateName: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  className?: string;
}

export const ViewProfileButton: React.FC<ViewProfileButtonProps> = ({
  candidateId,
  candidateName,
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  const handleViewProfile = () => {
    console.log('ViewProfileButton: Attempting to view profile for candidateId:', candidateId);
    
    if (!candidateId) {
      console.error('ViewProfileButton: No candidate ID provided');
      toast.error('Candidate profile not available');
      return;
    }
    
    // Validate that candidateId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(candidateId)) {
      console.error('ViewProfileButton: Invalid candidate ID format:', candidateId);
      toast.error('Invalid candidate profile ID');
      return;
    }
    
    try {
      const profileUrl = `/user/${candidateId}`;
      console.log('ViewProfileButton: Opening profile URL:', profileUrl);
      
      // Open the candidate's public profile page in a new tab
      window.open(profileUrl, '_blank');
      
      toast.success(`Opening ${candidateName}'s profile`);
    } catch (error) {
      console.error('ViewProfileButton: Error opening profile:', error);
      toast.error('Failed to open candidate profile');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleViewProfile}
      disabled={!candidateId}
    >
      <Eye className="h-4 w-4 mr-2" />
      View Profile
    </Button>
  );
};
