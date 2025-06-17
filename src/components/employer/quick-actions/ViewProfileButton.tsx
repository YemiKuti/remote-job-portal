
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
    if (!candidateId) {
      toast.error('Candidate profile not available');
      return;
    }
    
    // Open the candidate's public profile page in a new tab
    window.open(`/user/${candidateId}`, '_blank');
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
