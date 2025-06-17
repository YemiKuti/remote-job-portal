
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

interface ResumeDownloadButtonProps {
  resume: Resume | null;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  className?: string;
}

export const ResumeDownloadButton: React.FC<ResumeDownloadButtonProps> = ({
  resume,
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadResume = async () => {
    if (!resume?.file_path) {
      toast.error('Resume file not available');
      return;
    }

    setDownloading(true);
    try {
      // Create a signed URL for secure download
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(resume.file_path, 300); // 5 minutes expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        toast.error('Failed to access resume file');
        return;
      }

      if (!data?.signedUrl) {
        toast.error('Unable to generate download link');
        return;
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = resume.name || 'resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Resume download started');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    }
    setDownloading(false);
  };

  if (!resume) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
      >
        <FileText className="h-4 w-4 mr-2" />
        No Resume
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownloadResume}
      disabled={downloading}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Download
    </Button>
  );
};
