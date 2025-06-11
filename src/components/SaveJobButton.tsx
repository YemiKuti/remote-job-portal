
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { cn } from '@/lib/utils';

interface SaveJobButtonProps {
  jobId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

const SaveJobButton = ({ 
  jobId, 
  variant = 'ghost', 
  size = 'sm',
  showText = true,
  className 
}: SaveJobButtonProps) => {
  const { user } = useAuth();
  const { isJobSaved, handleToggleSave } = useSavedJobs();
  const [isLoading, setIsLoading] = useState(false);

  const saved = isJobSaved(jobId);
  const isCandidate = user?.user_metadata?.role === 'candidate';

  if (!user || !isCandidate) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    await handleToggleSave(jobId);
    setIsLoading(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 transition-colors",
        saved && "text-job-green hover:text-job-darkGreen",
        className
      )}
    >
      <Bookmark 
        className={cn(
          "h-4 w-4 transition-all",
          saved ? "fill-current" : "fill-none"
        )} 
      />
      {showText && (
        <span className="text-sm">
          {isLoading ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
};

export default SaveJobButton;
